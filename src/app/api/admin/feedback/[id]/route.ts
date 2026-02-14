import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

// [Template] — Admin feedback detail API. Update status and admin response for a feedback ticket.

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const { status, adminResponse } = body;

  if (status && !["open", "resolved"].includes(status)) {
    return NextResponse.json(
      { error: "Status must be 'open' or 'resolved'" },
      { status: 400 },
    );
  }

  const data: Record<string, string | null> = {};
  if (status) data.status = status;
  if (adminResponse !== undefined) data.adminResponse = adminResponse;

  const updated = await prisma.feedback.update({
    where: { id },
    data,
  });

  return NextResponse.json(updated);
}
