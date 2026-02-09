"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";
import { Button, Card } from "@/components/ui";
import { CheckCircle, XCircle } from "lucide-react";

// [Template] — Email verification confirmation page. Processes token from verification link.

export default function VerifyTokenPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch(`/api/auth/verify-email/${token}`);
        const data = await res.json();

        if (data.success) {
          setStatus("success");
          setTimeout(() => {
            router.push("/auth/signin?verified=success");
          }, 2000);
        } else {
          setStatus("error");
          setErrorMessage(data.error || "Verification failed");
        }
      } catch {
        setStatus("error");
        setErrorMessage("Something went wrong. Please try again.");
      }
    }

    if (token) verify();
  }, [token, router]);

  return (
    <AuthLayout
      heading="Verifying your email."
      subheading="Just a moment while we activate your account."
    >
      <Card className="text-center">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Verifying your email...</h1>
            <p className="text-muted">Just a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-xl font-bold mb-2 text-green-700">Email Verified!</h1>
            <p className="text-muted mb-4">
              Your account is now active. Redirecting to sign in...
            </p>
            <Link
              href="/auth/signin?verified=success"
              className="text-primary hover:underline text-sm"
            >
              Click here if not redirected
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <h1 className="text-xl font-bold mb-2 text-red-600">Verification Failed</h1>
            <p className="text-muted mb-6">{errorMessage}</p>
            <div className="space-y-3">
              <Link href="/auth/verify-email">
                <Button variant="secondary" className="w-full">
                  Request a New Link
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button className="w-full">Back to Sign In</Button>
              </Link>
            </div>
          </>
        )}
      </Card>
    </AuthLayout>
  );
}
