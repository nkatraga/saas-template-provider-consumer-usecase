"use client";

import { useState } from "react";
import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";
import { Button, Input, Card, Alert } from "@/components/ui";

// [Template] — Forgot password page. Collects email and triggers password reset flow.

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      heading="Reset your password."
      subheading="We'll send you a link to get back into your account."
    >
      <Card>
        <h1 className="text-2xl font-bold text-center mb-2">
          Forgot Password
        </h1>
        <p className="text-muted text-center mb-6">
          Enter your email and we&apos;ll send you a reset link
        </p>

        {submitted ? (
          <div>
            <Alert variant="success" className="mb-4">
              If an account exists with that email, we&apos;ve sent a reset link.
            </Alert>
            <Link href="/auth/signin">
              <Button className="w-full">Back to Sign In</Button>
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <Alert variant="error" className="mb-4">
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />

              <Button
                type="submit"
                loading={loading}
                className="w-full"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>

            <p className="text-sm text-muted text-center mt-6">
              Remember your password?{" "}
              <Link
                href="/auth/signin"
                className="text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </>
        )}
      </Card>
    </AuthLayout>
  );
}
