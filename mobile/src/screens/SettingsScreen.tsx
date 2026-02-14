import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useAuth } from "../lib/auth";
import { api, ApiError } from "../lib/api";
import { API } from "../../../shared/api";
import { colors, spacing, fontSize, fontWeight, borderRadius } from "../lib/theme";
import { Button, Input, Card, Alert, Avatar } from "../components";

type SettingsNav = NativeStackNavigationProp<RootStackParamList>;

export default function SettingsScreen() {
  const navigation = useNavigation<SettingsNav>();
  const { user, logout } = useAuth();

  // Profile editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Password change
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSaveProfile = useCallback(async () => {
    setProfileMsg("");
    setProfileSaving(true);
    try {
      await api.put(API.userProfile, { name, phone });
      setProfileMsg("Profile updated!");
      setEditingProfile(false);
      setTimeout(() => setProfileMsg(""), 3000);
    } catch (err: unknown) {
      const msg =
        err instanceof ApiError ? err.message : "Failed to update profile";
      setProfileMsg(msg);
    } finally {
      setProfileSaving(false);
    }
  }, [name, phone]);

  const handleChangePassword = useCallback(async () => {
    setPasswordMsg("");
    setPasswordError("");

    if (!currentPassword || !newPassword) {
      setPasswordError("Please fill in both fields");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }

    setPasswordSaving(true);
    try {
      await api.post(API.changePassword, { currentPassword, newPassword });
      setPasswordMsg("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setChangingPassword(false);
      setTimeout(() => setPasswordMsg(""), 3000);
    } catch (err: unknown) {
      const msg =
        err instanceof ApiError ? err.message : "Failed to change password";
      setPasswordError(msg);
    } finally {
      setPasswordSaving(false);
    }
  }, [currentPassword, newPassword]);

  const handleSignOut = useCallback(async () => {
    await logout();
  }, [logout]);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.pageTitle}>Settings</Text>

          {/* Profile Card */}
          <Card style={styles.card}>
            <View style={styles.profileHeader}>
              <Avatar
                name={user?.name}
                uri={user?.profileImage ?? undefined}
                size="lg"
              />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.name}</Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
                <Text style={styles.profileRole}>
                  {user?.role} {user?.isAdmin ? "(Admin)" : ""}
                </Text>
              </View>
            </View>

            {profileMsg ? (
              <Alert
                message={profileMsg}
                variant={profileMsg.includes("updated") ? "success" : "error"}
              />
            ) : null}

            {editingProfile ? (
              <View style={styles.editSection}>
                <Input
                  label="Name"
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  testID="settings-name-input"
                />
                <Input
                  label="Phone"
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Phone number"
                  keyboardType="phone-pad"
                  testID="settings-phone-input"
                />
                <View style={styles.editButtons}>
                  <Button
                    title="Save"
                    onPress={handleSaveProfile}
                    loading={profileSaving}
                    size="sm"
                  />
                  <Button
                    title="Cancel"
                    onPress={() => setEditingProfile(false)}
                    variant="ghost"
                    size="sm"
                  />
                </View>
              </View>
            ) : (
              <Button
                title="Edit Profile"
                onPress={() => setEditingProfile(true)}
                variant="secondary"
                size="sm"
              />
            )}
          </Card>

          {/* Change Password */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Security</Text>

            {passwordMsg ? (
              <Alert message={passwordMsg} variant="success" />
            ) : null}
            {passwordError ? (
              <Alert
                message={passwordError}
                variant="error"
                onDismiss={() => setPasswordError("")}
              />
            ) : null}

            {changingPassword ? (
              <View style={styles.editSection}>
                <Input
                  label="Current Password"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  secureTextEntry
                  testID="current-password-input"
                />
                <Input
                  label="New Password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="At least 8 characters"
                  secureTextEntry
                  testID="new-password-input"
                />
                <View style={styles.editButtons}>
                  <Button
                    title="Update Password"
                    onPress={handleChangePassword}
                    loading={passwordSaving}
                    size="sm"
                  />
                  <Button
                    title="Cancel"
                    onPress={() => {
                      setChangingPassword(false);
                      setPasswordError("");
                    }}
                    variant="ghost"
                    size="sm"
                  />
                </View>
              </View>
            ) : (
              <Button
                title="Change Password"
                onPress={() => setChangingPassword(true)}
                variant="secondary"
                size="sm"
              />
            )}
          </Card>

          {/* Menu Items */}
          <Card style={styles.card}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("Feedback")}
            >
              <Text style={styles.menuItemText}>Help & Feedback</Text>
              <Text style={styles.menuChevron}>{"\u203A"}</Text>
            </TouchableOpacity>

            {user?.isAdmin && (
              <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.menuItemText}>Admin Panel</Text>
                <Text style={styles.menuChevron}>{"\u203A"}</Text>
              </TouchableOpacity>
            )}
          </Card>

          {/* Sign Out */}
          <View style={styles.signOutWrap}>
            <Button
              title="Sign Out"
              onPress={handleSignOut}
              variant="danger"
              testID="sign-out-button"
            />
          </View>
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
  pageTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.foreground,
    marginBottom: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.foreground,
  },
  profileEmail: {
    fontSize: fontSize.sm,
    color: colors.muted,
    marginTop: 2,
  },
  profileRole: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.medium,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.foreground,
    marginBottom: spacing.md,
  },
  editSection: {
    marginTop: spacing.sm,
  },
  editButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemText: {
    fontSize: fontSize.base,
    color: colors.foreground,
    fontWeight: fontWeight.medium,
  },
  menuChevron: {
    fontSize: fontSize.xl,
    color: colors.muted,
  },
  signOutWrap: {
    marginTop: spacing.md,
  },
});
