import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api, ApiError } from "../lib/api";
import { API } from "../../../shared/api";
import { colors, spacing, fontSize, fontWeight, borderRadius } from "../lib/theme";
import { Card, Button, Badge, Alert } from "../components";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FeedbackItem {
  id: string;
  category: string;
  message: string;
  status: string;
  adminResponse: string | null;
  createdAt: string;
}

const CATEGORIES = [
  { key: "question", label: "Question" },
  { key: "bug", label: "Bug Report" },
  { key: "feature_request", label: "Feature Request" },
  { key: "support", label: "Support" },
] as const;

function categoryBadgeVariant(cat: string) {
  switch (cat) {
    case "question": return "info" as const;
    case "bug": return "danger" as const;
    case "feature_request": return "primary" as const;
    case "support": return "warning" as const;
    default: return "neutral" as const;
  }
}

function categoryLabel(cat: string) {
  switch (cat) {
    case "question": return "Question";
    case "bug": return "Bug Report";
    case "feature_request": return "Feature Request";
    case "support": return "Support";
    default: return cat;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FeedbackScreen() {
  const [category, setCategory] = useState("question");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [history, setHistory] = useState<FeedbackItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const data = await api.get<FeedbackItem[]>(API.feedback);
      setHistory(data);
    } catch (err) {
      console.error("Failed to load feedback history:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  }, [fetchHistory]);

  const handleSubmit = useCallback(async () => {
    setSuccess("");
    setError("");

    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }

    setSubmitting(true);
    try {
      await api.post(API.feedback, { category, message });
      setSuccess("Feedback submitted successfully!");
      setMessage("");
      fetchHistory();
      setTimeout(() => setSuccess(""), 5000);
    } catch (err: unknown) {
      const msg =
        err instanceof ApiError ? err.message : "Failed to submit feedback";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }, [category, message, fetchHistory]);

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.container}>
          {/* Feedback Form */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Send Feedback</Text>

            <Text style={styles.label}>Category</Text>
            <View style={styles.pillRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.pill,
                    category === cat.key && styles.pillActive,
                  ]}
                  onPress={() => setCategory(cat.key)}
                >
                  <Text
                    style={[
                      styles.pillText,
                      category === cat.key && styles.pillTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Message</Text>
            <TextInput
              style={styles.textArea}
              value={message}
              onChangeText={setMessage}
              placeholder="Tell us what's on your mind..."
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              testID="feedback-message"
            />

            {error ? (
              <Alert message={error} variant="error" onDismiss={() => setError("")} />
            ) : null}
            {success ? <Alert message={success} variant="success" /> : null}

            <View style={styles.buttonWrap}>
              <Button
                title={submitting ? "Submitting..." : "Submit"}
                onPress={handleSubmit}
                loading={submitting}
                testID="feedback-submit"
              />
            </View>
          </Card>

          {/* History */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Your Submissions</Text>

            {historyLoading ? (
              <Text style={styles.emptyText}>Loading...</Text>
            ) : history.length === 0 ? (
              <Text style={styles.emptyText}>No submissions yet.</Text>
            ) : (
              history.map((item) => (
                <View key={item.id} style={styles.historyItem}>
                  <View style={styles.historyBadges}>
                    <Badge
                      text={categoryLabel(item.category)}
                      variant={categoryBadgeVariant(item.category)}
                    />
                    <Badge
                      text={item.status}
                      variant={item.status === "open" ? "warning" : "success"}
                    />
                    <Text style={styles.historyDate}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.historyMessage} numberOfLines={3}>
                    {item.message}
                  </Text>
                  {item.adminResponse ? (
                    <View style={styles.adminResponseBox}>
                      <Text style={styles.adminResponseLabel}>Admin Response</Text>
                      <Text style={styles.adminResponseText}>{item.adminResponse}</Text>
                    </View>
                  ) : null}
                </View>
              ))
            )}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
  },
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  card: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.foreground,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.foreground,
    marginBottom: 6,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.primary50,
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    fontSize: fontSize.sm,
    color: colors.foreground,
    fontWeight: fontWeight.medium,
  },
  pillTextActive: {
    color: colors.white,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: fontSize.sm,
    color: colors.foreground,
    backgroundColor: colors.surface,
    minHeight: 100,
    marginBottom: spacing.md,
  },
  buttonWrap: {
    marginTop: spacing.xs,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.muted,
    textAlign: "center",
    paddingVertical: spacing.md,
  },
  historyItem: {
    backgroundColor: colors.primary50,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    marginBottom: spacing.sm,
  },
  historyBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  historyDate: {
    fontSize: fontSize.xs,
    color: colors.muted,
  },
  historyMessage: {
    fontSize: fontSize.sm,
    color: colors.foreground,
    lineHeight: 20,
  },
  adminResponseBox: {
    marginTop: spacing.xs,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: "#FFF1E6",
    borderWidth: 1,
    borderColor: "rgba(196, 77, 3, 0.2)",
  },
  adminResponseLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
    marginBottom: 2,
  },
  adminResponseText: {
    fontSize: fontSize.sm,
    color: colors.foreground,
    lineHeight: 20,
  },
});
