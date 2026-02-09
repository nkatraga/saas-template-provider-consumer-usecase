"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";
import { Button, Input, PasswordInput, Card, Alert } from "@/components/ui";
import { User, Building2, Mail, Phone, Lock } from "lucide-react";

// [Template] — Sign-up page with registration form, role selection, and email verification redirect.

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    businessName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        role: "PROVIDER",
        phone: form.phone || undefined,
        businessName: form.businessName || undefined,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Registration failed");
      setLoading(false);
      return;
    }

    setLoading(false);

    // Redirect to verification page
    if (data.requiresVerification) {
      router.push(`/auth/verify-email?email=${encodeURIComponent(form.email)}`);
    } else {
      router.push("/auth/signin");
    }
  };

  return (
    <AuthLayout
      heading="Get started with AppName."
      subheading="Create an account and start managing bookings, consumers, and schedules in minutes."
    >
      <Card>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-center mb-1.5">
          Create your account
        </h1>
        <p className="text-[#6b5c4f] text-center mb-8">
          Sign up as a provider to get started
        </p>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="flex items-center gap-1.5 text-sm font-medium text-[#6b5c4f] mb-1.5">
                <User className="w-3.5 h-3.5" />
                Your Name
              </label>
              <Input
                id="name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jane Smith"
              />
            </div>

            <div>
              <label htmlFor="business-name" className="flex items-center gap-1.5 text-sm font-medium text-[#6b5c4f] mb-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Business Name
              </label>
              <Input
                id="business-name"
                type="text"
                value={form.businessName}
                onChange={(e) =>
                  setForm({ ...form, businessName: e.target.value })
                }
                placeholder="My Business"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="flex items-center gap-1.5 text-sm font-medium text-[#6b5c4f] mb-1.5">
                <Mail className="w-3.5 h-3.5" />
                Email
              </label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="provider@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="flex items-center gap-1.5 text-sm font-medium text-[#6b5c4f] mb-1.5">
                <Phone className="w-3.5 h-3.5" />
                Phone
                {" "}
                <span className="text-[#9b8b7d] font-normal">(optional)</span>
              </label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="flex items-center gap-1.5 text-sm font-medium text-[#6b5c4f] mb-1.5">
                <Lock className="w-3.5 h-3.5" />
                Password
              </label>
              <PasswordInput
                id="password"
                required
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="flex items-center gap-1.5 text-sm font-medium text-[#6b5c4f] mb-1.5">
                <Lock className="w-3.5 h-3.5" />
                Confirm Password
              </label>
              <PasswordInput
                id="confirm-password"
                required
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-sm text-[#6b5c4f]">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
          <p className="text-xs text-[#9b8b7d] mt-2">
            Consumers and parents join via invitation from their provider.
          </p>
        </div>
      </Card>
    </AuthLayout>
  );
}
