import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, buildVerificationEmail } from "@/lib/email";
import crypto from "crypto";

// [Template] — Resend verification email. Rate-limited to prevent abuse.
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ success: true });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        emailVerificationExpiry: true,
        role: true,
      },
    });

    // Don't leak whether the email exists
    if (!user || user.role !== "PROVIDER" || user.emailVerified) {
      return NextResponse.json({ success: true });
    }

    // Rate limit: only resend if previous token was created >1 minute ago
    // Token expiry is set to 24h from creation, so creation time = expiry - 24h
    if (user.emailVerificationExpiry) {
      const tokenCreatedAt = new Date(
        user.emailVerificationExpiry.getTime() - 24 * 60 * 60 * 1000
      );
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      if (tokenCreatedAt > oneMinuteAgo) {
        return NextResponse.json({
          success: false,
          error: "Please wait at least 1 minute before requesting another email.",
        });
      }
    }

    const token = crypto.randomUUID();
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: token,
        emailVerificationExpiry: expiry,
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verifyUrl = `${baseUrl}/auth/verify-email/${token}`;
    await sendEmail({
      to: user.email,
      subject: "Verify your AppName account",
      html: buildVerificationEmail(user.name, verifyUrl),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json({ success: true });
  }
}
