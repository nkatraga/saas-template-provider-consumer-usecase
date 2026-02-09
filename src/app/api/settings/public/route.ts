import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.appSettings.upsert({
    where: { id: "singleton" },
    create: {},
    update: {},
  });

  return NextResponse.json({
    paymentsEnabled: settings.paymentsEnabled,
    ...(settings.paymentsEnabled && {
      monthlyPrice: settings.monthlyPrice,
      yearlyPrice: settings.yearlyPrice,
      freeConsumerLimit: settings.freeConsumerLimit,
    }),
  });
}
