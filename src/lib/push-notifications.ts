import { prisma } from "./prisma";

interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

/**
 * Send push notification to a user via Expo Push Notification service.
 */
export async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { expoPushToken: true },
  });

  if (!user?.expoPushToken) return;

  await sendPushNotifications([
    { to: user.expoPushToken, title, body, data },
  ]);
}

/**
 * Send push notifications via Expo Push Notification service.
 */
async function sendPushNotifications(messages: PushMessage[]) {
  if (messages.length === 0) return;

  try {
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    if (!res.ok) {
      console.error("Push notification failed:", await res.text());
    }
  } catch (error) {
    console.error("Push notification error:", error);
  }
}
