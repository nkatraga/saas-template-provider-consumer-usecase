import { NextRequest, NextResponse } from "next/server";
import { getSessionWithIds } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// [Template] — User settings endpoint. GET/PUT pattern for per-user configuration.

export async function GET() {
  const session = await getSessionWithIds();
  if (!session?.user || (session.user as any).role !== "PROVIDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providerId = (session.user as any).providerId;
  const settings = await prisma.providerSettings.findUnique({
    where: { providerId },
  });

  if (!settings) {
    return NextResponse.json({ error: "Settings not found" }, { status: 404 });
  }

  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const session = await getSessionWithIds();
  if (!session?.user || (session.user as any).role !== "PROVIDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providerId = (session.user as any).providerId;
  const body = await req.json();

  const allowedFields = [
    "showConsumerNames",
    "showContactEmail",
    "showContactPhone",
    "requireProviderApproval",
    "minAdvanceHours",
    "maxAdvanceDays",
    "allowCrossDayExchanges",
    "allowDifferentDuration",
    "reminderDayBefore",
    "reminderHoursBefore",
    "reminderEnabled",
    "exchangeInstructions",
    "paymentPolicy",
    "cancellationPolicy",
    "makeupPolicy",
    "providerCancellationPolicy",
    "additionalPolicies",
  ];

  const updateData: any = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  const settings = await prisma.providerSettings.update({
    where: { providerId },
    data: updateData,
  });

  return NextResponse.json(settings);
}
