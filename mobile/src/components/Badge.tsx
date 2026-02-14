import React from "react";
import { View, Text, StyleSheet } from "react-native";

type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "primary" | "info";

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
}

const variantColors: Record<
  BadgeVariant,
  { bg: string; text: string }
> = {
  success: { bg: "#DCFCE7", text: "#15803D" },
  warning: { bg: "#FEF9C3", text: "#A16207" },
  danger: { bg: "#FEE2E2", text: "#B91C1C" },
  neutral: { bg: "#F3F4F6", text: "#4B5563" },
  primary: { bg: "#EEF2FF", text: "#4338CA" },
  info: { bg: "#DBEAFE", text: "#1D4ED8" },
};

export function Badge({ text, variant = "neutral" }: BadgeProps) {
  const badgeColors = variantColors[variant];

  return (
    <View style={[styles.badge, { backgroundColor: badgeColors.bg }]}>
      <Text style={[styles.text, { color: badgeColors.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },
});
