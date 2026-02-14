"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { format } from "date-fns";
const BUSINESS_POLICIES = [
  { key: "cancellationPolicy", label: "Cancellation Policy" },
  { key: "makeUpPolicy", label: "Make-up Policy" },
  { key: "paymentPolicy", label: "Payment Policy" },
  { key: "latePolicy", label: "Late Policy" },
];
import { Button, Input, Card, Badge, Alert, Toggle, Select, Textarea } from "@/components/ui";
import ChangePasswordSection from "@/components/ChangePasswordSection";
import { MessageSquare } from "lucide-react";

// [Template] — Admin dashboard pattern. Platform-wide management with stats, entity tables, and settings.

type Tab = "providers" | "consumers" | "payments" | "feedback" | "settings";

interface Stats {
  providers: number;
  consumers: number;
  scheduledBookings: number;
  pastBookings: number;
  exchanges: number;
  openFeedback: number;
}

interface ProviderRecord {
  id: string;
  businessName: string;
  // serviceTypes removed — add custom fields for your vertical here
  subscriptionStatus?: string | null;
  subscriptionPlan?: string | null;
  subscriptionExempt?: boolean;
  subscriptionPeriodEnd?: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    emailVerified: boolean;
    createdAt: string;
  };
  settings?: any;
  _count: { consumers: number };
  consumers?: ConsumerRecord[];
}

interface ConsumerRecord {
  id: string;
  userId: string;
  serviceType: string;
  bookingDuration: number;
  providerId: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  provider: {
    businessName: string;
    user: { name: string };
  };
  providerName?: string;
  businessName?: string;
  hasAccount?: boolean;
}

interface AppSettingsData {
  paymentsEnabled: boolean;
  freeConsumerLimit: number;
}

// ─── Stats Header ────────────────────────────────────────
function StatsHeader({ stats }: { stats: Stats | null }) {
  const cards = [
    { label: "Providers", value: stats?.providers ?? "—" },
    { label: "Consumers", value: stats?.consumers ?? "—" },
    { label: "Scheduled", value: stats?.scheduledBookings ?? "—" },
    { label: "Past Bookings", value: stats?.pastBookings ?? "—" },
    { label: "Exchanges", value: stats?.exchanges ?? "—" },
    { label: "Open Feedback", value: stats?.openFeedback ?? "—", icon: MessageSquare },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6">
      {cards.map((card) => (
        <Card key={card.label} padding="compact" className="text-center">
          <div className="flex items-center justify-center gap-1">
            {"icon" in card && card.icon && <card.icon className="w-4 h-4 text-primary" />}
            <div className="text-2xl font-bold text-foreground">{card.value}</div>
          </div>
          <div className="text-xs text-muted mt-1">{card.label}</div>
        </Card>
      ))}
    </div>
  );
}

