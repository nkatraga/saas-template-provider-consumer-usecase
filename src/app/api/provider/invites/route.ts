import { NextRequest, NextResponse } from "next/server";
import { getSessionWithIds } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { sendEmail, buildInviteEmail } from "@/lib/email";

export async function GET() {
  const session = await getSessionWithIds();
  if (!session?.user || (session.user as any).role !== "PROVIDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providerId = (session.user as any).providerId;
  const invites = await prisma.invite.findMany({
    where: { providerId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(invites);
}

export async function POST(req: NextRequest) {
  const session = await getSessionWithIds();
  if (!session?.user || (session.user as any).role !== "PROVIDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providerId = (session.user as any).providerId;
  const userId = (session.user as any).id;
  const body = await req.json();
  const { email, role } = body;

  if (!email || !role) {
    return NextResponse.json(
      { error: "Email and role are required" },
      { status: 400 }
    );
  }

  if (!["CONSUMER", "PARENT"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    include: { user: true },
  });

  if (!provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  const token = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invite = await prisma.invite.create({
    data: {
      providerId,
      senderId: userId,
      recipientEmail: email,
      role,
      token,
      expiresAt,
    },
  });

  // Send invite email
  const inviteUrl = `${process.env.NEXTAUTH_URL}/auth/invite/${token}`;
  await sendEmail({
    to: email,
    subject: `Invitation to join ${provider.businessName}`,
    html: buildInviteEmail(
      provider.user.name,
      provider.businessName,
      inviteUrl,
      role
    ),
  });

  return NextResponse.json(invite);
}
