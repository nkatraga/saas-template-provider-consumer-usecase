import { NextResponse } from "next/server";
import { getSessionWithIds } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// [Template:Domain] — Provider views enrollment requests. Auth required (PROVIDER role). Returns all requests ordered by createdAt desc.

export async function GET() {
  const session = await getSessionWithIds();
  if (!session?.user || (session.user as any).role !== "PROVIDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providerId = (session.user as any).providerId;

  try {
    const requests = await prisma.enrollmentRequest.findMany({
      where: { providerId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        serviceType: true,
        message: true,
        status: true,
        providerNotes: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Enrollment requests fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrollment requests" },
      { status: 500 }
    );
  }
}
