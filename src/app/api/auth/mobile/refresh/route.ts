import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify, SignJWT } from "jose";

// [Template] -- Refreshes JWT access tokens for mobile clients.
// Accepts a refresh token and returns new access + refresh tokens.

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

export async function POST(req: Request) {
  try {
    const { refreshToken } = await req.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token is required" },
        { status: 400 }
      );
    }

    // Verify the refresh token
    let payload;
    try {
      const result = await jwtVerify(refreshToken, secret);
      payload = result.payload;
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired refresh token" },
        { status: 401 }
      );
    }

    if (payload.type !== "refresh") {
      return NextResponse.json(
        { error: "Invalid token type" },
        { status: 401 }
      );
    }

    // Verify user still exists and fetch fresh profile data
    const user = await prisma.user.findUnique({
      where: { id: payload.sub as string },
      include: { providerProfile: true, consumerProfiles: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 401 }
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

    const accessToken = await new SignJWT({ ...jwtPayload, type: "access" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(secret);

    const newRefreshToken = await new SignJWT({ ...jwtPayload, type: "refresh" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(secret);

    return NextResponse.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Token refresh failed" },
      { status: 500 }
    );
  }
}
