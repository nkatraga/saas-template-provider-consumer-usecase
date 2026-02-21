import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBoundingBox, haversineDistance } from "@/lib/geo";

// [Template:Domain] — Public directory search. No auth required. Supports text search, geo filtering, service format filter, and pagination.

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q")?.trim() || "";
  const lat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : null;
  const lng = searchParams.get("lng") ? parseFloat(searchParams.get("lng")!) : null;
  const radius = searchParams.get("radius") ? parseFloat(searchParams.get("radius")!) : 25;
  const serviceFormat = searchParams.get("serviceFormat") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));

  try {
    // Build the where clause
    const where: any = {
      isPublished: true,
      provider: {
        user: {
          isAdmin: false,
        },
      },
    };

    // Geo bounding box filter
    if (lat !== null && lng !== null) {
      const bbox = getBoundingBox(lat, lng, radius);
      where.latitude = { gte: bbox.minLat, lte: bbox.maxLat };
      where.longitude = { gte: bbox.minLng, lte: bbox.maxLng };
    }

    // Service format filter
    if (serviceFormat) {
      where.serviceFormats = { has: serviceFormat };
    }

    // Text search filter — search across multiple fields using OR
    if (q) {
      where.OR = [
        { bio: { contains: q, mode: "insensitive" } },
        { philosophy: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { state: { contains: q, mode: "insensitive" } },
        { provider: { businessName: { contains: q, mode: "insensitive" } } },
        { provider: { user: { name: { contains: q, mode: "insensitive" } } } },
      ];
    }

    // Fetch profiles with provider and review data
    const profiles = await prisma.providerPublicProfile.findMany({
      where,
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
              select: { rating: true },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Post-process: compute distance, average rating, and shape response
    let results = profiles.map((profile) => {
      const reviews = profile.provider.reviews;
      const reviewCount = reviews.length;
      const avgRating =
        reviewCount > 0
          ? Math.round(
              (reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10
            ) / 10
          : null;

      let distance: number | null = null;
      if (lat !== null && lng !== null && profile.latitude && profile.longitude) {
        distance =
          Math.round(
            haversineDistance(lat, lng, profile.latitude, profile.longitude) * 10
          ) / 10;
      }

      return {
        id: profile.provider.id,
        name: profile.provider.user.name,
        businessName: profile.provider.businessName,
        profileImageUrl: profile.provider.profileImageUrl,
        bio: profile.bio,
        city: profile.city,
        state: profile.state,
        serviceFormats: profile.serviceFormats,
        rateMin: profile.rateMin,
        rateMax: profile.rateMax,
        ratePer: profile.ratePer,
        experienceYears: profile.experienceYears,
        slug: profile.slug,
        rating: avgRating,
        reviewCount,
        distance,
        latitude: profile.latitude,
        longitude: profile.longitude,
      };
    });

    // Filter by exact distance if geo search
    if (lat !== null && lng !== null) {
      results = results.filter((r) => r.distance !== null && r.distance <= radius);
      // Sort by distance
      results.sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
    }

    // Pagination
    const total = results.length;
    const start = (page - 1) * limit;
    const paginatedResults = results.slice(start, start + limit);

    return NextResponse.json({
      providers: paginatedResults,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Directory search error:", error);
    return NextResponse.json(
      { error: "Failed to search directory" },
      { status: 500 }
    );
  }
}
