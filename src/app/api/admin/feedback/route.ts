import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

// [Template] — Admin feedback API. List all feedback with user info, filter by category/status.

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const status = searchParams.get("status");

  const where: Record<string, string> = {};
  if (category) where.category = category;
  if (status) where.status = status;

  const feedbackList = await prisma.feedback.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = feedbackList.map((f) => ({
    id: f.id,
    userName: f.user.name,
    userEmail: f.user.email,
    category: f.category,
    message: f.message,
    status: f.status,
    adminResponse: f.adminResponse,
    createdAt: f.createdAt,
  }));

  return NextResponse.json(rows);
}
