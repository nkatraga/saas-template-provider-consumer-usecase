import { NextResponse } from "next/server";
import { getSessionWithIds } from "./session";

// [Template] — Admin role guard. Checks session for ADMIN role before allowing access.

/**
 * Require admin access. Returns the session if admin, or a 403 response.
 */
export async function requireAdmin() {
  const session = await getSessionWithIds();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), session: null };
  }

  const user = session.user as any;
  if (!user.isAdmin) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), session: null };
  }

  return { error: null, session };
}
