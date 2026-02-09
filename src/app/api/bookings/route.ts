import { NextRequest, NextResponse } from "next/server";
import { getSessionWithIds } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// [Template:Domain] — Filtered list endpoint with date range and search. Replace with your domain's queryable resource.

export async function GET(req: NextRequest) {
  const session = await getSessionWithIds();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any).role;
  const providerId = (session.user as any).providerId;
  const consumerIds: string[] = (session.user as any).consumerIds || [];

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const past = searchParams.get("past") === "true";
  const search = searchParams.get("search");

  const dateFilter: any = {};
  if (past) {
    dateFilter.lt = new Date();
  } else {
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);
  }

  if (role === "PROVIDER" && providerId) {
    const where: any = {
      providerId,
      ...(past || from || to ? { startTime: dateFilter } : {}),
    };

    if (past && search) {
      where.consumer = {
        user: { name: { contains: search, mode: "insensitive" } },
      };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        consumer: {
          select: {
            id: true,
            serviceType: true,
            bookingDuration: true,
            alias: true,
            profileImageUrl: true,
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
                preferredContact: true,
              },
            },
          },
        },
        exchangesAsOriginal: {
          where: { status: "confirmed" },
          include: {
            requester: { include: { user: { select: { name: true } } } },
          },
        },
        exchangesAsTarget: {
          where: { status: "confirmed" },
          include: {
            targetConsumer: { include: { user: { select: { name: true } } } },
          },
        },
      },
      orderBy: { startTime: past ? "desc" : "asc" },
    });
    return NextResponse.json(bookings);
  }

  if ((role === "CONSUMER" || role === "PARENT") && consumerIds.length > 0) {
    // Get all consumer records with their provider info
    const consumers = await prisma.consumer.findMany({
      where: { id: { in: consumerIds } },
      include: {
        provider: {
          include: { settings: true, user: { select: { name: true } } },
        },
      },
    });

    if (consumers.length === 0) {
      return NextResponse.json({ error: "Consumer not found" }, { status: 404 });
    }

    const providerIds = consumers.map((s) => s.providerId);

    // Get this consumer's own bookings across all providers
    const myBookings = await prisma.booking.findMany({
      where: {
        consumerId: { in: consumerIds },
        ...(past
          ? {}
          : { status: { in: ["scheduled", "exchanged", "cancel_pending", "cancelled"] } }),
        ...(past || from || to ? { startTime: dateFilter } : {}),
      },
      include: {
        consumer: {
          select: {
            id: true,
            serviceType: true,
            bookingDuration: true,
            alias: true,
            profileImageUrl: true,
            user: { select: { name: true } },
          },
        },
        exchangesAsOriginal: {
          where: { status: { in: past ? ["confirmed"] : ["pending", "confirmed"] } },
          include: {
            requester: { include: { user: { select: { name: true } } } },
            targetConsumer: { include: { user: { select: { name: true } } } },
            targetBooking: { select: { startTime: true } },
          },
        },
        exchangesAsTarget: {
          where: { status: { in: past ? ["confirmed"] : ["pending", "confirmed"] } },
          include: {
            requester: { include: { user: { select: { name: true } } } },
            targetConsumer: { include: { user: { select: { name: true } } } },
            originalBooking: { select: { startTime: true } },
          },
        },
      },
      orderBy: { startTime: past ? "desc" : "asc" },
    });

    // Build providers array for frontend
    const providers = consumers.map((s) => ({
      id: s.provider.id,
      name: s.provider.user.name,
      alias: s.provider.alias,
      profileImageUrl: s.provider.profileImageUrl,
      businessName: s.provider.businessName,
      settings: s.provider.settings,
      consumerId: s.id,
    }));

    if (past) {
      return NextResponse.json({ myBookings, otherBookings: [], providers });
    }

    // Get other consumers' bookings (exchange candidates) across all enrolled providers
    // Use the first provider's settings as default for visibility
    const firstProvider = consumers[0];
    const settings = firstProvider.provider.settings;

    const otherBookings = await prisma.booking.findMany({
      where: {
        providerId: { in: providerIds },
        consumerId: { notIn: consumerIds },
        status: "scheduled",
        ...(from || to ? { startTime: dateFilter } : {}),
      },
      include: {
        consumer: {
          select: {
            id: true,
            serviceType: true,
            bookingDuration: true,
            alias: true,
            profileImageUrl: true,
            user: {
              select: {
                name: settings?.showConsumerNames ?? true,
                email: settings?.showContactEmail ?? true,
                phone: settings?.showContactPhone ?? false,
                preferredContact: true,
              },
            },
          },
        },
        exchangesAsOriginal: {
          where: { status: "pending" },
          include: {
            targetConsumer: { include: { user: { select: { name: true } } } },
            targetBooking: { select: { startTime: true } },
          },
        },
        exchangesAsTarget: {
          where: { status: "pending" },
          include: {
            requester: { include: { user: { select: { name: true } } } },
            originalBooking: { select: { startTime: true } },
          },
        },
      },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json({ myBookings, otherBookings, settings, providers });
  }

  // Parent: get bookings for all their children
  if (role === "PARENT") {
    const userId = (session.user as any).id;
    const children = await prisma.consumer.findMany({
      where: { parentId: userId },
    });

    const childIds = children.map((c) => c.id);
    const bookings = await prisma.booking.findMany({
      where: {
        consumerId: { in: childIds },
        ...(from || to ? { startTime: dateFilter } : {}),
      },
      include: {
        consumer: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json(bookings);
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  const session = await getSessionWithIds();
  if (!session?.user || (session.user as any).role !== "PROVIDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providerId = (session.user as any).providerId;
  const body = await req.json();
  const { consumerId, startTime, endTime } = body;

  if (!consumerId || !startTime || !endTime) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const booking = await prisma.booking.create({
    data: {
      consumerId,
      providerId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    },
  });

  return NextResponse.json(booking);
}
