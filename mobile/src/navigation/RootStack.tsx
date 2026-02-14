// Root stack navigator -- wraps the main tabs and all push/modal screens
// that are reachable from within the authenticated portion of the app.

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { RootStackParamList } from "./types";
import { colors } from "../lib/theme";

import MainTabs from "./MainTabs";
import FeedbackScreen from "../screens/FeedbackScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.white },
        headerTitleStyle: { color: colors.foreground, fontWeight: "600" },
        presentation: "card",
      }}
    >
      {/* Main tabs -- no header (each tab handles its own) */}
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />

      {/* Detail / push screens */}
      <Stack.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{ title: "Help & Feedback" }}
      />
    </Stack.Navigator>
  );
}
