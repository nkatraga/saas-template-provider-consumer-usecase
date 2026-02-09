"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";
import { Button, Input, Card, Alert } from "@/components/ui";

// [Template] — Password reset page. Validates token from URL and accepts new password.

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [valid, setValid] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function validateToken() {
      try {
        const res = await fetch(`/api/auth/reset-password/${token}`);
        const data = await res.json();

        if (res.ok && data.valid) {
          setValid(true);
          setEmail(data.email);
        } else {
          setError(data.error || "Invalid or expired reset link");
        }
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setValidating(false);
      }
    }

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/auth/signin?reset=success");
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      heading="Choose a new password."
      subheading="Pick something secure — at least 8 characters."
    >
      <Card>
        {validating ? (
          <p className="text-muted text-center">Validating reset link...</p>
        ) : !valid ? (
          <div>
            <h1 className="text-2xl font-bold text-center mb-2">
              Invalid Reset Link
            </h1>
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
            <Link href="/auth/forgot-password">
              <Button className="w-full">Request a New Reset Link</Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-center mb-2">
              Reset Password
            </h1>
            <p className="text-muted text-center mb-6">
              Enter a new password for {email}
            </p>

            {error && (
              <Alert variant="error" className="mb-4">
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="New Password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
              />

              <Button
                type="submit"
                loading={loading}
                className="w-full"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          </>
        )}
      </Card>
    </AuthLayout>
  );
}
