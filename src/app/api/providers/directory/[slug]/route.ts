import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// [Template:Domain] — Public profile by slug. No auth required. Returns full provider public profile with reviews.

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const profile = await prisma.providerPublicProfile.findUnique({
      where: { slug },
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            profileImageUrl: true,
            user: {
              select: {
                name: true,
              },
            },
            reviews: {
              where: { isVisible: true },
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
            },
          },
        },
      },
    });

    if (!profile || !profile.isPublished) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    const reviews = profile.provider.reviews;
    const reviewCount = reviews.length;
    const avgRating =
      reviewCount > 0
        ? Math.round(
            (reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10
          ) / 10
        : null;

    return NextResponse.json({
      id: profile.provider.id,
      name: profile.provider.user.name,
      businessName: profile.provider.businessName,
      profileImageUrl: profile.provider.profileImageUrl,
      bio: profile.bio,
      philosophy: profile.philosophy,
      experienceYears: profile.experienceYears,
      serviceFormats: profile.serviceFormats,
      rateMin: profile.rateMin,
      rateMax: profile.rateMax,
      ratePer: profile.ratePer,
      city: profile.city,
      state: profile.state,
      zipCode: profile.zipCode,
      latitude: profile.latitude,
      longitude: profile.longitude,
      photos: profile.photos,
      slug: profile.slug,
      rating: avgRating,
      reviewCount,
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        text: r.text,
        createdAt: r.createdAt,
        consumerName: r.consumerUser.name,
      })),
    });
  } catch (error) {
    console.error("Public profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch provider profile" },
      { status: 500 }
    );
  }
}
