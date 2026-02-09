import { NextRequest, NextResponse } from "next/server";
import { getSessionWithIds } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// [Template:Domain] — Request workflow: create a pending request between two parties. Replace with your domain's matching/request logic.

export async function GET() {
  const session = await getSessionWithIds();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any).role;
  const consumerIds: string[] = (session.user as any).consumerIds || [];
  const providerId = (session.user as any).providerId;

  if (role === "PROVIDER" && providerId) {
    // Providers see all exchanges for their consumers
    const exchanges = await prisma.exchange.findMany({
      where: {
        originalBooking: { providerId },
      },
      include: {
        requester: { include: { user: { select: { name: true } } } },
        targetConsumer: { include: { user: { select: { name: true } } } },
        originalBooking: true,
        targetBooking: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(exchanges);
  }

  if (consumerIds.length > 0) {
    const exchanges = await prisma.exchange.findMany({
      where: {
        OR: [
          { requesterId: { in: consumerIds } },
          { targetConsumerId: { in: consumerIds } },
        ],
      },
      include: {
        requester: { include: { user: { select: { name: true, email: true } } } },
        targetConsumer: { include: { user: { select: { name: true, email: true } } } },
        originalBooking: true,
        targetBooking: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(exchanges);
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  const session = await getSessionWithIds();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const consumerIds: string[] = (session.user as any).consumerIds || [];
  if (consumerIds.length === 0) {
    return NextResponse.json({ error: "Not a consumer" }, { status: 403 });
  }

  const body = await req.json();
  const { myBookingId, targetBookingId, message } = body;

  if (!myBookingId || !targetBookingId) {
    return NextResponse.json(
      { error: "Both booking IDs are required" },
      { status: 400 }
    );
  }

  // Validate bookings
  const myBooking = await prisma.booking.findFirst({
    where: { id: myBookingId, consumerId: { in: consumerIds }, status: "scheduled" },
    include: { provider: { include: { settings: true } } },
  });

  if (!myBooking) {
    return NextResponse.json(
      { error: "Your booking not found or not eligible" },
      { status: 404 }
    );
  }

  const targetBooking = await prisma.booking.findFirst({
    where: { id: targetBookingId, status: "scheduled" },
  });

  if (!targetBooking) {
    return NextResponse.json(
      { error: "Target booking not found or not eligible" },
      { status: 404 }
    );
  }

  // Ensure both bookings belong to the same provider
  if (myBooking.providerId !== targetBooking.providerId) {
    return NextResponse.json(
      { error: "Exchanges can only be made within the same provider" },
      { status: 400 }
    );
  }

  // Check provider settings constraints
  const settings = myBooking.provider.settings;
  if (settings) {
    const now = new Date();
    const hoursUntilBooking =
      (myBooking.startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilBooking < settings.minAdvanceHours) {
      return NextResponse.json(
        {
          error: `Exchanges must be requested at least ${settings.minAdvanceHours} hours in advance`,
        },
        { status: 400 }
      );
    }

    if (!settings.allowCrossDayExchanges) {
      const myDay = new Date(myBooking.startTime).getDay();
      const targetDay = new Date(targetBooking.startTime).getDay();
      if (myDay !== targetDay) {
        return NextResponse.json(
          { error: "Cross-day exchanges are not allowed" },
          { status: 400 }
        );
      }
    }
  }

  // Check for existing pending exchange
  const existingExchange = await prisma.exchange.findFirst({
    where: {
      requesterId: myBooking.consumerId,
      originalBookingId: myBookingId,
      status: "pending",
    },
  });

  if (existingExchange) {
    return NextResponse.json(
      { error: "You already have a pending exchange for this booking" },
      { status: 409 }
    );
  }

  const exchange = await prisma.exchange.create({
    data: {
      requesterId: myBooking.consumerId,
      targetConsumerId: targetBooking.consumerId,
      originalBookingId: myBookingId,
      targetBookingId,
      requesterConfirmed: true,
      message: message || null,
    },
    include: {
      requester: { include: { user: { select: { name: true } } } },
      targetConsumer: { include: { user: { select: { name: true } } } },
      originalBooking: true,
      targetBooking: true,
    },
  });

  return NextResponse.json(exchange);
}
