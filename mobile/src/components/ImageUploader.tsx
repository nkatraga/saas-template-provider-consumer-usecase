import { View, Text, Image, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Camera, User } from "lucide-react-native";
import { useImagePicker } from "../hooks/useImagePicker";
import { colors, spacing, fontSize, borderRadius } from "../lib/theme";

interface ImageUploaderProps {
  imageUrl?: string | null;
  onImageUploaded: (url: string) => void;
  size?: number;
  label?: string;
}

export function ImageUploader({ imageUrl, onImageUploaded, size = 96, label }: ImageUploaderProps) {
  const { pickAndUpload, uploading } = useImagePicker();

  const handlePress = async () => {
    const url = await pickAndUpload();
    if (url) onImageUploaded(url);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handlePress} disabled={uploading}>
        <View style={[styles.imageContainer, { width: size, height: size, borderRadius: size / 2 }]}>
          {uploading ? (
            <ActivityIndicator color={colors.primary} />
          ) : imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: size, height: size, borderRadius: size / 2 }}
            />
          ) : (
            <User size={size * 0.4} color={colors.muted} />
          )}
          <View style={[styles.cameraOverlay, { width: size * 0.3, height: size * 0.3, borderRadius: size * 0.15, bottom: 0, right: 0 }]}>
            <Camera size={size * 0.15} color={colors.surface} />
          </View>
        </View>
      </Pressable>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  imageContainer: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
  },
  cameraOverlay: {
    position: "absolute",
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.muted,
    marginTop: spacing.xs,
  },
});
