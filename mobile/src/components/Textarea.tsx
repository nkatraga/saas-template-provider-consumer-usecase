import { View, Text, TextInput, StyleSheet, TextInputProps } from "react-native";
import { colors, spacing, fontSize, fontWeight, borderRadius } from "../lib/theme";

interface TextareaProps extends TextInputProps {
  label?: string;
  helperText?: string;
  error?: string;
}

export function Textarea({ label, helperText, error, style, ...props }: TextareaProps) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        multiline
        textAlignVertical="top"
        placeholderTextColor={colors.muted}
        {...props}
      />
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helper}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm + 2,
    fontSize: fontSize.base,
    color: colors.foreground,
    backgroundColor: colors.surface,
    minHeight: 100,
  },
  inputError: {
    borderColor: colors.danger,
  },
  helper: {
    fontSize: fontSize.xs,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  error: {
    fontSize: fontSize.xs,
    color: colors.danger,
    marginTop: spacing.xs,
  },
});
