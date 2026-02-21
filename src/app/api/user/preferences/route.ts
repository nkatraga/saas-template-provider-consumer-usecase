import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/admin";

// [Template] -- Gets/sets user view preferences (e.g., default view mode).
// Requires a `defaultViewMode` String field on the User model in the Prisma schema.

export const dynamic = "force-dynamic";

function jsonResponse(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function GET() {
  try {
    const { error, user } = await requireAuth();
    if (error) return error;

    const dbUser = await prisma.user.findUnique({
      where: { id: user!.id },
      select: { defaultViewMode: true },
    });

    return jsonResponse({ defaultViewMode: dbUser?.defaultViewMode || "calendar" });
  } catch (e) {
    console.error("GET /api/user/preferences error:", e);
    return jsonResponse({ error: "Server error" }, 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { error, user } = await requireAuth();
    if (error) return error;

    const body = await req.json();
    const { defaultViewMode } = body;

    if (defaultViewMode !== "list" && defaultViewMode !== "calendar") {
      return jsonResponse({ error: "Invalid view mode" }, 400);
    }

    const updated = await prisma.user.update({
      where: { id: user!.id },
      data: { defaultViewMode },
    });

    return jsonResponse({ defaultViewMode: updated.defaultViewMode });
  } catch (e) {
    console.error("PUT /api/user/preferences error:", e);
    return jsonResponse({ error: "Server error" }, 500);
  }
}
