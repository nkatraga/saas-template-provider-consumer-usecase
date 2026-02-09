import { NextRequest, NextResponse } from "next/server";
import { getSessionWithIds } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// [Template:Domain] — Nested resource endpoint. Lists child entities (bookings) for a parent entity (consumer).

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionWithIds();
  if (!session?.user || (session.user as any).role !== "PROVIDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const providerId = (session.user as any).providerId;

  // Verify consumer belongs to this provider
  const consumer = await prisma.consumer.findFirst({
    where: { id, providerId },
  });

  if (!consumer) {
    return NextResponse.json({ error: "Consumer not found" }, { status: 404 });
  }

  const body = await req.json();
  const { bookingDayOfWeek, bookingTime, startDate, numberOfBookings, timezone, duration: requestedDuration } = body;

  if (bookingDayOfWeek === undefined || bookingDayOfWeek === "" || !bookingTime || !startDate || !numberOfBookings) {
    return NextResponse.json({ error: "All schedule fields are required" }, { status: 400 });
  }

  const dayOfWeek = parseInt(bookingDayOfWeek);
  const numBookings = parseInt(numberOfBookings);
  const [hours, minutes] = bookingTime.split(":").map(Number);
  const duration = requestedDuration || consumer.bookingDuration || 30;
  const tz = timezone || "America/Chicago";

  // Parse start date at noon to avoid date-shift issues
  const start = new Date(startDate + "T12:00:00");
  let currentDate = new Date(start);

  // Find the first occurrence of the target day of week
  while (currentDate.getDay() !== dayOfWeek) {
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Convert local time in a given IANA timezone to UTC
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

    currentDate.setDate(currentDate.getDate() + 7);
  }

  await prisma.booking.createMany({ data: bookingData });

  return NextResponse.json({ bookingsCreated: numBookings });
}
