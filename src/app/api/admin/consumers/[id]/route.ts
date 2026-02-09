import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
// [Template] — Admin single sub-entity management. GET/PUT/DELETE with admin authorization.

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const consumer = await prisma.consumer.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true },
      },
      provider: {
        include: {
          user: { select: { name: true } },
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
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  const consumer = await prisma.consumer.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!consumer) {
    return NextResponse.json({ error: "Consumer not found" }, { status: 404 });
  }

  // Update user fields
  const { name, email, phone, serviceType, bookingDuration } = body;

  if (name !== undefined || email !== undefined || phone !== undefined) {
    await prisma.user.update({
      where: { id: consumer.userId },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email: email.toLowerCase().trim() }),
        ...(phone !== undefined && { phone }),
      },
    });
  }

  if (serviceType !== undefined || bookingDuration !== undefined) {
    await prisma.consumer.update({
      where: { id },
      data: {
        ...(serviceType !== undefined && { serviceType }),
        ...(bookingDuration !== undefined && { bookingDuration: Number(bookingDuration) }),
      },
    });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const consumer = await prisma.consumer.findUnique({ where: { id } });

  if (!consumer) {
    return NextResponse.json({ error: "Consumer not found" }, { status: 404 });
  }

  // Clean up exchanges first (no cascade on Exchange FK)
  await prisma.exchange.deleteMany({
    where: {
      OR: [
        { requesterId: id },
        { targetConsumerId: id },
      ],
    },
  });

  // Delete the consumer record
  await prisma.consumer.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
