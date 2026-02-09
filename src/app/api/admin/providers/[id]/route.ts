import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
// [Template] — Admin entity management. GET/PUT/DELETE single entity with admin authorization.

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const provider = await prisma.provider.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          emailVerified: true,
          createdAt: true,
        },
      },
      settings: true,
      consumers: {
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
      },
    },
  });

  if (!provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  return NextResponse.json(provider);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  const provider = await prisma.provider.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  // Update user fields
  const { name, email, phone, businessName, subscriptionExempt } = body;

  if (name !== undefined || email !== undefined || phone !== undefined) {
    await prisma.user.update({
      where: { id: provider.userId },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email: email.toLowerCase().trim() }),
        ...(phone !== undefined && { phone }),
      },
    });
  }

  if (businessName !== undefined || subscriptionExempt !== undefined) {
    await prisma.provider.update({
      where: { id },
      data: {
        ...(businessName !== undefined && { businessName }),
        ...(subscriptionExempt !== undefined && { subscriptionExempt }),
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

  const provider = await prisma.provider.findUnique({
    where: { id },
    include: { consumers: true },
  });

  if (!provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  // Clean up exchanges first (no cascade on Exchange FK)
  const consumerIds = provider.consumers.map((s) => s.id);
  if (consumerIds.length > 0) {
    await prisma.exchange.deleteMany({
      where: {
        OR: [
          { requesterId: { in: consumerIds } },
          { targetConsumerId: { in: consumerIds } },
        ],
      },
    });
  }

  // Delete the User — cascades to Provider, Consumers, Bookings, etc.
  await prisma.user.delete({
    where: { id: provider.userId },
  });

  return NextResponse.json({ success: true });
}
