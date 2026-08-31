// src/components/gallery/DownloadButton.js
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, Linking, Alert, Platform } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { db } from "../../services/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";

export default function DownloadButton({ imageUrl, imageId, filename = "Drishtee_File", count = 0 }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!imageUrl) {
      Alert.alert("Error", "Download URL is invalid.");
      return;
    }

    setLoading(true);
    try {
      // Open URL directly in browser/system downloader so file actually downloads on mobile/web
      const supported = await Linking.canOpenURL(imageUrl);
      if (supported) {
        await Linking.openURL(imageUrl);
      } else {
        Alert.alert("Error", "Unable to open download link.");
      }

      // Increment Firestore download count safely
      if (imageId) {
        await updateDoc(doc(db, "galleryImages", imageId), {
          downloadCount: increment(1)
        });
      }
    } catch (err) {
      console.error("Download failed:", err);
      Alert.alert("Error", "Failed to download file.");
    } finally {
      setLoading(false);
    }
  };

  const formatCount = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
  };

  return (
    <TouchableOpacity style={styles.btn} onPress={handleDownload} disabled={loading} activeOpacity={0.8}>
      {loading ? (
        <ActivityIndicator size="small" color="#0284c7" />
      ) : (
        <MaterialIcons name="file-download" size={18} color="#64748b" />
      )}
      <Text style={styles.countText}>{formatCount(count)}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 10 },
  countText: { fontSize: 11, fontWeight: '800', color: '#64748b' }
});