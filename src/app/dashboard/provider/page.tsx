"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import posthog from "posthog-js";
import { Card, BookingCardSkeleton } from "@/components/ui";
import SubscriptionBanner from "@/components/SubscriptionBanner";
import ChangePasswordSection from "@/components/ChangePasswordSection";
import { Calendar, Users, ArrowLeftRight, Settings, Zap, Clock } from "lucide-react";

// [Template] — Provider dashboard shell. Replace each tab's placeholder with your domain-specific UI.

type Tab = "schedule" | "consumers" | "past-bookings" | "exchanges" | "workflows" | "settings";

interface TabConfig {
  id: Tab;
  label: string;
  icon: React.ElementType;
  description: string;
}

const TABS: TabConfig[] = [
  { id: "schedule", label: "Schedule", icon: Calendar, description: "View and manage upcoming bookings with your consumers." },
  { id: "consumers", label: "Consumers", icon: Users, description: "Manage your consumer roster, service types, and contact info." },
  { id: "past-bookings", label: "Past Bookings", icon: Clock, description: "Review completed bookings history and notes." },
  { id: "exchanges", label: "Exchanges", icon: ArrowLeftRight, description: "Review and approve booking exchange requests between consumers." },
  { id: "workflows", label: "Workflows", icon: Zap, description: "Send invoices, bulk emails, and other automated workflows." },
  { id: "settings", label: "Settings", icon: Settings, description: "Configure exchange rules, reminders, policies, and branding." },
];

export default function ProviderDashboardPage() {
  return (
    <Suspense fallback={<><Navbar /><div className="max-w-7xl mx-auto px-4 py-6"><div className="space-y-3">{[1,2,3].map(i=><BookingCardSkeleton key={i}/>)}</div></div></>}>
      <ProviderDashboard />
    </Suspense>
  );
}

interface SubscriptionStatus {
  needsSubscription: boolean;
  reason: string | null;
  consumerCount: number;
  freeConsumerLimit: number;
  subscriptionStatus: string | null;
  isExempt: boolean;
  subscriptionPeriodEnd: string | null;
}

function ProviderDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>("schedule");
  const [subStatus, setSubStatus] = useState<SubscriptionStatus | null>(null);

  const role = (session?.user as any)?.role;
  const providerId = (session?.user as any)?.providerId;

  // Redirect non-providers
  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
    else if (status === "authenticated" && role !== "PROVIDER") router.push("/");
  }, [status, role, router]);

  // Handle tab from URL
  useEffect(() => {
    const tab = searchParams.get("tab") as Tab | null;
    if (tab && TABS.some(t => t.id === tab)) setActiveTab(tab);
  }, [searchParams]);

  // Reset tab on logo click
  useEffect(() => {
    const handler = () => setActiveTab("schedule");
    window.addEventListener("resetTab", handler);
    return () => window.removeEventListener("resetTab", handler);
  }, []);

  // Track page view
  useEffect(() => {
    posthog.capture("provider_dashboard_view", { tab: activeTab });
  }, [activeTab]);

  // Check subscription status
  useEffect(() => {
    if (!providerId) return;
    fetch("/api/subscription/status")
      .then(r => r.json())
      .then(setSubStatus)
      .catch(() => {});
  }, [providerId]);

  if (status === "loading" || !session) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="space-y-3">{[1,2,3].map(i => <BookingCardSkeleton key={i} />)}</div>
        </div>
      </>
    );
  }

  const currentTab = TABS.find(t => t.id === activeTab)!;

  return (
    <>
      <Navbar />
      {subStatus?.needsSubscription && (
        <SubscriptionBanner
          consumerCount={subStatus.consumerCount}
          freeConsumerLimit={subStatus.freeConsumerLimit}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Tab navigation */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-6 border-b border-border">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? "text-primary border-b-2 border-primary bg-primary/5"
                    : "text-muted hover:text-foreground hover:bg-surface-alt/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content — placeholder cards */}
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <currentTab.icon className="w-8 h-8 text-primary" />
            <div>
              <h2 className="text-xl font-semibold text-foreground">{currentTab.label}</h2>
              <p className="text-sm text-muted">{currentTab.description}</p>
            </div>
          </div>

          <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
            <p className="text-muted text-lg">Your {currentTab.label.toLowerCase()} content here</p>
            <p className="text-muted/60 text-sm mt-2">
              Replace this placeholder with your domain-specific {currentTab.label.toLowerCase()} UI
            </p>
          </div>
        </Card>

        {/* Settings tab also includes password change */}
        {activeTab === "settings" && (
          <div className="mt-6">
            <ChangePasswordSection />
          </div>
        )}
      </div>
    </>
  );
}
