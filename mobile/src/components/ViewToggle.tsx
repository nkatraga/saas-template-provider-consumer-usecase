import { View, Pressable, Text, StyleSheet } from "react-native";
import { List, CalendarDays } from "lucide-react-native";
import { colors, spacing, fontSize, fontWeight, borderRadius } from "../lib/theme";

interface ViewToggleProps {
  value: "list" | "calendar";
  onValueChange: (value: "list" | "calendar") => void;
}

export function ViewToggle({ value, onValueChange }: ViewToggleProps) {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.button, value === "list" && styles.active]}
        onPress={() => onValueChange("list")}
      >
        <List size={16} color={value === "list" ? colors.surface : colors.muted} />
        <Text style={[styles.text, value === "list" && styles.activeText]}>List View</Text>
      </Pressable>
      <Pressable
        style={[styles.button, value === "calendar" && styles.active]}
        onPress={() => onValueChange("calendar")}
      >
        <CalendarDays size={16} color={value === "calendar" ? colors.surface : colors.muted} />
        <Text style={[styles.text, value === "calendar" && styles.activeText]}>Calendar View</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: "hidden",
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  active: {
    backgroundColor: colors.primary,
  },
  text: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.muted,
  },
  activeText: {
    color: colors.surface,
  },
});
