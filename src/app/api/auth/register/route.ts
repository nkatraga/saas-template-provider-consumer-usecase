import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmail, buildVerificationEmail } from "@/lib/email";
import crypto from "crypto";

// [Template] — User registration endpoint with email verification. Hashes password, creates user, sends verification email.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email: rawEmail, password, name, role, phone, businessName, serviceType } = body;
    const email = rawEmail?.toLowerCase().trim();

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["PROVIDER", "CONSUMER", "PARENT"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { email },
      include: { providerProfile: { include: { settings: true } } },
    });
    if (existing) {
      // If unverified provider with expired token, delete and allow re-registration
      const isUnverifiedProvider =
        existing.role === "PROVIDER" &&
        !existing.emailVerified &&
        existing.emailVerificationExpiry &&
        existing.emailVerificationExpiry < new Date();

      if (isUnverifiedProvider) {
        // Delete in correct order: settings → provider → user (cascade handles most)
        await prisma.user.delete({ where: { id: existing.id } });
      } else {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 409 }
        );
      }
    }

    const passwordHash = await hash(password, 12);

    // For providers, generate verification token
    const isProvider = role === "PROVIDER";
    const verificationToken = isProvider ? crypto.randomUUID() : undefined;
    const verificationExpiry = isProvider
      ? new Date(Date.now() + 24 * 60 * 60 * 1000)
      : undefined;

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role,
        phone: phone || null,
        emailVerified: !isProvider, // Consumers/parents are verified immediately
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry,
      },
    });

    // If provider, create provider profile with default settings
    if (isProvider) {
      const provider = await prisma.provider.create({
        data: {
          userId: user.id,
          businessName: businessName || "My Business",
        },
      });

      await prisma.providerSettings.create({
        data: { providerId: provider.id },
      });

      // Send verification email
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const verifyUrl = `${baseUrl}/auth/verify-email/${verificationToken}`;
      await sendEmail({
        to: email,
        subject: "Verify your AppName account",
        html: buildVerificationEmail(name, verifyUrl),
      });

      return NextResponse.json({
        success: true,
        requiresVerification: true,
      });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register" },
      { status: 500 }
    );
  }
}
