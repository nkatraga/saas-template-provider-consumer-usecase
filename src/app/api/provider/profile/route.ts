import { NextRequest, NextResponse } from "next/server";
import { getSessionWithIds } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// [Template] — Profile management endpoint. GET/PUT for user profile data.

export async function GET() {
  const session = await getSessionWithIds();
  if (!session?.user || (session.user as any).role !== "PROVIDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providerId = (session.user as any).providerId;
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    select: {
      id: true,
      alias: true,
      profileImageUrl: true,
      businessName: true,
      user: {
        select: { name: true, email: true, phone: true },
      },
    },
  });

  if (!provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  return NextResponse.json(provider);
}

export async function PUT(req: NextRequest) {
  const session = await getSessionWithIds();
  if (!session?.user || (session.user as any).role !== "PROVIDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providerId = (session.user as any).providerId;
  const body = await req.json();

  const { alias, profileImageUrl, businessName, name, phone } = body;

  const updateData: any = {};
  if (alias !== undefined) updateData.alias = alias;
  if (profileImageUrl !== undefined) updateData.profileImageUrl = profileImageUrl;
  if (businessName !== undefined) updateData.businessName = businessName;

  const provider = await prisma.provider.update({
    where: { id: providerId },
    data: updateData,
    select: {
      id: true,
      alias: true,
      profileImageUrl: true,
      businessName: true,
      userId: true,
    },
  });

  // Update name/phone on the User model
  if (name !== undefined || phone !== undefined) {
    const userData: any = {};
    if (name !== undefined) userData.name = name;
    if (phone !== undefined) userData.phone = phone;
    await prisma.user.update({
      where: { id: provider.userId },
      data: userData,
    });
  }

  return NextResponse.json(provider);
}
