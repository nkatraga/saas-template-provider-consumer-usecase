import { NextRequest, NextResponse } from "next/server";
import { getSessionWithIds } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// [Template:Domain] — CRUD get/update/delete for single entity. Standard REST pattern with ownership checks.

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

  const consumer = await prisma.consumer.findFirst({
    where: { id, providerId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
          preferredContact: true,
        },
      },
    },
  });

  if (!consumer) {
    return NextResponse.json({ error: "Consumer not found" }, { status: 404 });
  }

  return NextResponse.json(consumer);
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
  const body = await req.json();
  const { name, email, phone, serviceType, bookingDuration, rate, address, notes } = body;

  // Find the consumer and verify ownership
  const consumer = await prisma.consumer.findFirst({
    where: { id, providerId },
    include: { user: true },
  });

  if (!consumer) {
    return NextResponse.json({ error: "Consumer not found" }, { status: 404 });
  }

  // Update user info
  if (name || email || phone !== undefined) {
    const userUpdate: any = {};
    if (name) userUpdate.name = name;
    if (email) userUpdate.email = email.toLowerCase().trim();
    if (phone !== undefined) userUpdate.phone = phone || null;

    await prisma.user.update({
      where: { id: consumer.userId },
      data: userUpdate,
    });
  }

  // Update consumer info
  const consumerUpdate: any = {};
  if (serviceType) consumerUpdate.serviceType = serviceType;
  if (bookingDuration) consumerUpdate.bookingDuration = bookingDuration;
  if (rate !== undefined) consumerUpdate.pricePerUnit = rate === null || rate === "" ? null : parseFloat(rate);
  if (address !== undefined) consumerUpdate.address = address || null;
  if (notes !== undefined) consumerUpdate.notes = notes || null;

  const updatedConsumer = await prisma.consumer.update({
    where: { id },
    data: consumerUpdate,
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
          preferredContact: true,
        },
      },
    },
  });

  return NextResponse.json(updatedConsumer);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionWithIds();
  if (!session?.user || (session.user as any).role !== "PROVIDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const providerId = (session.user as any).providerId;

  const consumer = await prisma.consumer.findFirst({
    where: { id, providerId },
  });

  if (!consumer) {
    return NextResponse.json({ error: "Consumer not found" }, { status: 404 });
  }

  // Delete the consumer (bookings will cascade or remain orphaned based on schema)
  await prisma.consumer.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
