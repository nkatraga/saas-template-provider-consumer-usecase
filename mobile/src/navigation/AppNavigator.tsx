// Top-level navigator that gates on authentication state.
// Shows a loading indicator while the auth token is being restored,
// then renders the AuthStack or RootStack based on whether a user exists.

import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "../lib/auth";
import { colors } from "../lib/theme";

import AuthStack from "./AuthStack";
import RootStack from "./RootStack";

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  // Show a splash / loading indicator while restoring the stored token.
  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return user ? <RootStack /> : <AuthStack />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
});
