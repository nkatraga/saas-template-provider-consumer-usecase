import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
// [Template] — Platform settings endpoint. GET/PUT for global configuration (admin only).

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const settings = await prisma.appSettings.upsert({
    where: { id: "singleton" },
    create: {},
    update: {},
  });

  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const { paymentsEnabled, monthlyPrice, yearlyPrice, freeConsumerLimit } = body;

  const settings = await prisma.appSettings.upsert({
    where: { id: "singleton" },
    create: {
      ...(paymentsEnabled !== undefined && { paymentsEnabled }),
      ...(monthlyPrice !== undefined && { monthlyPrice: Number(monthlyPrice) }),
      ...(yearlyPrice !== undefined && { yearlyPrice: Number(yearlyPrice) }),
      ...(freeConsumerLimit !== undefined && { freeConsumerLimit: Number(freeConsumerLimit) }),
    },
    update: {
      ...(paymentsEnabled !== undefined && { paymentsEnabled }),
      ...(monthlyPrice !== undefined && { monthlyPrice: Number(monthlyPrice) }),
      ...(yearlyPrice !== undefined && { yearlyPrice: Number(yearlyPrice) }),
      ...(freeConsumerLimit !== undefined && { freeConsumerLimit: Number(freeConsumerLimit) }),
    },
  });

  return NextResponse.json(settings);
}
