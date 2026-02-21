import { NextRequest, NextResponse } from "next/server";
import { getSessionWithIds } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// [Template:Domain] — Enrollment/inquiry request. Can be anonymous (name + email required) or authenticated (userId attached).

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: providerId } = await params;

  try {
    const body = await req.json();
    const { name, email, phone, serviceType, message } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Verify provider exists and has a published profile
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      select: {
        id: true,
        publicProfile: {
          select: { isPublished: true },
        },
      },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    if (!provider.publicProfile?.isPublished) {
      return NextResponse.json(
        { error: "This provider is not currently accepting enrollment requests" },
        { status: 400 }
      );
    }

    // Check if the user is authenticated and attach userId
    let userId: string | null = null;
    const session = await getSessionWithIds();
    if (session?.user) {
      userId = (session.user as any).id;
    }

    const enrollmentRequest = await prisma.enrollmentRequest.create({
      data: {
        providerId,
        userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        serviceType: serviceType || null,
        message: message?.trim() || null,
        status: "pending",
      },
      select: {
        id: true,
        name: true,
        email: true,
        serviceType: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(enrollmentRequest, { status: 201 });
  } catch (error) {
    console.error("Enrollment request error:", error);
    return NextResponse.json(
      { error: "Failed to create enrollment request" },
      { status: 500 }
    );
  }
}
