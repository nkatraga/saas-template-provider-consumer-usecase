import { NextResponse } from "next/server";
import { getSessionWithIds } from "@/lib/session";
import { checkProviderSubscription } from "@/lib/subscription";

// [Template] — Subscription status check. Returns current plan, limits, and feature access for the authenticated user.

export async function GET() {
  const session = await getSessionWithIds();
  if (!session?.user || (session.user as any).role !== "PROVIDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providerId = (session.user as any).providerId;
  if (!providerId) {
    return NextResponse.json({ error: "No provider profile" }, { status: 400 });
  }

  const result = await checkProviderSubscription(providerId);
  return NextResponse.json(result);
}
