"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

// [Template] — NextAuth SessionProvider wrapper. Provides session context to client components.

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
