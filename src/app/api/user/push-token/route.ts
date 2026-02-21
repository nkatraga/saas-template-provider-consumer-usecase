import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/admin";

// [Template] -- Stores/removes Expo push notification token on the User record.
// Used by mobile clients to register for push notifications.

export async function POST(req: Request) {
  try {
    const { error, user } = await requireAuth();
    if (error) return error;

    const { token } = await req.json();
    if (!token) {
      return NextResponse.json(
        { error: "Push token is required" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user!.id },
      data: { expoPushToken: token },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Push token error:", error);
    return NextResponse.json(
      { error: "Failed to save push token" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const { error, user } = await requireAuth();
    if (error) return error;

    await prisma.user.update({
      where: { id: user!.id },
      data: { expoPushToken: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Push token delete error:", error);
    return NextResponse.json(
      { error: "Failed to remove push token" },
      { status: 500 }
    );
  }
}
