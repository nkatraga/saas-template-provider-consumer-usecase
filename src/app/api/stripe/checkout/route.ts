import { NextRequest, NextResponse } from "next/server";
import { getSessionWithIds } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

// [Template:Integration] — Stripe checkout session creation. Creates a payment session and redirects to Stripe-hosted checkout.

export async function POST(req: NextRequest) {
  const session = await getSessionWithIds();
  if (!session?.user || (session.user as any).role !== "PROVIDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providerId = (session.user as any).providerId;
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    include: { user: { select: { email: true, name: true } } },
  });

  if (!provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  const { plan } = await req.json();
  if (plan !== "monthly" && plan !== "yearly") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const priceId =
    plan === "monthly"
      ? process.env.STRIPE_MONTHLY_PRICE_ID!
      : process.env.STRIPE_YEARLY_PRICE_ID!;

  // Create or reuse Stripe customer
  let customerId = provider.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: provider.user.email,
      name: provider.user.name,
      metadata: { providerId: provider.id },
    });
    customerId = customer.id;
    await prisma.provider.update({
      where: { id: provider.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const origin = req.headers.get("origin") || process.env.NEXTAUTH_URL;

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dashboard/provider?subscriptionSuccess=true`,
    cancel_url: `${origin}/dashboard/provider?tab=settings`,
    metadata: { providerId: provider.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
