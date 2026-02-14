import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

type AlertVariant = "error" | "success" | "info";

interface AlertProps {
  message: string;
  variant?: AlertVariant;
  onDismiss?: () => void;
}

const variantConfig: Record<
  AlertVariant,
  { bg: string; border: string; text: string; icon: string }
> = {
  error: {
    bg: "#FEF2F2",
    border: "#DC2626",
    text: "#991B1B",
    icon: "!",
  },
  success: {
    bg: "#F0FDF4",
    border: "#16A34A",
    text: "#166534",
    icon: "\u2713",
  },
  info: {
    bg: "#EFF6FF",
    border: "#3B82F6",
    text: "#1E40AF",
    icon: "i",
  },
};

export function Alert({ message, variant = "info", onDismiss }: AlertProps) {
  const config = variantConfig[variant];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: config.bg, borderLeftColor: config.border },
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: config.border }]}>
        <Text style={styles.iconText}>{config.icon}</Text>
      </View>
      <Text style={[styles.message, { color: config.text }]} numberOfLines={3}>
        {message}
      </Text>
      {onDismiss && (
        <TouchableOpacity
          onPress={onDismiss}
          style={styles.dismiss}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.dismissText, { color: config.text }]}>
            {"\u2715"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  message: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  dismiss: {
    marginLeft: 12,
    padding: 4,
  },
  dismissText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
