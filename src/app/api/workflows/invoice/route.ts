import { NextRequest, NextResponse } from "next/server";
import { getSessionWithIds } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { sendEmail, buildInvoiceEmail } from "@/lib/email";

// [Template:Domain] — Document generation endpoint. Generates domain-specific documents (invoices, reports, etc.).

export async function POST(req: NextRequest) {
  const session = await getSessionWithIds();
  if (!session?.user || (session.user as any).role !== "PROVIDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providerId = (session.user as any).providerId;
  const body = await req.json();
  const { consumerId, startDate, endDate, action, timeZone } = body;

  if (!consumerId || !startDate || !endDate) {
    return NextResponse.json(
      { error: "consumerId, startDate, and endDate are required" },
      { status: 400 }
    );
  }

  // Verify consumer belongs to this provider
  const consumer = await prisma.consumer.findFirst({
    where: { id: consumerId, providerId },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!consumer) {
    return NextResponse.json({ error: "Consumer not found" }, { status: 404 });
  }

  // Parse dates — append T00:00:00 and T23:59:59 to get full day range
  const from = new Date(startDate + "T00:00:00");
  const to = new Date(endDate + "T23:59:59");

  // Query bookings in date range (scheduled or exchanged, not cancelled)
  const bookings = await prisma.booking.findMany({
    where: {
      consumerId,
      providerId,
      startTime: { gte: from },
      endTime: { lte: to },
      status: { in: ["scheduled", "exchanged"] },
    },
    orderBy: { startTime: "asc" },
  });

  const rate = consumer.pricePerUnit;
  const totalBookings = bookings.length;
  const totalAmount = rate ? rate * totalBookings : null;

  // If action is "send", build the invoice email and send it
  if (action === "send") {
    if (!rate || totalBookings === 0) {
      return NextResponse.json({ error: "No bookings or rate not set" }, { status: 400 });
    }

    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      select: {
        brandAccentColor: true,
        brandFooterText: true,
        brandLogoUrl: true,
        businessName: true,
        user: { select: { name: true } },
      },
    });

    const html = buildInvoiceEmail(
      {
        logoUrl: provider?.brandLogoUrl,
        accentColor: provider?.brandAccentColor || "#e8913a",
        footerText: provider?.brandFooterText,
      },
      {
        providerName: provider?.user.name || "Your Provider",
        businessName: provider?.businessName || "Business",
        consumerName: consumer.user.name,
        bookings: bookings.map((l) => ({
          startTime: l.startTime,
          endTime: l.endTime,
          status: l.status,
        })),
        pricePerUnit: rate,
        bookingDuration: consumer.bookingDuration,
        totalBookings,
        totalAmount: totalAmount!,
        timeZone,
      }
    );

    const result = await sendEmail({
      to: consumer.user.email,
      subject: `Invoice — ${totalBookings} booking${totalBookings !== 1 ? "s" : ""}`,
      html,
    });

    if (result.success) {
      return NextResponse.json({ sent: true });
    } else {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }
  }

  return NextResponse.json({
    consumerName: consumer.user.name,
    consumerEmail: consumer.user.email,
    bookings: bookings.map((l) => ({
      id: l.id,
      startTime: l.startTime,
      endTime: l.endTime,
      status: l.status,
    })),
    rate,
    bookingDuration: consumer.bookingDuration,
    totalBookings,
    totalAmount,
  });
}
