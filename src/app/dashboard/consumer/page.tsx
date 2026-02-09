"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import posthog from "posthog-js";
import { Card, BookingCardSkeleton } from "@/components/ui";
import ChangePasswordSection from "@/components/ChangePasswordSection";
import { Calendar, Clock, ArrowLeftRight, Search, Users, User } from "lucide-react";

// [Template] — Consumer dashboard shell. Replace each tab's placeholder with your domain-specific UI.

type Tab = "bookings" | "past-bookings" | "find-exchange" | "my-exchanges" | "my-providers" | "profile";

interface TabConfig {
  id: Tab;
  label: string;
  icon: React.ElementType;
  description: string;
}

const TABS: TabConfig[] = [
  { id: "bookings", label: "My Bookings", icon: Calendar, description: "View your upcoming scheduled bookings." },
  { id: "past-bookings", label: "Past Bookings", icon: Clock, description: "Review your completed booking history." },
  { id: "find-exchange", label: "Find Exchange", icon: Search, description: "Browse available time slots to exchange with other consumers." },
  { id: "my-exchanges", label: "My Exchanges", icon: ArrowLeftRight, description: "Track your pending and completed exchange requests." },
  { id: "my-providers", label: "My Providers", icon: Users, description: "View your enrolled providers and service details." },
  { id: "profile", label: "Profile", icon: User, description: "Update your contact info, profile picture, and password." },
];

export default function ConsumerDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("bookings");

  const role = (session?.user as any)?.role;

  // Redirect non-consumers
  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
    else if (status === "authenticated" && role !== "CONSUMER" && role !== "PARENT") router.push("/");
  }, [status, role, router]);

  // Reset tab on logo click
  useEffect(() => {
    const handler = () => setActiveTab("bookings");
    window.addEventListener("resetTab", handler);
    return () => window.removeEventListener("resetTab", handler);
  }, []);

  // Track page view
  useEffect(() => {
    posthog.capture("consumer_dashboard_view", { tab: activeTab });
  }, [activeTab]);

  if (status === "loading" || !session) {
    return (
      <>
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="space-y-3">{[1,2,3].map(i => <BookingCardSkeleton key={i} />)}</div>
        </div>
      </>
    );
  }

  const currentTab = TABS.find(t => t.id === activeTab)!;

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
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

        {/* Profile tab also includes password change */}
        {activeTab === "profile" && (
          <div className="mt-6">
            <ChangePasswordSection />
          </div>
        )}
      </div>
    </>
  );
}
