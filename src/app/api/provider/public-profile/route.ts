import { NextRequest, NextResponse } from "next/server";
import { getSessionWithIds } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// [Template:Domain] — Provider manages their own public profile. Auth required (PROVIDER role). GET retrieves (or creates), PUT updates.

export async function GET() {
  const session = await getSessionWithIds();
  if (!session?.user || (session.user as any).role !== "PROVIDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providerId = (session.user as any).providerId;

  try {
    // Find existing profile or create a new one
    let profile = await prisma.providerPublicProfile.findUnique({
      where: { providerId },
    });

    if (!profile) {
      profile = await prisma.providerPublicProfile.create({
        data: { providerId },
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Public profile GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch public profile" },
      { status: 500 }
    );
  }
}

/**
 * Generate a URL-friendly slug from a business name.
 * Lowercased, spaces/special chars replaced with hyphens, uniqueness checked with counter append.
 */
async function generateSlug(
  businessName: string,
  currentProfileId: string
): Promise<string> {
  const base = businessName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!base) return currentProfileId; // fallback to profile ID if name is all special chars

  // Check if the slug is already taken by another profile
  let candidate = base;
  let counter = 0;

  while (true) {
    const existing = await prisma.providerPublicProfile.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    // Available if not taken, or taken by the current profile
    if (!existing || existing.id === currentProfileId) {
      return candidate;
    }

    counter++;
    candidate = `${base}-${counter}`;
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSessionWithIds();
  if (!session?.user || (session.user as any).role !== "PROVIDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providerId = (session.user as any).providerId;

  try {
    const body = await req.json();
    const {
      bio,
      philosophy,
      experienceYears,
      serviceFormats,
      rateMin,
      rateMax,
      ratePer,
      city,
      state,
      zipCode,
      latitude,
      longitude,
      googlePlaceId,
      photos,
      isPublished,
    } = body;

    // Ensure profile exists (upsert pattern)
    let profile = await prisma.providerPublicProfile.findUnique({
      where: { providerId },
      select: { id: true },
    });

    if (!profile) {
      profile = await prisma.providerPublicProfile.create({
        data: { providerId },
        select: { id: true },
      });
    }

    // Build update data
    const updateData: any = {};
    if (bio !== undefined) updateData.bio = bio;
    if (philosophy !== undefined) updateData.philosophy = philosophy;
    if (experienceYears !== undefined)
      updateData.experienceYears =
        experienceYears !== null ? parseInt(experienceYears) : null;
    if (serviceFormats !== undefined) updateData.serviceFormats = serviceFormats;
    if (rateMin !== undefined)
      updateData.rateMin = rateMin !== null ? parseFloat(rateMin) : null;
    if (rateMax !== undefined)
      updateData.rateMax = rateMax !== null ? parseFloat(rateMax) : null;
    if (ratePer !== undefined) updateData.ratePer = ratePer;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (zipCode !== undefined) updateData.zipCode = zipCode;
    if (latitude !== undefined)
      updateData.latitude = latitude !== null ? parseFloat(latitude) : null;
    if (longitude !== undefined)
      updateData.longitude = longitude !== null ? parseFloat(longitude) : null;
    if (googlePlaceId !== undefined) updateData.googlePlaceId = googlePlaceId;
    if (photos !== undefined) updateData.photos = photos;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    // Generate slug from businessName when publishing
    if (isPublished === true || body.slug !== undefined) {
      const provider = await prisma.provider.findUnique({
        where: { id: providerId },
        select: { businessName: true },
      });

      if (provider?.businessName) {
        updateData.slug = await generateSlug(
          provider.businessName,
          profile.id
        );
      }
    }

    const updatedProfile = await prisma.providerPublicProfile.update({
      where: { providerId },
      data: updateData,
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Public profile PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update public profile" },
      { status: 500 }
    );
  }
}
