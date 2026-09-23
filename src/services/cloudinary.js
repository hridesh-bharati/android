// src/services/cloudinary.js
// ✅ Pure React Native (iOS + Android) Cloudinary Upload Helper

import { Platform } from "react-native";

const CLOUD_NAME = "draowpiml";
const UPLOAD_PRESET = "hridesh99!";

/**
 * Upload image to Cloudinary (mobile only)
 * @param {string} uri - Local file URI from ImagePicker
 * @param {string} mimeType - e.g. "image/jpeg"
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export const uploadToCloudinary = async (uri, mimeType = "image/jpeg") => {
  try {
    if (!uri) {
      throw new Error("No file URI provided");
    }

    // ✅ iOS sometimes returns file:// prefix which breaks upload
    const cleanUri =
      Platform.OS === "ios" && uri.startsWith("file://")
        ? uri.replace("file://", "")
        : uri;

    const fileName = uri.split("/").pop() || `image_${Date.now()}.jpg`;

    const formData = new FormData();
    formData.append("file", {
      uri: cleanUri,
      name: fileName,
      type: mimeType || "image/jpeg",
    });
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("cloud_name", CLOUD_NAME);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
        // ❌ DO NOT set Content-Type — fetch sets boundary automatically
      }
    );

    const data = await response.json();

    if (!response.ok || !data.secure_url) {
      throw new Error(data?.error?.message || "Cloudinary upload failed");
    }

    return { success: true, url: data.secure_url };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return { success: false, error: error.message || "Upload failed" };
  }
};

/**
 * Upload video to Cloudinary (mobile only)
 * @param {string} uri - Local video URI
 * @param {string} mimeType - e.g. "video/mp4"
 */
export const uploadVideoToCloudinary = async (uri, mimeType = "video/mp4") => {
  try {
    if (!uri) throw new Error("No video URI provided");

    const cleanUri =
      Platform.OS === "ios" && uri.startsWith("file://")
        ? uri.replace("file://", "")
        : uri;

    const fileName = uri.split("/").pop() || `video_${Date.now()}.mp4`;

    const formData = new FormData();
    formData.append("file", {
      uri: cleanUri,
      name: fileName,
      type: mimeType || "video/mp4",
    });
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("cloud_name", CLOUD_NAME);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok || !data.secure_url) {
      throw new Error(data?.error?.message || "Video upload failed");
    }

    return { success: true, url: data.secure_url };
  } catch (error) {
    console.error("Cloudinary video upload error:", error);
    return { success: false, error: error.message || "Video upload failed" };
  }
};