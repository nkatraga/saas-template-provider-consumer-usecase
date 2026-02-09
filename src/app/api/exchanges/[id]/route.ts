import { NextRequest, NextResponse } from "next/server";
import { getSessionWithIds } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// [Template:Domain] — State machine endpoint (confirm/decline/cancel/approve). Handles multi-step approval workflows.

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionWithIds();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { action } = body; // confirm, decline, cancel, approve

  const exchange = await prisma.exchange.findUnique({
    where: { id },
    include: {
      originalBooking: {
        include: { provider: { include: { settings: true } } },
      },
      targetBooking: true,
      requester: { include: { user: true } },
      targetConsumer: { include: { user: true } },
    },
  });

  if (!exchange) {
    return NextResponse.json({ error: "Exchange not found" }, { status: 404 });
  }

  const role = (session.user as any).role;
  const consumerIds: string[] = (session.user as any).consumerIds || [];
  const providerId = (session.user as any).providerId;

  if (action === "confirm" && consumerIds.includes(exchange.targetConsumerId)) {
    const needsApproval =
      exchange.originalBooking.provider.settings?.requireProviderApproval ?? false;

    const updatedExchange = await prisma.exchange.update({
      where: { id },
      data: {
        targetConfirmed: true,
        status: needsApproval ? "pending" : "confirmed",
        ...(needsApproval ? {} : { providerApproved: true }),
      },
    });

    // If both confirmed and no approval needed, execute the exchange
    if (!needsApproval) {
      await executeExchange(exchange.id);
    }

    return NextResponse.json(updatedExchange);
  }

  if (action === "decline" && consumerIds.includes(exchange.targetConsumerId)) {
    const updatedExchange = await prisma.exchange.update({
      where: { id },
      data: { status: "declined" },
    });
    return NextResponse.json(updatedExchange);
  }

  if (action === "cancel" && consumerIds.includes(exchange.requesterId)) {
    const updatedExchange = await prisma.exchange.update({
      where: { id },
      data: { status: "cancelled" },
    });
    return NextResponse.json(updatedExchange);
  }

  if (
    action === "approve" &&
    role === "PROVIDER" &&
    providerId === exchange.originalBooking.providerId
  ) {
    const updatedExchange = await prisma.exchange.update({
      where: { id },
      data: { providerApproved: true, status: "confirmed" },
    });

    await executeExchange(exchange.id);
    return NextResponse.json(updatedExchange);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

async function executeExchange(exchangeId: string) {
  const exchange = await prisma.exchange.findUnique({
    where: { id: exchangeId },
    include: {
      originalBooking: true,
      targetBooking: true,
      requester: { include: { user: { select: { name: true } } } },
      targetConsumer: { include: { user: { select: { name: true } } } },
    },
  });

  if (!exchange) return;

  // Exchange the consumers on the two bookings
  await prisma.$transaction([
    prisma.booking.update({
      where: { id: exchange.originalBookingId },
      data: {
        consumerId: exchange.targetConsumerId,
        status: "exchanged",
      },
    }),
    prisma.booking.update({
      where: { id: exchange.targetBookingId },
      data: {
        consumerId: exchange.requesterId,
        status: "exchanged",
      },
    }),
  ]);

  // Create reminders for the exchanged bookings
  const dayBefore = (date: Date) => {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    return d;
  };
  const hoursBefore = (date: Date, hours: number) => {
    const d = new Date(date);
    d.setHours(d.getHours() - hours);
    return d;
  };

  // Reminders for requester (now at target booking time)
  await prisma.reminder.createMany({
    data: [
      {
        bookingId: exchange.targetBookingId,
        consumerId: exchange.requesterId,
        type: "day_before",
        scheduledFor: dayBefore(exchange.targetBooking.startTime),
      },
      {
        bookingId: exchange.targetBookingId,
        consumerId: exchange.requesterId,
        type: "hours_before",
        scheduledFor: hoursBefore(exchange.targetBooking.startTime, 2),
      },
    ],
  });

  // Reminders for target consumer (now at original booking time)
  await prisma.reminder.createMany({
    data: [
      {
        bookingId: exchange.originalBookingId,
        consumerId: exchange.targetConsumerId,
        type: "day_before",
        scheduledFor: dayBefore(exchange.originalBooking.startTime),
      },
      {
        bookingId: exchange.originalBookingId,
        consumerId: exchange.targetConsumerId,
        type: "hours_before",
        scheduledFor: hoursBefore(exchange.originalBooking.startTime, 2),
      },
    ],
  });

  // Remove duplicate bookings at the same time slots (if any)
  const providerId = exchange.originalBooking.providerId;
  try {
    for (const exchangeBooking of [exchange.originalBooking, exchange.targetBooking]) {
      const duplicates = await prisma.booking.findMany({
        where: {
          providerId,
          startTime: exchangeBooking.startTime,
          id: { not: exchangeBooking.id },
        },
      });

      for (const dup of duplicates) {
        await prisma.reminder.deleteMany({ where: { bookingId: dup.id } });
        await prisma.booking.delete({ where: { id: dup.id } });
      }
    }
  } catch (e) {
    console.error("Failed to clean up duplicate bookings for exchange:", e);
  }
}
