import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../lib/auth";
import { api } from "../lib/api";
import { API } from "../../../shared/api";
import { colors, spacing, fontSize, fontWeight, borderRadius } from "../lib/theme";
import { Card, Badge, Avatar, Skeleton } from "../components";

interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  consumer?: {
    id: string;
    serviceType: string;
    user: { name: string };
  };
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUpcoming = useCallback(async () => {
    try {
      const data = await api.get<Booking[] | { myBookings: Booking[] }>(API.bookings);
      // Consumer response wraps bookings in myBookings
      const list = Array.isArray(data) ? data : (data.myBookings ?? []);
      // Take only the next 3 upcoming
      setBookings(list.slice(0, 3));
    } catch {
      // Silently fail -- user may not have bookings
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUpcoming();
  }, [fetchUpcoming]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUpcoming();
    setRefreshing(false);
  }, [fetchUpcoming]);

  const statusVariant = (status: string) => {
    switch (status) {
      case "scheduled":
        return "primary" as const;
      case "exchanged":
        return "info" as const;
      case "cancelled":
        return "danger" as const;
      case "cancel_pending":
        return "warning" as const;
      default:
        return "neutral" as const;
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.container}>
          {/* Welcome */}
          <View style={styles.welcomeRow}>
            <Avatar
              name={user?.name}
              uri={user?.profileImage ?? undefined}
              size="lg"
            />
            <View style={styles.welcomeText}>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.name ?? "User"}</Text>
              <Badge
                text={user?.role ?? "CONSUMER"}
                variant={user?.role === "PROVIDER" ? "primary" : "info"}
              />
            </View>
          </View>

          {/* Upcoming Bookings */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Upcoming Bookings</Text>

            {loading ? (
              <View style={styles.skeletonGroup}>
                <Skeleton width="100%" height={60} borderRadius={8} />
                <Skeleton width="100%" height={60} borderRadius={8} style={{ marginTop: 8 }} />
              </View>
            ) : bookings.length === 0 ? (
              <Text style={styles.emptyText}>No upcoming bookings</Text>
            ) : (
              bookings.map((booking) => (
                <View key={booking.id} style={styles.bookingItem}>
                  <View style={styles.bookingHeader}>
                    <Text style={styles.bookingDate}>
                      {formatDate(booking.startTime)}
                    </Text>
                    <Badge
                      text={booking.status}
                      variant={statusVariant(booking.status)}
                    />
                  </View>
                  <Text style={styles.bookingTime}>
                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                  </Text>
                  {booking.consumer && (
                    <Text style={styles.bookingConsumer}>
                      {booking.consumer.user.name} -- {booking.consumer.serviceType}
                    </Text>
                  )}
                </View>
              ))
            )}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
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
    paddingTop: spacing.md,
  },
  welcomeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  welcomeText: {
    flex: 1,
    gap: spacing.xs,
  },
  greeting: {
    fontSize: fontSize.sm,
    color: colors.muted,
  },
  userName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.foreground,
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
  skeletonGroup: {
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.muted,
    textAlign: "center",
    paddingVertical: spacing.md,
  },
  bookingItem: {
    backgroundColor: colors.primary50,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    marginBottom: spacing.sm,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  bookingDate: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.foreground,
  },
  bookingTime: {
    fontSize: fontSize.sm,
    color: colors.muted,
  },
  bookingConsumer: {
    fontSize: fontSize.xs,
    color: colors.muted,
    marginTop: 2,
  },
});
