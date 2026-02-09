import { NextRequest, NextResponse } from "next/server";
import { getSessionWithIds } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSessionWithIds();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const consumerIds: string[] = (session.user as any).consumerIds || [];
  if (consumerIds.length === 0) {
    return NextResponse.json({ error: "Not a consumer" }, { status: 403 });
  }

  const consumers = await prisma.consumer.findMany({
    where: { id: { in: consumerIds } },
    select: {
      id: true,
      alias: true,
      profileImageUrl: true,
      serviceType: true,
      provider: {
        select: {
          id: true,
          businessName: true,
          alias: true,
          profileImageUrl: true,
          user: { select: { name: true, email: true, phone: true } },
          settings: {
            select: {
              exchangeInstructions: true,
              requireProviderApproval: true,
              minAdvanceHours: true,
              maxAdvanceDays: true,
              allowCrossDayExchanges: true,
              allowDifferentDuration: true,
              paymentPolicy: true,
              cancellationPolicy: true,
              makeupPolicy: true,
              providerCancellationPolicy: true,
              additionalPolicies: true,
            },
          },
        },
      },
      user: {
        select: { name: true, email: true, phone: true },
      },
    },
  });

  if (consumers.length === 0) {
    return NextResponse.json({ error: "Consumer not found" }, { status: 404 });
  }

  return NextResponse.json(consumers);
}

export async function PUT(req: NextRequest) {
  const session = await getSessionWithIds();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const consumerIds: string[] = (session.user as any).consumerIds || [];
  if (consumerIds.length === 0) {
    return NextResponse.json({ error: "Not a consumer" }, { status: 403 });
  }

  const body = await req.json();
  const { consumerId, alias, profileImageUrl, name, phone } = body;

  // Validate consumerId is provided and belongs to this user
  if (!consumerId || !consumerIds.includes(consumerId)) {
    return NextResponse.json({ error: "Invalid consumer enrollment" }, { status: 403 });
  }

  const updateData: any = {};
  if (alias !== undefined) updateData.alias = alias;
  if (profileImageUrl !== undefined) updateData.profileImageUrl = profileImageUrl;

  const consumer = await prisma.consumer.update({
    where: { id: consumerId },
    data: updateData,
    select: {
      id: true,
      alias: true,
      profileImageUrl: true,
      serviceType: true,
    },
  });

  // Update name/phone on the User model
  if (name !== undefined || phone !== undefined) {
    const userId = (session.user as any).id;
    const userData: any = {};
    if (name !== undefined) userData.name = name;
    if (phone !== undefined) userData.phone = phone;
    await prisma.user.update({
      where: { id: userId },
      data: userData,
    });
  }

  return NextResponse.json(consumer);
}
