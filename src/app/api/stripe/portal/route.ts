import { NextRequest, NextResponse } from "next/server";
import { getSessionWithIds } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

// [Template:Integration] — Stripe customer portal session. Lets users manage subscriptions and billing.

export async function POST(req: NextRequest) {
  const session = await getSessionWithIds();
  if (!session?.user || (session.user as any).role !== "PROVIDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providerId = (session.user as any).providerId;
  const provider = await prisma.provider.findUnique({ where: { id: providerId } });

  if (!provider?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No billing account found" },
      { status: 400 }
    );
  }

  const origin = req.headers.get("origin") || process.env.NEXTAUTH_URL;

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: provider.stripeCustomerId,
    return_url: `${origin}/dashboard/provider?tab=settings`,
  });

  return NextResponse.json({ url: portalSession.url });
}
