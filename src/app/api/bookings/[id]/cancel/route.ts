import { NextRequest, NextResponse } from "next/server";
import { getSessionWithIds } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// [Template:Domain] — Status transition endpoint. Moves entity through a state machine (active -> cancelled).

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionWithIds();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const user = session.user as any;
  const providerId = user.providerId;
  const consumerIds: string[] = user.consumerIds || [];

  const body = await req.json();
  const reason = typeof body.reason === "string" ? body.reason.slice(0, 500) : null;

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.status !== "scheduled") {
    return NextResponse.json(
      { error: "Only scheduled bookings can be cancelled" },
      { status: 400 }
    );
  }

  if (new Date(booking.startTime) <= new Date()) {
    return NextResponse.json(
      { error: "Cannot cancel a past booking" },
      { status: 400 }
    );
  }

  // Provider cancels immediately
  if (user.role === "PROVIDER" && providerId === booking.providerId) {
    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: "cancelled",
        cancelledBy: "PROVIDER",
        cancellationReason: reason,
      },
    });
    return NextResponse.json(updated);
  }

  // Consumer requests cancellation (pending provider approval)
  if (
    (user.role === "CONSUMER" || user.role === "PARENT") &&
    consumerIds.includes(booking.consumerId)
  ) {
    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: "cancel_pending",
        cancelledBy: "CONSUMER",
        cancellationReason: reason,
      },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionWithIds();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const user = session.user as any;

  if (user.role !== "PROVIDER" || !user.providerId) {
    return NextResponse.json({ error: "Only providers can approve/decline" }, { status: 403 });
  }

  const body = await req.json();
  const action = body.action;

  if (action !== "approve" && action !== "decline") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.status !== "cancel_pending") {
    return NextResponse.json(
      { error: "Booking is not pending cancellation" },
      { status: 400 }
    );
  }

  if (booking.providerId !== user.providerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (action === "approve") {
    const updated = await prisma.booking.update({
      where: { id },
      data: { status: "cancelled" },
    });
    return NextResponse.json(updated);
  }

  // decline — reset back to scheduled
  const updated = await prisma.booking.update({
    where: { id },
    data: {
      status: "scheduled",
      cancelledBy: null,
      cancellationReason: null,
    },
  });
  return NextResponse.json(updated);
}
