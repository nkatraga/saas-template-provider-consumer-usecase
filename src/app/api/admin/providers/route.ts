import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
// [Template] — Admin CRUD with pagination. Lists and creates entities with admin-only access guard.

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const providers = await prisma.provider.findMany({
    where: {
      user: { isAdmin: false },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          emailVerified: true,
          createdAt: true,
        },
      },
      settings: true,
      _count: { select: { consumers: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(providers);
}
