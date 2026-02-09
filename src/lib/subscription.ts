import { prisma } from "./prisma";

// [Template] — Subscription gating and free tier logic. Defines plan limits and feature access checks.

export interface SubscriptionCheckResult {
  needsSubscription: boolean;
  reason: string | null;
  consumerCount: number;
  freeConsumerLimit: number;
  subscriptionStatus: string | null;
  isExempt: boolean;
  subscriptionPeriodEnd: string | null;
}

export async function checkProviderSubscription(
  providerId: string
): Promise<SubscriptionCheckResult> {
  const [settings, provider, consumerCount] = await Promise.all([
    prisma.appSettings.upsert({
      where: { id: "singleton" },
      create: {},
      update: {},
    }),
    prisma.provider.findUnique({ where: { id: providerId } }),
    prisma.consumer.count({ where: { providerId } }),
  ]);

  const base = {
    consumerCount,
    freeConsumerLimit: settings.freeConsumerLimit,
    subscriptionStatus: provider?.subscriptionStatus ?? null,
    isExempt: provider?.subscriptionExempt ?? false,
    subscriptionPeriodEnd: provider?.subscriptionPeriodEnd?.toISOString() ?? null,
  };

  // 1. Payments not enabled — no gating
  if (!settings.paymentsEnabled) {
    return { ...base, needsSubscription: false, reason: null };
  }

  // 2. Provider is exempt (friends/beta users)
  if (provider?.subscriptionExempt) {
    return { ...base, needsSubscription: false, reason: null };
  }

  // 3. Within free tier
  if (consumerCount < settings.freeConsumerLimit) {
    return { ...base, needsSubscription: false, reason: null };
  }

  // 4. Active or trialing subscription
  if (
    provider?.subscriptionStatus === "active" ||
    provider?.subscriptionStatus === "trialing"
  ) {
    return { ...base, needsSubscription: false, reason: null };
  }

  // 5. Needs subscription
  return {
    ...base,
    needsSubscription: true,
    reason: `You have ${consumerCount} consumers, which exceeds the free limit of ${settings.freeConsumerLimit}. Subscribe to AppName Pro to add more consumers.`,
  };
}
