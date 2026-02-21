import { NextRequest, NextResponse } from "next/server";
import { getSessionWithIds } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// [Template:Domain] — Provider manages individual enrollment request. Auth required (PROVIDER role). GET single, PUT to update status.

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionWithIds();
  if (!session?.user || (session.user as any).role !== "PROVIDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const providerId = (session.user as any).providerId;

  try {
    const enrollmentRequest = await prisma.enrollmentRequest.findFirst({
      where: { id, providerId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        serviceType: true,
        message: true,
        status: true,
        providerNotes: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!enrollmentRequest) {
      return NextResponse.json(
        { error: "Enrollment request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(enrollmentRequest);
  } catch (error) {
    console.error("Enrollment request GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrollment request" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionWithIds();
  if (!session?.user || (session.user as any).role !== "PROVIDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const providerId = (session.user as any).providerId;

  try {
    // Verify the enrollment request belongs to this provider
    const existing = await prisma.enrollmentRequest.findFirst({
      where: { id, providerId },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Enrollment request not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { status, providerNotes } = body;

    // Validate status
    const validStatuses = ["pending", "accepted", "rejected"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (providerNotes !== undefined) updateData.providerNotes = providerNotes;

    const updatedRequest = await prisma.enrollmentRequest.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        serviceType: true,
        message: true,
        status: true,
        providerNotes: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Enrollment request PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update enrollment request" },
      { status: 500 }
    );
  }
}
