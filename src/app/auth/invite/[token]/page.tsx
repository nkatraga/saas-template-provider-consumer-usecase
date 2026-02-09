"use client";

import { useState, useEffect, use } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import { Button, Input, Card, Alert, Select } from "@/components/ui";

// [Template] — Invite acceptance page. Processes invite token and creates user account.

export default function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    preferredContact: "email",
    serviceType: "General",
  });

  useEffect(() => {
    fetch(`/api/auth/invite/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setInvite(data);
          setForm((f) => ({ ...f, email: data.recipientEmail }));
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load invitation");
        setLoading(false);
      });
  }, [token]);

  // Signed-in user joining a new provider
  const handleJoinExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch(`/api/auth/invite/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: session?.user?.name,
        email: session?.user?.email,
        password: "placeholder-not-needed",
        serviceType: form.serviceType,
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error || "Failed to join business");
      return;
    }

    setJoinSuccess(true);
    setTimeout(() => router.push("/dashboard/consumer"), 1500);
  };

  // New user registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch(`/api/auth/invite/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Registration failed");
      setSubmitting(false);
      return;
    }

    if (data.alreadyHasAccount) {
      // Existing user just got enrolled — redirect to sign in
      setSubmitting(false);
      setJoinSuccess(true);
      setError("");
      setTimeout(() => router.push("/auth/signin"), 2000);
      return;
    }

    // Auto sign in new user
    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setSubmitting(false);
    if (result?.error) {
      setError("Account created but sign-in failed. Please sign in manually.");
    } else {
      router.push("/dashboard/consumer");
    }
  };

  if (loading || sessionStatus === "loading") {
    return (
      <AuthLayout heading="Loading your invitation." subheading="Just a moment...">
        <Card className="text-center py-12">
          <p className="text-muted">Loading invitation...</p>
        </Card>
      </AuthLayout>
    );
  }

  if (error && !invite) {
    return (
      <AuthLayout heading="Invitation" subheading="Something went wrong.">
        <Card className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <a href="/auth/signin" className="text-primary hover:underline">
            Go to sign in
          </a>
        </Card>
      </AuthLayout>
    );
  }

  if (joinSuccess) {
    return (
      <AuthLayout heading="You're in!" subheading="Welcome aboard.">
        <Card className="text-center py-12">
          <p className="text-green-600 text-lg font-medium mb-2">
            Successfully joined {invite.businessName}!
          </p>
          <p className="text-muted">Redirecting...</p>
        </Card>
      </AuthLayout>
    );
  }

  const authHeading = `Join ${invite?.businessName || "a team"}.`;
  const authSubheading = `${invite?.providerName || "Your provider"} invited you to manage bookings on AppName.`;

  // Case 1: User is already signed in — simplified join view
  if (session?.user) {
    return (
      <AuthLayout heading={authHeading} subheading={authSubheading}>
        <Card>
          <h1 className="text-2xl font-bold text-center mb-2">
            Join {invite.businessName}
          </h1>
          <p className="text-muted text-center mb-6">
            {invite.providerName} invited you as a{" "}
            {invite.role.toLowerCase()}
          </p>

          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}

          <p className="text-sm text-muted mb-4">
            Signed in as <strong>{session.user.email}</strong>
          </p>

          <form onSubmit={handleJoinExisting} className="space-y-4">
            <Input
              label="ServiceType"
              type="text"
              value={form.serviceType}
              onChange={(e) =>
                setForm({ ...form, serviceType: e.target.value })
              }
              placeholder="e.g., Consulting, Tutoring, Coaching"
            />

            <Button
              type="submit"
              loading={submitting}
              className="w-full"
            >
              {submitting ? "Joining..." : "Join Team"}
            </Button>
          </form>
        </Card>
      </AuthLayout>
    );
  }

  // Case 2: Not signed in, but recipient already has an account
  if (invite.recipientHasAccount) {
    return (
      <AuthLayout heading={authHeading} subheading={authSubheading}>
        <Card>
          <h1 className="text-2xl font-bold text-center mb-2">
            Join {invite.businessName}
          </h1>
          <p className="text-muted text-center mb-6">
            {invite.providerName} invited you as a{" "}
            {invite.role.toLowerCase()}
          </p>

          <Alert variant="info" className="mb-4">
            You already have a AppName account. Sign in first, then
            revisit this invite link to join.
          </Alert>

          <a href="/auth/signin">
            <Button className="w-full">Sign In</Button>
          </a>
        </Card>
      </AuthLayout>
    );
  }

  // Case 3: New user registration
  return (
    <AuthLayout heading={authHeading} subheading={authSubheading}>
      <Card>
        <h1 className="text-2xl font-bold text-center mb-2">
          Join {invite.businessName}
        </h1>
        <p className="text-muted text-center mb-6">
          {invite.providerName} invited you as a{" "}
          {invite.role.toLowerCase()}
        </p>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Your Name"
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <Input
            label="Phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            helperText="Optional"
          />

          <Select
            label="Preferred Contact Method"
            value={form.preferredContact}
            onChange={(e) =>
              setForm({ ...form, preferredContact: e.target.value })
            }
          >
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="both">Both</option>
          </Select>

          <Input
            label="ServiceType"
            type="text"
            value={form.serviceType}
            onChange={(e) =>
              setForm({ ...form, serviceType: e.target.value })
            }
            placeholder="e.g., Consulting, Tutoring, Coaching"
          />

          <Input
            label="Password"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            placeholder="At least 8 characters"
          />

          <Button
            type="submit"
            loading={submitting}
            className="w-full"
          >
            {submitting ? "Creating account..." : "Join Team"}
          </Button>
        </form>
      </Card>
    </AuthLayout>
  );
}
