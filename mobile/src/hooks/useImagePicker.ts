// Hook for picking an image from the device library and uploading it to the
// server. Uses expo-image-picker for the picker UI and the SaaS template's
// API client for authentication.

import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import { TOKEN_KEY, getBaseUrl } from "../lib/api";

/**
 * Provides a `pickAndUpload` function that opens the image picker, lets the
 * user choose / crop an image, and uploads it to `/api/upload`.
 *
 * Returns the uploaded image URL (or null on cancel / error) and an
 * `uploading` flag for showing a loading indicator.
 */
export function useImagePicker() {
  const [uploading, setUploading] = useState(false);

  async function pickAndUpload(): Promise<string | null> {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return null;

    setUploading(true);
    try {
      const asset = result.assets[0];

      // Build multipart form data for the upload.
      const formData = new FormData();
      formData.append("file", {
        uri: asset.uri,
        type: asset.mimeType || "image/jpeg",
        name: asset.fileName || "photo.jpg",
      } as any);

      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const baseUrl = getBaseUrl();

      const res = await fetch(`${baseUrl}/api/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      return data.url;
    } catch (error) {
      console.error("Image upload error:", error);
      return null;
    } finally {
      setUploading(false);
    }
  }

  return { pickAndUpload, uploading };
}
