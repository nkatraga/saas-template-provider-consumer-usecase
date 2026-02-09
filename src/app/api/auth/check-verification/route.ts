import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// [Template] — Verification status check. Polls whether the user's email has been verified.
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ verified: true });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { emailVerified: true, role: true },
    });

    // Don't leak whether the email exists — only return unverified
    // for provider accounts that actually exist and are unverified
    if (user && user.role === "PROVIDER" && !user.emailVerified) {
      return NextResponse.json({ verified: false });
    }

    return NextResponse.json({ verified: true });
  } catch {
    return NextResponse.json({ verified: true });
  }
}