// ─── Providers Tab ────────────────────────────────────────
function ProvidersTab() {
  const [providers, setProviders] = useState<ProviderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", businessName: "" });
  const [msg, setMsg] = useState("");

  const fetchProviders = useCallback(async () => {
    const res = await fetch("/api/admin/providers");
    const data = await res.json();
    setProviders(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    const res = await fetch(`/api/admin/providers/${id}`);
    const data = await res.json();
    setProviders((prev) =>
      prev.map((t) => (t.id === id ? { ...t, consumers: data.consumers, settings: data.settings || t.settings } : t))
    );
    setExpandedId(id);
  };

  const startEdit = (t: ProviderRecord) => {
    setEditingId(t.id);
    setEditForm({
      name: t.user.name,
      email: t.user.email,
      phone: t.user.phone || "",
      businessName: t.businessName,
    });
  };

  const saveEdit = async (id: string) => {
    await fetch(`/api/admin/providers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setEditingId(null);
    setMsg("Provider updated");
    setTimeout(() => setMsg(""), 3000);
    fetchProviders();
  };

  const handleDelete = async (t: ProviderRecord) => {
    if (!window.confirm(`Delete provider "${t.user.name}" and all their data? This cannot be undone.`))
      return;
    await fetch(`/api/admin/providers/${t.id}`, { method: "DELETE" });
    setMsg("Provider deleted");
    setTimeout(() => setMsg(""), 3000);
    fetchProviders();
  };

  if (loading) return <div className="text-center py-8 text-muted">Loading providers...</div>;

  return (
    <div className="space-y-3">
      {msg && (
        <Alert variant="success">{msg}</Alert>
      )}
      {providers.length === 0 ? (
        <p className="text-muted text-center py-8">No providers yet.</p>
      ) : (
        providers.map((t) => (
          <Card key={t.id} padding="compact">
            {editingId === t.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Name"
                  />
                  <Input
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="Email"
                  />
                  <Input
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="Phone"
                  />
                  <Input
                    value={editForm.businessName}
                    onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                    placeholder="Business Name"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => saveEdit(t.id)}
                  >
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground">{t.user.name}</span>
                      <Badge variant="neutral">
                        {t.businessName}
                      </Badge>
                      {t.user.emailVerified && (
                        <Badge variant="success">
                          Verified
                        </Badge>
                      )}
                      {t.subscriptionExempt && (
                        <Badge variant="warning">Exempt</Badge>
                      )}
                      {t.subscriptionStatus === "active" && (
                        <Badge variant="success">Pro</Badge>
                      )}
                      {t.subscriptionStatus === "past_due" && (
                        <Badge variant="warning">Past Due</Badge>
                      )}
                      {t.subscriptionStatus === "canceled" && (
                        <Badge variant="danger">Canceled</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted mt-1">
                      {t.user.email}
                      {t.user.phone && ` · ${t.user.phone}`}
                    </div>
                    <div className="text-xs text-muted mt-0.5">
                      Joined {format(new Date(t.user.createdAt), "MMM d, yyyy")}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => handleExpand(t.id)}
                      className="text-xs text-primary hover:text-primary-light px-2 py-1"
                    >
                      {expandedId === t.id ? "Collapse" : `${t._count.consumers} consumers`}
                    </button>
                    <button
                      onClick={() => startEdit(t)}
                      className="text-xs text-primary hover:text-primary-light px-2 py-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t)}
                      className="text-xs text-red-500 hover:text-red-700 px-2 py-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {expandedId === t.id && (
                  <div className="mt-3 space-y-3">
                    {/* Consumers */}
                    {t.consumers && (
                      <div className="pl-3 border-l-2 border-border space-y-2">
                        <p className="text-xs font-medium text-muted uppercase tracking-wide">Consumers</p>
                        {t.consumers.length === 0 ? (
                          <p className="text-sm text-muted">No consumers</p>
                        ) : (
                          t.consumers.map((s: any) => (
                            <div key={s.id} className="text-sm text-muted">
                              <span className="font-medium">{s.user.name}</span>
                              <span className="text-muted"> · {s.user.email}</span>
                              <span className="text-muted"> · {s.serviceType}</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Business Policies */}
                    {t.settings && BUSINESS_POLICIES.some((p) => t.settings?.[p.key]) && (
                      <div className="pl-3 border-l-2 border-purple-100 space-y-2">
                        <p className="text-xs font-medium text-muted uppercase tracking-wide">Business Policies</p>
                        {BUSINESS_POLICIES.map((policy) => {
                          const value = t.settings?.[policy.key];
                          if (!value) return null;
                          return (
                            <div key={policy.key} className="text-sm">
                              <span className="font-medium text-foreground">{policy.label}:</span>{" "}
                              <span className="text-muted">{value}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </Card>
        ))
      )}
    </div>
  );
}

// ─── Consumers Tab ────────────────────────────────────────
function ConsumersTab() {
  const [consumers, setConsumers] = useState<ConsumerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    serviceType: "",
  });
  const [msg, setMsg] = useState("");

  const fetchConsumers = useCallback(async () => {
    const res = await fetch("/api/admin/consumers");
    const data = await res.json();
    setConsumers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchConsumers();
  }, [fetchConsumers]);

  const startEdit = (s: ConsumerRecord) => {
    setEditingId(s.id);
    setEditForm({
      name: s.user.name,
      email: s.user.email,
      phone: s.user.phone || "",
      serviceType: s.serviceType,
    });
  };

  const saveEdit = async (id: string) => {
    await fetch(`/api/admin/consumers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setEditingId(null);
    setMsg("Consumer updated");
    setTimeout(() => setMsg(""), 3000);
    fetchConsumers();
  };

  const handleDelete = async (s: ConsumerRecord) => {
    if (!window.confirm(`Delete consumer "${s.user.name}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/consumers/${s.id}`, { method: "DELETE" });
    setMsg("Consumer deleted");
    setTimeout(() => setMsg(""), 3000);
    fetchConsumers();
  };

  if (loading) return <div className="text-center py-8 text-muted">Loading consumers...</div>;

  return (
    <div className="space-y-3">
      {msg && (
        <Alert variant="success">{msg}</Alert>
      )}
      {consumers.length === 0 ? (
        <p className="text-muted text-center py-8">No consumers yet.</p>
      ) : (
        consumers.map((s) => (
          <Card key={s.id} padding="compact">
            {editingId === s.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Name"
                  />
                  <Input
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="Email"
                  />
                  <Input
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="Phone"
                  />
                  <Input
                    value={editForm.serviceType}
                    onChange={(e) => setEditForm({ ...editForm, serviceType: e.target.value })}
                    placeholder="ServiceType"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => saveEdit(s.id)}
                  >
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground">{s.user.name}</span>
                    <Badge variant="primary">
                      {s.serviceType}
                    </Badge>
                    {s.hasAccount && (
                      <Badge variant="success">
                        Activated
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted mt-1">
                    {s.user.email}
                    {s.user.phone && ` · ${s.user.phone}`}
                  </div>
                  <div className="text-xs text-muted mt-0.5">
                    Provider: {s.providerName || s.provider?.user?.name}
                    {(s.businessName || s.provider?.businessName) &&
                      ` · ${s.businessName || s.provider?.businessName}`}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(s)}
                    className="text-xs text-primary hover:text-primary-light px-2 py-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(s)}
                    className="text-xs text-red-500 hover:text-red-700 px-2 py-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </Card>
        ))
      )}
    </div>
  );
}

// ─── Payments Tab ────────────────────────────────────────
function PaymentsTab() {
  const [providers, setProviders] = useState<ProviderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const fetchProviders = useCallback(async () => {
    const res = await fetch("/api/admin/providers");
    const data = await res.json();
    setProviders(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const toggleExempt = async (t: ProviderRecord) => {
    const newExempt = !t.subscriptionExempt;
    await fetch(`/api/admin/providers/${t.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionExempt: newExempt }),
    });
    setMsg(`${t.user.name} is now ${newExempt ? "exempt" : "not exempt"}`);
    setTimeout(() => setMsg(""), 3000);
    fetchProviders();
  };

  if (loading) return <div className="text-center py-8 text-muted">Loading...</div>;

  const statusBadges = (t: ProviderRecord) => {
    const badges = [];
    badges.push(
      <Badge key="consumers" variant="info">
        {t._count.consumers} consumer{t._count.consumers !== 1 ? "s" : ""}
      </Badge>
    );
    if (t.subscriptionExempt) {
      badges.push(<Badge key="status" variant="warning">Exempt</Badge>);
    } else if (t.subscriptionStatus === "active") {
      badges.push(<Badge key="status" variant="success">Pro</Badge>);
      if (t.subscriptionPlan === "monthly") {
        badges.push(<Badge key="plan" variant="neutral">$5/month</Badge>);
      } else if (t.subscriptionPlan === "yearly") {
        badges.push(<Badge key="plan" variant="neutral">$50/year</Badge>);
      }
    } else if (t.subscriptionStatus === "trialing") {
      badges.push(<Badge key="status" variant="info">Trial</Badge>);
    } else if (t.subscriptionStatus === "past_due") {
      badges.push(<Badge key="status" variant="warning">Past Due</Badge>);
    } else if (t.subscriptionStatus === "canceled") {
      badges.push(<Badge key="status" variant="danger">Canceled</Badge>);
    } else {
      badges.push(<Badge key="status" variant="neutral">Free</Badge>);
    }
    return badges;
  };

  return (
    <div className="space-y-3">
      {msg && <Alert variant="success">{msg}</Alert>}
      <p className="text-sm text-muted mb-2">
        Manage provider subscriptions and exemptions. Exempt providers bypass subscription requirements.
      </p>
      {providers.length === 0 ? (
        <p className="text-muted text-center py-8">No providers yet.</p>
      ) : (
        providers.map((t) => (
          <Card key={t.id} padding="compact">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-foreground">{t.user.name}</span>
                  {statusBadges(t)}
                </div>
                <div className="text-sm text-muted mt-1">
                  {t.user.email}
                  {t.subscriptionPeriodEnd && t.subscriptionStatus === "active" && (
                    <span className="text-muted">
                      {" "}· Renews {format(new Date(t.subscriptionPeriodEnd), "MMM d, yyyy")}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant={t.subscriptionExempt ? "secondary" : "ghost"}
                size="sm"
                onClick={() => toggleExempt(t)}
              >
                {t.subscriptionExempt ? "Remove Exempt" : "Make Exempt"}
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

// ─── Settings Tab ────────────────────────────────────────
function SettingsTab({
  settings,
  onSettingsChange,
}: {
  settings: AppSettingsData | null;
  onSettingsChange: () => void;
}) {
  const [form, setForm] = useState<AppSettingsData>({
    paymentsEnabled: false,
    freeConsumerLimit: 5,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (settings && !initialized.current) {
      initialized.current = true;
      setForm({
        paymentsEnabled: settings.paymentsEnabled ?? false,
        freeConsumerLimit: settings.freeConsumerLimit ?? 5,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    onSettingsChange();
  };

  return (
    <Card className="space-y-6">
      <div>
        <h3 className="font-medium text-foreground mb-4">Feature Flags</h3>
        <Toggle
          label="Enable Payments"
          description="Show the Payments tab and enable Stripe integration"
          checked={form.paymentsEnabled}
          onChange={(checked) => setForm({ ...form, paymentsEnabled: checked })}
        />
      </div>

      {form.paymentsEnabled && (
        <div className="space-y-4 pt-4 border-t border-border">
          <p className="text-sm text-muted">
            Pricing is managed in your{" "}
            <a href="https://dashboard.stripe.com/products" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Stripe Dashboard
            </a>.
          </p>
          <Input
            label="Free Consumer Limit"
            type="number"
            min="0"
            value={form.freeConsumerLimit}
            onChange={(e) => setForm({ ...form, freeConsumerLimit: Number(e.target.value) })}
            helperText="Providers with this many or fewer consumers don't need a subscription"
            className="max-w-xs"
          />
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button
          variant="primary"
          onClick={handleSave}
          loading={saving}
        >
          {saving ? "Saving..." : "Save Settings"}
        </Button>
        {saved && <span className="text-sm text-green-600">Saved!</span>}
      </div>
    </Card>
  );
}

// ─── Feedback Tab ────────────────────────────────────────

interface FeedbackRow {
  id: string;
  userName: string;
  userEmail: string;
  category: string;
  message: string;
  status: string;
  adminResponse: string | null;
  createdAt: string;
}

function categoryBadgeVariant(category: string): "info" | "danger" | "primary" | "warning" {
  switch (category) {
    case "question": return "info";
    case "bug": return "danger";
    case "feature_request": return "primary";
    case "support": return "warning";
    default: return "info";
  }
}

function categoryLabel(category: string): string {
  switch (category) {
    case "question": return "Question";
    case "bug": return "Bug";
    case "feature_request": return "Feature Request";
    case "support": return "Support";
    default: return category;
  }
}

function FeedbackTab({ onStatsRefresh }: { onStatsRefresh: () => void }) {
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState("");
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);
  const [feedbackResponseDraft, setFeedbackResponseDraft] = useState("");
  const [feedbackStatusUpdating, setFeedbackStatusUpdating] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchFeedback = useCallback(async () => {
    setFeedbackLoading(true);
    const params = new URLSearchParams();
    if (feedbackCategoryFilter) params.set("category", feedbackCategoryFilter);
    if (feedbackStatusFilter) params.set("status", feedbackStatusFilter);
    const res = await fetch(`/api/admin/feedback?${params.toString()}`);
    const data = await res.json();
    setFeedback(data);
    setFeedbackLoading(false);
  }, [feedbackCategoryFilter, feedbackStatusFilter]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleToggleFeedbackStatus = async (item: FeedbackRow) => {
    setFeedbackStatusUpdating(true);
    const newStatus = item.status === "open" ? "resolved" : "open";
    await fetch(`/api/admin/feedback/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: newStatus,
        adminResponse: feedbackResponseDraft || item.adminResponse,
      }),
    });
    setFeedbackStatusUpdating(false);
    setMsg(`Feedback marked as ${newStatus}`);
    setTimeout(() => setMsg(""), 3000);
    setFeedbackResponseDraft("");
    fetchFeedback();
    onStatsRefresh();
  };

  const handleSaveResponse = async (item: FeedbackRow) => {
    setFeedbackStatusUpdating(true);
    await fetch(`/api/admin/feedback/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: item.status,
        adminResponse: feedbackResponseDraft,
      }),
    });
    setFeedbackStatusUpdating(false);
    setMsg("Response saved");
    setTimeout(() => setMsg(""), 3000);
    setFeedbackResponseDraft("");
    fetchFeedback();
  };

  if (feedbackLoading) return <div className="text-center py-8 text-muted">Loading feedback...</div>;

  return (
    <div className="space-y-4">
      {msg && <Alert variant="success">{msg}</Alert>}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="w-48">
          <Select
            value={feedbackCategoryFilter}
            onChange={(e) => setFeedbackCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="question">Question</option>
            <option value="bug">Bug</option>
            <option value="feature_request">Feature Request</option>
            <option value="support">Support</option>
          </Select>
        </div>
        <div className="w-40">
          <Select
            value={feedbackStatusFilter}
            onChange={(e) => setFeedbackStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
          </Select>
        </div>
      </div>

      {/* Feedback List */}
      {feedback.length === 0 ? (
        <p className="text-muted text-center py-8">No feedback found.</p>
      ) : (
        feedback.map((item) => (
          <Card key={item.id} padding="compact">
            <div
              className="flex items-start justify-between gap-3 cursor-pointer"
              onClick={() => {
                if (selectedFeedback === item.id) {
                  setSelectedFeedback(null);
                  setFeedbackResponseDraft("");
                } else {
                  setSelectedFeedback(item.id);
                  setFeedbackResponseDraft(item.adminResponse || "");
                }
              }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-foreground">{item.userName}</span>
                  <Badge variant={categoryBadgeVariant(item.category)}>
                    {categoryLabel(item.category)}
                  </Badge>
                  <Badge variant={item.status === "open" ? "warning" : "success"}>
                    {item.status === "open" ? "Open" : "Resolved"}
                  </Badge>
                </div>
                <div className="text-sm text-muted mt-1">{item.userEmail}</div>
                <div className="text-sm text-foreground mt-1 line-clamp-1">
                  {item.message}
                </div>
                <div className="text-xs text-muted mt-1">
                  {format(new Date(item.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </div>
              </div>
              <button className="text-xs text-primary hover:text-primary-light px-2 py-1 shrink-0">
                {selectedFeedback === item.id ? "Collapse" : "Details"}
              </button>
            </div>

            {selectedFeedback === item.id && (
              <div className="mt-4 space-y-3 border-t border-border pt-3">
                {/* Full message */}
                <div>
                  <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1">Full Message</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap bg-surface-alt rounded-lg p-3">
                    {item.message}
                  </p>
                </div>

                {/* Admin response */}
                <div>
                  <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1">Admin Response</p>
                  <Textarea
                    value={feedbackResponseDraft}
                    onChange={(e) => setFeedbackResponseDraft(e.target.value)}
                    placeholder="Write a response to the user..."
                    rows={3}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSaveResponse(item)}
                    loading={feedbackStatusUpdating}
                    disabled={!feedbackResponseDraft.trim()}
                  >
                    Save Response
                  </Button>
                  <Button
                    variant={item.status === "open" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => handleToggleFeedbackStatus(item)}
                    loading={feedbackStatusUpdating}
                  >
                    {item.status === "open" ? "Mark Resolved" : "Reopen"}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))
      )}
    </div>
  );
}

// ─── Main Admin Dashboard ────────────────────────────────
function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("providers");
  const [stats, setStats] = useState<Stats | null>(null);
  const [settings, setSettings] = useState<AppSettingsData | null>(null);

  const fetchStats = useCallback(async () => {
    const res = await fetch("/api/admin/stats");
    const data = await res.json();
    setStats(data);
  }, []);

  const fetchSettings = useCallback(async () => {
    const res = await fetch("/api/admin/settings");
    const data = await res.json();
    setSettings(data);
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    const isAdmin = (session.user as any)?.isAdmin;
    if (!isAdmin) {
      const role = (session.user as any)?.role;
      router.push(role === "PROVIDER" ? "/dashboard/provider" : "/dashboard/consumer");
      return;
    }
    fetchStats();
    fetchSettings();
  }, [session, status, router, fetchStats, fetchSettings]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  const isAdmin = (session.user as any)?.isAdmin;
  if (!isAdmin) return null;

  const tabs: { key: Tab; label: string; hidden?: boolean }[] = [
    { key: "providers", label: "Providers" },
    { key: "consumers", label: "Consumers" },
    { key: "payments", label: "Payments", hidden: !settings?.paymentsEnabled },
    { key: "feedback", label: "Feedback" },
    { key: "settings", label: "Settings" },
  ];

  const visibleTabs = tabs.filter((t) => !t.hidden);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-foreground mb-1">Admin Dashboard</h1>
        <p className="text-sm text-muted mb-6">Manage providers, consumers, and app settings</p>

        <StatsHeader stats={stats} />

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto">
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-[var(--ds-radius-default)] text-sm font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
                activeTab === tab.key
                  ? "bg-primary text-white"
                  : "text-muted hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "providers" && <ProvidersTab />}
        {activeTab === "consumers" && <ConsumersTab />}
        {activeTab === "payments" && <PaymentsTab />}
        {activeTab === "feedback" && <FeedbackTab onStatsRefresh={fetchStats} />}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <SettingsTab settings={settings} onSettingsChange={fetchSettings} />
            <ChangePasswordSection />
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return <AdminDashboard />;
}
