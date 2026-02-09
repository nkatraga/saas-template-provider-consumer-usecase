import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

// [Template:Integration] — Stripe webhook handler. Processes subscription events (created, updated, deleted) with signature verification.

function getSubscriptionPeriodEnd(sub: Stripe.Subscription): Date | null {
  // In newer Stripe API versions, current_period_end is on subscription items
  const item = sub.items?.data?.[0];
  if (item?.current_period_end) {
    return new Date(item.current_period_end * 1000);
  }
  return null;
}

function getSubscriptionPlan(sub: Stripe.Subscription): string | null {
  const priceId = sub.items?.data?.[0]?.price?.id;
  if (priceId === process.env.STRIPE_MONTHLY_PRICE_ID) return "monthly";
  if (priceId === process.env.STRIPE_YEARLY_PRICE_ID) return "yearly";
  return null;
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  // In newer Stripe API, subscription is in parent.subscription_details
  const subDetails = invoice.parent?.subscription_details;
  if (subDetails?.subscription) {
    return typeof subDetails.subscription === "string"
      ? subDetails.subscription
      : subDetails.subscription.id;
  }
  return null;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const providerId = session.metadata?.providerId;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;

      if (providerId && subscriptionId) {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const periodEnd = getSubscriptionPeriodEnd(sub);
        const plan = getSubscriptionPlan(sub);
        await prisma.provider.update({
          where: { id: providerId },
          data: {
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: sub.status,
            ...(periodEnd && { subscriptionPeriodEnd: periodEnd }),
            ...(plan && { subscriptionPlan: plan }),
          },
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object;
      const provider = await prisma.provider.findFirst({
        where: { stripeSubscriptionId: sub.id },
      });
      if (provider) {
        const periodEnd = getSubscriptionPeriodEnd(sub);
        const plan = getSubscriptionPlan(sub);
        await prisma.provider.update({
          where: { id: provider.id },
          data: {
            subscriptionStatus: sub.status,
            ...(periodEnd && { subscriptionPeriodEnd: periodEnd }),
            ...(plan && { subscriptionPlan: plan }),
          },
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const provider = await prisma.provider.findFirst({
        where: { stripeSubscriptionId: sub.id },
      });
      if (provider) {
        await prisma.provider.update({
          where: { id: provider.id },
          data: {
            subscriptionStatus: "canceled",
            stripeSubscriptionId: null,
          },
        });
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object;
      const subscriptionId = getInvoiceSubscriptionId(invoice);
      if (subscriptionId) {
        const provider = await prisma.provider.findFirst({
          where: { stripeSubscriptionId: subscriptionId },
        });
        if (provider) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          const periodEnd = getSubscriptionPeriodEnd(sub);
          await prisma.provider.update({
            where: { id: provider.id },
            data: {
              subscriptionStatus: sub.status,
              ...(periodEnd && { subscriptionPeriodEnd: periodEnd }),
            },
          });
        }
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      const subscriptionId = getInvoiceSubscriptionId(invoice);
      if (subscriptionId) {
        const provider = await prisma.provider.findFirst({
          where: { stripeSubscriptionId: subscriptionId },
        });
        if (provider) {
          await prisma.provider.update({
            where: { id: provider.id },
            data: { subscriptionStatus: "past_due" },
          });
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
