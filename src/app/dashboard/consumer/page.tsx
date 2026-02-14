"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import posthog from "posthog-js";
import { Card, BookingCardSkeleton, Button, Badge, Alert, Textarea } from "@/components/ui";
import ChangePasswordSection from "@/components/ChangePasswordSection";
import { Calendar, Clock, ArrowLeftRight, Search, Users, User, HelpCircle } from "lucide-react";
import { format } from "date-fns";

// [Template] — Consumer dashboard shell. Replace each tab's placeholder with your domain-specific UI.

type Tab = "bookings" | "past-bookings" | "find-exchange" | "my-exchanges" | "my-providers" | "profile" | "help";

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
  { id: "help", label: "Help & Feedback", icon: HelpCircle, description: "Submit feedback, report bugs, or request support." },
];

// ─── Help & Feedback Section ──────────────────────────────
const FEEDBACK_CATEGORIES = [
  { value: "question", label: "Question" },
  { value: "bug", label: "Bug Report" },
  { value: "feature_request", label: "Feature Request" },
  { value: "support", label: "Support" },
];

interface FeedbackItem {
  id: string;
  category: string;
  message: string;
  status: string;
  adminResponse: string | null;
  createdAt: string;
}

function feedbackCategoryVariant(category: string): "info" | "danger" | "primary" | "warning" {
  switch (category) {
    case "question": return "info";
    case "bug": return "danger";
    case "feature_request": return "primary";
    case "support": return "warning";
    default: return "info";
  }
}

function feedbackCategoryLabel(category: string): string {
  switch (category) {
    case "question": return "Question";
    case "bug": return "Bug Report";
    case "feature_request": return "Feature Request";
    case "support": return "Support";
    default: return category;
  }
}

function HelpFeedbackSection() {
  const [selectedCategory, setSelectedCategory] = useState("question");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState<FeedbackItem[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchSubmissions = useCallback(async () => {
    setLoadingSubmissions(true);
    try {
      const res = await fetch("/api/feedback");
      const data = await res.json();
      setSubmissions(data);
    } catch {
      // ignore
    }
    setLoadingSubmissions(false);
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: selectedCategory, message }),
      });
      if (res.ok) {
        setMessage("");
        setSuccessMsg("Feedback submitted successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
        fetchSubmissions();
      }
    } catch {
      // ignore
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {successMsg && <Alert variant="success">{successMsg}</Alert>}

      {/* Submit Feedback */}
      <Card>
        <h3 className="font-medium text-foreground mb-4">Submit Feedback</h3>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap mb-4">
          {FEEDBACK_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${
                selectedCategory === cat.value
                  ? "bg-primary text-white"
                  : "bg-surface-hover text-muted hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe your question, issue, or suggestion..."
          rows={4}
        />

        <div className="mt-3">
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={submitting}
            disabled={!message.trim()}
          >
            Submit Feedback
          </Button>
        </div>
      </Card>

      {/* Past Submissions */}
      <Card>
        <h3 className="font-medium text-foreground mb-4">Your Submissions</h3>

        {loadingSubmissions ? (
          <p className="text-muted text-sm">Loading...</p>
        ) : submissions.length === 0 ? (
          <p className="text-muted text-sm">No feedback submitted yet.</p>
        ) : (
          <div className="space-y-3">
            {submissions.map((item) => (
              <div
                key={item.id}
                className="border border-border rounded-lg p-3"
              >
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge variant={feedbackCategoryVariant(item.category)}>
                    {feedbackCategoryLabel(item.category)}
                  </Badge>
                  <Badge variant={item.status === "open" ? "warning" : "success"}>
                    {item.status === "open" ? "Open" : "Resolved"}
                  </Badge>
                  <span className="text-xs text-muted">
                    {format(new Date(item.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
                <p className="text-sm text-foreground mt-1">{item.message}</p>
                {item.adminResponse && (
                  <div className="mt-2 bg-primary/5 border border-primary/20 rounded-lg p-3">
                    <p className="text-xs font-medium text-primary mb-1">Admin Response</p>
                    <p className="text-sm text-foreground">{item.adminResponse}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

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

        {/* Tab content */}
        {activeTab === "help" ? (
          <HelpFeedbackSection />
        ) : (
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
        )}

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
