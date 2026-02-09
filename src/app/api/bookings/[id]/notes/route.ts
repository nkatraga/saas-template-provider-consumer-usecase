import { NextRequest, NextResponse } from "next/server";
import { getSessionWithIds } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// [Template:Domain] — Sub-resource update. Patches a single field on a parent entity.

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionWithIds();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const providerId = (session.user as any).providerId;
  const consumerIds: string[] = (session.user as any).consumerIds || [];

  const body = await req.json();
  const notes = typeof body.notes === "string" ? body.notes.slice(0, 500) : "";

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (new Date(booking.startTime) > new Date()) {
    return NextResponse.json(
      { error: "Notes can only be added to past bookings" },
      { status: 400 }
    );
  }

  if (providerId && providerId === booking.providerId) {
    const updated = await prisma.booking.update({
      where: { id },
      data: { providerNotes: notes },
      select: { providerNotes: true },
    });
    return NextResponse.json(updated);
  }

  if (consumerIds.includes(booking.consumerId)) {
    const updated = await prisma.booking.update({
      where: { id },
      data: { consumerNotes: notes },
      select: { consumerNotes: true },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
