import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { jwtVerify } from "jose";
import { getSessionWithIds } from "./session";

// [Template] -- Admin / auth guards that support both web (NextAuth cookie) and mobile (Bearer JWT).

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isAdmin: boolean;
  providerId: string | null;
  consumerIds: string[];
  profileImage: string | null;
}

/**
 * Verify a Bearer token from the Authorization header.
 * Returns the user payload if valid, null otherwise.
 */
async function verifyBearerToken(): Promise<AuthUser | null> {
  try {
    const headersList = await headers();
    const authorization = headersList.get("authorization");
    if (!authorization?.startsWith("Bearer ")) return null;

    const token = authorization.slice(7);
    const { payload } = await jwtVerify(token, secret);

    return {
      id: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
      role: (payload.role as string) ?? "CONSUMER",
      isAdmin: (payload.isAdmin as boolean) ?? false,
      providerId: (payload.providerId as string) ?? null,
      consumerIds: (payload.consumerIds as string[]) ?? [],
      profileImage: (payload.profileImage as string) ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * Get the authenticated user from either NextAuth session (web) or Bearer token (mobile).
 */
async function getAuthUser(): Promise<AuthUser | null> {
  // Try Bearer token first (mobile clients)
  const bearerUser = await verifyBearerToken();
  if (bearerUser) return bearerUser;

  // Fall back to NextAuth cookie session (web)
  const session = await getSessionWithIds();
  if (!session?.user) return null;

  const user = session.user as any;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role ?? "CONSUMER",
    isAdmin: user.isAdmin ?? false,
    providerId: user.providerId ?? null,
    consumerIds: user.consumerIds ?? [],
    profileImage: user.profileImage ?? null,
  };
}

/**
 * Require admin access. Returns the session if admin, or a 401/403 response.
 */
export async function requireAdmin() {
  const user = await getAuthUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), session: null };
  }

  if (!user.isAdmin) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), session: null };
  }

  return { error: null, session: { user } };
}

/**
 * Require any authenticated user. Returns the user or a 401 response.
 */
export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), session: null, user: null };
  }

  return { error: null, session: { user }, user };
}
