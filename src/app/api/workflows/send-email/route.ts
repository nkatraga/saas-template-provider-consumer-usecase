import { NextRequest, NextResponse } from "next/server";
import { getSessionWithIds } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { sendEmail, buildBrandedEmail } from "@/lib/email";

// [Template] — Workflow action endpoint. Triggered by user-configured automation rules.

export async function POST(req: NextRequest) {
  const session = await getSessionWithIds();
  if (!session?.user || (session.user as any).role !== "PROVIDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providerId = (session.user as any).providerId;
  const body = await req.json();
  const { consumerIds, subject, message, html: rawHtml } = body;

  if (!consumerIds?.length || !subject || (!message && !rawHtml)) {
    return NextResponse.json(
      { error: "consumerIds, subject, and message/html are required" },
      { status: 400 }
    );
  }

  // Fetch provider branding
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    select: {
      brandLogoUrl: true,
      brandAccentColor: true,
      brandFooterText: true,
      businessName: true,
      user: { select: { name: true } },
    },
  });

  if (!provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  // Fetch consumers
  const consumers = await prisma.consumer.findMany({
    where: { id: { in: consumerIds }, providerId },
    include: { user: { select: { email: true, name: true } } },
  });

  // Use raw HTML from rich text editor, or convert plain text to HTML paragraphs (legacy)
  const messageHtml = rawHtml
    ? rawHtml
    : message
        .split("\n")
        .filter((line: string) => line.trim())
        .map((line: string) => `<p style="margin: 0 0 12px 0; line-height: 1.5;">${line}</p>`)
        .join("");

  const html = buildBrandedEmail(
    {
      logoUrl: provider.brandLogoUrl,
      accentColor: provider.brandAccentColor || "#e8913a",
      footerText: provider.brandFooterText,
    },
    messageHtml
  );

  let sent = 0;
  let failed = 0;

  for (const consumer of consumers) {
    const result = await sendEmail({
      to: consumer.user.email,
      subject,
      html,
    });
    if (result.success) {
      sent++;
    } else {
      failed++;
    }
  }

  return NextResponse.json({ sent, failed });
}
