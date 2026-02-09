import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, buildReminderEmail } from "@/lib/email";
import { format } from "date-fns";

// [Template] — Cron job endpoint for scheduled tasks. Called by Vercel Cron or external scheduler.

function verifyCron(req: Request): boolean {
  // Vercel Cron sends the secret in the Authorization header
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || process.env.NEXTAUTH_SECRET;
  return authHeader === `Bearer ${cronSecret}`;
}

// GET: called by Vercel Cron (every 15 min via vercel.json)
export async function GET(req: Request) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return processReminders();
}

// POST: can also be called manually
export async function POST(req: Request) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return processReminders();
}

async function processReminders() {

  const now = new Date();

  // Find unsent reminders that are due
  const dueReminders = await prisma.reminder.findMany({
    where: {
      sentAt: null,
      scheduledFor: { lte: now },
    },
    include: {
      booking: {
        include: {
          provider: { include: { user: true, settings: true } },
        },
      },
      consumer: {
        include: {
          user: true,
          parent: true,
        },
      },
    },
    take: 50, // Process in batches
  });

  let sent = 0;
  let failed = 0;

  for (const reminder of dueReminders) {
    // Skip if reminders are disabled for this provider
    if (!reminder.booking.provider.settings?.reminderEnabled) {
      await prisma.reminder.update({
        where: { id: reminder.id },
        data: { sentAt: now },
      });
      continue;
    }

    const recipientEmail =
      reminder.consumer.parent?.email ?? reminder.consumer.user.email;
    const consumerName = reminder.consumer.user.name;
    const providerName = reminder.booking.provider.user.name;
    const bookingDate = format(reminder.booking.startTime, "EEEE, MMMM d, yyyy");
    const bookingTime = format(reminder.booking.startTime, "h:mm a");
    const isExchangeped = reminder.booking.status === "exchanged";

    const result = await sendEmail({
      to: recipientEmail,
      subject: `Booking Reminder: ${bookingDate} at ${bookingTime}`,
      html: buildReminderEmail(
        consumerName,
        bookingDate,
        bookingTime,
        providerName,
        isExchangeped
      ),
    });

    if (result.success) {
      await prisma.reminder.update({
        where: { id: reminder.id },
        data: { sentAt: now },
      });
      sent++;
    } else {
      failed++;
    }
  }

  return NextResponse.json({
    processed: dueReminders.length,
    sent,
    failed,
  });
}
