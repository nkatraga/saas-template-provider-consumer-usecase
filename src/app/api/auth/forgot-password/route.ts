import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail, buildPasswordResetEmail } from "@/lib/email";

// [Template] — Password reset request. Generates reset token and sends email.
export async function POST(req: NextRequest) {
  try {
    const { email: rawEmail } = await req.json();
    const email = rawEmail?.toLowerCase().trim();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const token = randomUUID();
      const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: token,
          passwordResetExpiry: expiry,
        },
      });

      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const resetUrl = `${baseUrl}/auth/reset-password/${token}`;

      const result = await sendEmail({
        to: email,
        subject: "Reset Your Password - AppName",
        html: buildPasswordResetEmail(resetUrl),
      });

      if (!result.success) {
        return NextResponse.json(
          { error: "Something went wrong, please try again" },
          { status: 500 }
        );
      }
    }

    // Always return success to avoid revealing whether the email exists
    return NextResponse.json({
      message: "If an account exists with that email, we've sent a reset link.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
