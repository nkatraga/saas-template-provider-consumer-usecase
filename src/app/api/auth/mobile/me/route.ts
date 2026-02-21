import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/admin";

// [Template] -- Returns the current authenticated user from Bearer token or NextAuth session.
// Used by mobile clients to fetch user profile after login.

export async function GET() {
  try {
    const { error, user } = await requireAuth();
    if (error) return error;

    // Fetch fresh data from DB to include profile relations
    const dbUser = await prisma.user.findUnique({
      where: { id: user!.id },
      include: { providerProfile: true, consumerProfiles: true },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const profileImage =
      dbUser.providerProfile?.profileImageUrl ??
      dbUser.consumerProfiles.find((s) => s.profileImageUrl)
        ?.profileImageUrl ??
      null;

    return NextResponse.json({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        isAdmin: dbUser.isAdmin,
        providerId: dbUser.providerProfile?.id ?? null,
        consumerIds: dbUser.consumerProfiles.map((s) => s.id),
        profileImage,
      },
    });
  } catch (error) {
    console.error("Mobile me error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
