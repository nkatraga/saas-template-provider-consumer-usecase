"use client";

import { useState } from "react";
import { Button, Card } from "@/components/ui";

// [Template] — Upgrade CTA banner. Shows when user is on free tier or approaching plan limits.

interface SubscriptionBannerProps {
  consumerCount: number;
  freeConsumerLimit: number;
}

export default function SubscriptionBanner({
  consumerCount,
  freeConsumerLimit,
}: SubscriptionBannerProps) {
  const [loading, setLoading] = useState<"monthly" | "yearly" | null>(null);

  const handleSubscribe = async (plan: "monthly" | "yearly") => {
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(null);
    }
  };

  return (
    <Card className="border-amber-200 bg-amber-50 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-amber-900">
            Upgrade to AppName Pro
          </h3>
          <p className="text-sm text-amber-700 mt-1">
            You have {consumerCount} consumer{consumerCount !== 1 ? "s" : ""}. The free tier limit is {freeConsumerLimit} consumer{freeConsumerLimit !== 1 ? "s" : ""}. Subscribe to add more consumers.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleSubscribe("monthly")}
            loading={loading === "monthly"}
            disabled={loading !== null}
          >
            $5/mo
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleSubscribe("yearly")}
            loading={loading === "yearly"}
            disabled={loading !== null}
          >
            $50/yr (save 17%)
          </Button>
        </div>
      </div>
    </Card>
  );
}
