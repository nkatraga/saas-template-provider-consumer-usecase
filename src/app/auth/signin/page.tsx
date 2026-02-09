"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";
import { Button, Input, Card, Alert } from "@/components/ui";
import { Mail, Lock } from "lucide-react";

// [Template] — Sign-in page with credentials form, error handling, and redirect logic.

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isUnverified, setIsUnverified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const resetSuccess = searchParams.get("reset") === "success";
  const verifiedSuccess = searchParams.get("verified") === "success";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsUnverified(false);
    setResendMessage("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      // Check if failure is due to unverified email
      const checkRes = await fetch("/api/auth/check-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const checkData = await checkRes.json();

      if (!checkData.verified) {
        setError("Please verify your email before signing in.");
        setIsUnverified(true);
      } else {
        setError("Invalid email or password");
      }
    } else {
      // Fetch session to determine redirect
      const res = await fetch("/api/auth/session");
      const session = await res.json();
      const role = session?.user?.role;
      const isAdmin = session?.user?.isAdmin;

      if (isAdmin) {
        router.push("/admin");
      } else if (role === "PROVIDER") {
        router.push("/dashboard/provider");
      } else {
        router.push("/dashboard/consumer");
      }
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendMessage("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setResendMessage("Verification email sent! Check your inbox and spam folder.");
      } else {
        setResendMessage(data.error || "Failed to resend. Please try again.");
      }
    } catch {
      setResendMessage("Failed to resend. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <Card>
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-center mb-1.5">
        Welcome back
      </h1>
      <p className="text-[#6b5c4f] text-center mb-8">
        Sign in to manage your bookings
      </p>

      {resetSuccess && (
        <Alert variant="success" className="mb-4">
          Your password has been reset. You can now sign in with your new password.
        </Alert>
      )}

      {verifiedSuccess && (
        <Alert variant="success" className="mb-4">
          Your email has been verified! You can now sign in.
        </Alert>
      )}

      {error && (
        <Alert variant="error" className="mb-4">
          <p>{error}</p>
          {isUnverified && (
            <button
              onClick={handleResend}
              disabled={resending}
              className="mt-2 text-primary hover:underline font-medium disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend verification email"}
            </button>
          )}
        </Alert>
      )}

      {resendMessage && (
        <Alert variant="info" className="mb-4">
          {resendMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="flex items-center gap-1.5 text-sm font-medium text-[#6b5c4f] mb-1.5">
            <Mail className="w-3.5 h-3.5" />
            Email
          </label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="flex items-center gap-1.5 text-sm font-medium text-[#6b5c4f] mb-1.5">
            <Lock className="w-3.5 h-3.5" />
            Password
          </label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
          />
          <div className="text-right mt-1.5">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full"
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-border text-center">
        <p className="text-sm text-[#6b5c4f]">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-primary font-medium hover:underline"
          >
            Sign up as a provider
          </Link>
        </p>
        <p className="text-xs text-[#9b8b7d] mt-2">
          Consumers join via an invite from their provider — no sign-up needed.
        </p>
      </div>
    </Card>
  );
}

export default function SignInPage() {
  return (
    <AuthLayout
      heading="Welcome back."
      subheading="Sign in to manage bookings, review requests, and keep your schedule on track."
    >
      <Suspense>
        <SignInForm />
      </Suspense>
    </AuthLayout>
  );
}
