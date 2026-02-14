import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";

// Mobile login endpoint that returns a JWT token (mirrors the capture app pattern).
// The web app uses NextAuth with cookie-based sessions; this endpoint supports
// Bearer token auth for the React Native mobile client.

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        providerProfile: true,
        consumerProfiles: true,
      },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValid = await compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Block unverified providers
    if (user.providerProfile && !user.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email before signing in" },
        { status: 403 }
      );
    }

    const profileImage =
      user.providerProfile?.profileImageUrl ??
      user.consumerProfiles.find((s) => s.profileImageUrl)?.profileImageUrl ??
      null;

    const jwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isAdmin: user.isAdmin,
      providerId: user.providerProfile?.id ?? null,
      consumerIds: user.consumerProfiles.map((s) => s.id),
      profileImage,
    };

    const token = await new SignJWT(jwtPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(secret);

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isAdmin: user.isAdmin,
        providerId: user.providerProfile?.id ?? null,
        consumerIds: user.consumerProfiles.map((s) => s.id),
        profileImage,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
