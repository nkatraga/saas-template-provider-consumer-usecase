import { auth } from "./auth";
import { prisma } from "./prisma";

// [Template] — Session resolution helper. Provides getServerSession with DB fallback for role/profile data.

/**
 * Get the current session and resolve providerId/consumerIds from DB if missing.
 * This handles the case where the JWT was minted before the profile was created.
 */
export async function getSessionWithIds() {
  const session = await auth();
  if (!session?.user) return null;

  const user = session.user as any;

  // Resolve providerId if missing
  if (user.role === "PROVIDER" && !user.providerId && user.id) {
    const provider = await prisma.provider.findUnique({
      where: { userId: user.id },
    });
    if (provider) user.providerId = provider.id;
  }

  // Resolve consumerIds if missing or empty
  if ((user.role === "CONSUMER" || user.role === "PARENT") && (!user.consumerIds || user.consumerIds.length === 0) && user.id) {
    const consumers = await prisma.consumer.findMany({
      where: { userId: user.id },
    });
    user.consumerIds = consumers.map((s: any) => s.id);
  }

  return session;
}
