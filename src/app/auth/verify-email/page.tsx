"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";
import { Button, Card, Alert } from "@/components/ui";
import { Mail } from "lucide-react";

// [Template] — Email verification pending page. Polls verification status and redirects on success.

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleResend = async () => {
    if (!email) return;
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
    <Card className="text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Mail className="w-6 h-6 text-primary" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
      <p className="text-muted mb-6">
        We sent a verification link to{" "}
        {email ? (
          <strong className="text-foreground">{email}</strong>
        ) : (
          "your email"
        )}
        . Click the link to activate your account.
      </p>

      {resendMessage && (
        <Alert variant="info" className="mb-4">
          {resendMessage}
        </Alert>
      )}

      <div className="space-y-3">
        {email && (
          <Button
            variant="secondary"
            loading={resending}
            onClick={handleResend}
            className="w-full"
          >
            {resending ? "Sending..." : "Resend Verification Email"}
          </Button>
        )}

        <Link href="/auth/signin">
          <Button className="w-full">Back to Sign In</Button>
        </Link>
      </div>

      <p className="text-xs text-muted mt-6">
        The verification link expires in 24 hours.
      </p>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthLayout
      heading="Almost there."
      subheading="Check your inbox to verify your email and activate your account."
    >
      <Suspense>
        <VerifyEmailContent />
      </Suspense>
    </AuthLayout>
  );
}
