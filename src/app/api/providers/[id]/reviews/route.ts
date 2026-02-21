import { NextRequest, NextResponse } from "next/server";
import { getSessionWithIds } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// [Template:Domain] — Reviews for a provider. GET is public (paginated). POST requires auth (consumer leaves a review).

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: providerId } = await params;
  const { searchParams } = new URL(req.url);

  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));

  try {
    // Verify provider exists
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      select: { id: true },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    const [reviews, total] = await Promise.all([
      prisma.providerReview.findMany({
        where: { providerId, isVisible: true },
        select: {
          id: true,
          rating: true,
          text: true,
          createdAt: true,
          consumerUser: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.providerReview.count({
        where: { providerId, isVisible: true },
      }),
    ]);

    // Calculate average rating
    const allRatings = await prisma.providerReview.aggregate({
      where: { providerId, isVisible: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return NextResponse.json({
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        text: r.text,
        createdAt: r.createdAt,
        consumerName: r.consumerUser.name,
      })),
      rating: allRatings._avg.rating
        ? Math.round(allRatings._avg.rating * 10) / 10
        : null,
      reviewCount: allRatings._count.rating,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Reviews fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionWithIds();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: providerId } = await params;
  const userId = (session.user as any).id;

  try {
    const body = await req.json();
    const { rating, text } = body;

    // Validate rating
    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be an integer between 1 and 5" },
        { status: 400 }
      );
    }

    const ratingInt = Math.round(rating);

    // Verify provider exists
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      select: { id: true },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    // Verify the user is a consumer of this provider
    const consumerRelation = await prisma.consumer.findFirst({
      where: {
        userId,
        providerId,
      },
    });

    if (!consumerRelation) {
      return NextResponse.json(
        { error: "You must be a consumer of this provider to leave a review" },
        { status: 403 }
      );
    }

    // Create or update the review (upsert based on unique constraint)
    const review = await prisma.providerReview.upsert({
      where: {
        providerId_consumerUserId: {
          providerId,
          consumerUserId: userId,
        },
      },
      create: {
        providerId,
        consumerUserId: userId,
        rating: ratingInt,
        text: text || null,
      },
      update: {
        rating: ratingInt,
        text: text || null,
      },
      select: {
        id: true,
        rating: true,
        text: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    // Handle unique constraint violation (shouldn't happen with upsert, but just in case)
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "You have already reviewed this provider" },
        { status: 409 }
      );
    }
    console.error("Review creation error:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
