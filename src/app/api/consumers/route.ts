import { NextRequest, NextResponse } from "next/server";
import { getSessionWithIds } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { checkProviderSubscription } from "@/lib/subscription";

// [Template:Domain] — CRUD list/create for primary entity. Replace "consumers" with your domain entity (clients, patients, etc.).

export async function GET() {
  const session = await getSessionWithIds();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any).role;
  const providerId = (session.user as any).providerId;

  if (role === "PROVIDER" && providerId) {
    const consumers = await prisma.consumer.findMany({
      where: { providerId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            preferredContact: true,
            passwordHash: true, // used to check if consumer has logged in
          },
        },
        parent: {
          select: {
            name: true,
            email: true,
            phone: true,
            preferredContact: true,
          },
        },
      },
      orderBy: { user: { name: "asc" } },
    });

    // Map to hide passwordHash but expose whether they have an account
    const result = consumers.map((s) => ({
      ...s,
      hasAccount: !!s.user.passwordHash,
      user: {
        name: s.user.name,
        email: s.user.email,
        phone: s.user.phone,
        preferredContact: s.user.preferredContact,
      },
    }));

    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// Provider can add a consumer directly (creates a placeholder User + Consumer record)
// Optionally also creates a schedule of bookings
export async function POST(req: NextRequest) {
  const session = await getSessionWithIds();
  if (!session?.user || (session.user as any).role !== "PROVIDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providerId = (session.user as any).providerId;

  // Subscription gate: block adding consumers if subscription required
  const subCheck = await checkProviderSubscription(providerId);
  if (subCheck.needsSubscription) {
    return NextResponse.json(
      { error: subCheck.reason || "Subscription required to add more consumers" },
      { status: 402 }
    );
  }

  const body = await req.json();
  const {
    name,
    email: rawEmail,
    phone,
    serviceType,
    bookingDuration,
    rate,
    address,
    notes,
    // Schedule fields (optional)
    bookingDayOfWeek,
    bookingTime,
    startDate,
    numberOfBookings,
    timezone,
  } = body;
  const email = rawEmail?.toLowerCase().trim();

  if (!name || !email) {
    return NextResponse.json(
      { error: "Name and email are required" },
      { status: 400 }
    );
  }

  // Check if a user with this email already exists
  let user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    // Check if they're already a consumer of this provider
    const existingConsumer = await prisma.consumer.findFirst({
      where: { userId: user.id, providerId },
    });
    if (existingConsumer) {
      return NextResponse.json(
        { error: "This consumer is already on your roster" },
        { status: 409 }
      );
    }
  } else {
    // Create a placeholder user (no password yet — they'll set one when they accept the invite)
    user = await prisma.user.create({
      data: {
        email,
        name,
        role: "CONSUMER",
        phone: phone || null,
        // No passwordHash — they can't log in until they accept an invite
      },
    });
  }

  const duration = bookingDuration || 30;

  const consumer = await prisma.consumer.create({
    data: {
      userId: user.id,
      providerId,
      serviceType: serviceType || "General",
      bookingDuration: duration,
      pricePerUnit: rate !== undefined && rate !== null && rate !== "" ? parseFloat(rate) : null,
      address: address || null,
      notes: notes || null,
    },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  });

  // If schedule fields are provided, create the bookings
  let bookingsCreated = 0;
  if (bookingDayOfWeek !== undefined && bookingDayOfWeek !== "" &&
      bookingTime && startDate && numberOfBookings) {

    const dayOfWeek = parseInt(bookingDayOfWeek);
    const numBookings = parseInt(numberOfBookings);
    const [hours, minutes] = bookingTime.split(":").map(Number);
    const tz = timezone || "America/Chicago";

    // Parse start date at noon to avoid date-shift issues
    const start = new Date(startDate + "T12:00:00");
    let currentDate = new Date(start);

    // Find the first occurrence of the target day of week
    while (currentDate.getDay() !== dayOfWeek) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Helper: convert a local time in a given IANA timezone to a UTC Date.
    // Works by treating the desired time as UTC, checking what that instant
    // looks like in the target timezone, then adjusting by the difference.
    function toUTC(date: Date, h: number, m: number, tzName: string): Date {
      const y = date.getFullYear();
      const mo = date.getMonth();
      const d = date.getDate();
      const guessUTC = Date.UTC(y, mo, d, h, m, 0);
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: tzName,
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: false,
      }).formatToParts(new Date(guessUTC));
      const get = (type: string) =>
        parseInt(parts.find((p) => p.type === type)?.value || "0");
      const tzH = get("hour") === 24 ? 0 : get("hour");
      const tzAsUTC = Date.UTC(get("year"), get("month") - 1, get("day"), tzH, get("minute"), 0);
      return new Date(guessUTC - (tzAsUTC - guessUTC));
    }

    const bookingData = [];
    for (let i = 0; i < numBookings; i++) {
      const bookingStart = toUTC(currentDate, hours, minutes, tz);
      const bookingEnd = new Date(bookingStart.getTime() + duration * 60 * 1000);

      bookingData.push({
        consumerId: consumer.id,
        providerId,
        startTime: bookingStart,
        endTime: bookingEnd,
        status: "scheduled",
      });

      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7);
    }

    await prisma.booking.createMany({ data: bookingData });
    bookingsCreated = numBookings;
  }

  return NextResponse.json({ ...consumer, bookingsCreated });
}
