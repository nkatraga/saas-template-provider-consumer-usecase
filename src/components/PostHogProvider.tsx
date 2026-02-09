"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useSession } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, Suspense } from "react";

// [Template:Integration] — PostHog analytics provider. Replace with your analytics service (Mixpanel, Amplitude, etc.).

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

if (typeof window !== "undefined" && POSTHOG_KEY) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: false, // We capture manually on route change
    capture_pageleave: true,
  });
}

function PostHogPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!POSTHOG_KEY) return;
    const url = window.origin + pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

function PostHogIdentify() {
  const { data: session, status } = useSession();
  const prevStatus = useRef(status);

  useEffect(() => {
    if (!POSTHOG_KEY) return;

    if (status === "authenticated" && session?.user) {
      const user = session.user as any;
      posthog.identify(user.id, {
        email: user.email,
        name: user.name,
        role: user.role,
        isAdmin: user.isAdmin,
        providerId: user.providerId,
      });
    }

    // Reset on sign-out
    if (prevStatus.current === "authenticated" && status === "unauthenticated") {
      posthog.reset();
    }
    prevStatus.current = status;
  }, [status, session]);

  return null;
}

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  if (!POSTHOG_KEY) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageview />
      </Suspense>
      <PostHogIdentify />
      {children}
    </PHProvider>
  );
}
