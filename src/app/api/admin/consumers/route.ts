import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
// [Template] — Admin sub-entity management. Lists entities across all tenants for platform-wide admin views.

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const consumers = await prisma.consumer.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          passwordHash: false,
        },
      },
      provider: {
        include: {
          user: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = consumers.map((s) => ({
    ...s,
    hasAccount: !!s.user,
    providerName: s.provider.user.name,
    businessName: s.provider.businessName,
  }));

  return NextResponse.json(result);
}
