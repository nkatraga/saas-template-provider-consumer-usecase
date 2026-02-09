import { NextRequest, NextResponse } from "next/server";
import { getSessionWithIds } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSessionWithIds();
  if (!session?.user || (session.user as any).role !== "PROVIDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providerId = (session.user as any).providerId;
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    select: {
      brandLogoUrl: true,
      brandAccentColor: true,
      brandFooterText: true,
    },
  });

  if (!provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  return NextResponse.json(provider);
}

export async function PUT(req: NextRequest) {
  const session = await getSessionWithIds();
  if (!session?.user || (session.user as any).role !== "PROVIDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providerId = (session.user as any).providerId;
  const body = await req.json();
  const { brandLogoUrl, brandAccentColor, brandFooterText } = body;

  const updated = await prisma.provider.update({
    where: { id: providerId },
    data: {
      brandLogoUrl: brandLogoUrl ?? undefined,
      brandAccentColor: brandAccentColor ?? undefined,
      brandFooterText: brandFooterText ?? undefined,
    },
    select: {
      brandLogoUrl: true,
      brandAccentColor: true,
      brandFooterText: true,
    },
  });

  return NextResponse.json(updated);
}
