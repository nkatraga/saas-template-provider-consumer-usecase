// Hook to register for Expo push notifications, send the token to the
// server, and set up foreground / background notification listeners.

import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

// Configure how notifications are displayed when the app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register for push notifications (permissions + Expo token), send the token
 * to the backend, and listen for incoming notifications.
 *
 * Returns the Expo push token string (or null if unavailable).
 */
export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();
  const { user } = useAuth();

  useEffect(() => {
    // Only register when the user is authenticated.
    if (!user) return;

    registerForPushNotifications().then((token) => {
      if (token) {
        setExpoPushToken(token);
        // Send the push token to the server.
        api
          .post("/api/user/push-token", { token })
          .catch(console.error);
      }
    });

    // Foreground: notification received while app is open.
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
      });

    // Background / tap: user tapped on a notification.
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [user]);

  return { expoPushToken };
}

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------

async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === "web") return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    return tokenData.data;
  } catch {
    return null;
  }
}
