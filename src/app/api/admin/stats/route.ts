import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
// [Template] — Platform analytics endpoint. Aggregates counts and metrics for admin dashboard.

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const now = new Date();

  const [providers, consumers, scheduledBookings, pastBookings, exchanges, openFeedback] = await Promise.all([
    prisma.provider.count({ where: { user: { isAdmin: false } } }),
    prisma.consumer.count(),
    prisma.booking.count({ where: { startTime: { gte: now } } }),
    prisma.booking.count({ where: { startTime: { lt: now } } }),
    prisma.exchange.count(),
    prisma.feedback.count({ where: { status: "open" } }),
  ]);

  return NextResponse.json({ providers, consumers, scheduledBookings, pastBookings, exchanges, openFeedback });
}
