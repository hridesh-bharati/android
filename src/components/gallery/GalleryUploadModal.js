// src/components/gallery/GalleryUploadModal.js
import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, ActivityIndicator, Image, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import { db } from "../../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function UploadModal({ show, onClose, userDetails }) {
  const { displayName, currentUserId, photoURL } = userDetails;
  const [title, setTitle] = useState("");
  const [mediaUri, setMediaUri] = useState("");
  const [mediaType, setMediaType] = useState("image"); // 'image' or 'video'
  const [loading, setLoading] = useState(false);

  // Pick Image or Video from Device Library
  const pickMedia = async (type = "image") => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Denied", "Camera roll permissions are required!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: type === "video" ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setMediaUri(asset.uri);
        setMediaType(type === "video" ? "video" : "image");
      }
    } catch (error) {
      console.error("Media picking error:", error);
      Alert.alert("Error", "Failed to select file.");
    }
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a post title.");
      return;
    }

    setLoading(true);
    try {
      const finalUrl = mediaUri || "https://res.cloudinary.com/draowpiml/image/upload/v1/samples/animals/cat.jpg";

      await addDoc(collection(db, "galleryImages"), {
        url: finalUrl,
        title: title.trim(),
        type: mediaType,
        uploadedBy: displayName || "Student",
        uploadedById: currentUserId,
        userPhoto: photoURL || "",
        createdAt: serverTimestamp(),
        likes: [],
        reactions: {},
        comments: [],
        downloadCount: 0,
      });

      setTitle("");
      setMediaUri("");
      setMediaType("image");
      onClose();
      Alert.alert("Success", "Post published successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      Alert.alert("Error", "Failed to publish post.");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <Modal visible={show} transparent animationType="fade" statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.overlay}>
        <View style={styles.cardContainer}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Create New Post</Text>
              <TouchableOpacity onPress={onClose} disabled={loading} activeOpacity={0.7}>
                <MaterialIcons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Enter post title..."
              placeholderTextColor="#94a3b8"
              value={title}
              onChangeText={setTitle}
              editable={!loading}
            />

            {/* Media Type Selection Buttons */}
            <View style={styles.typeRow}>
              <TouchableOpacity 
                style={[styles.typeBtn, mediaType === "image" && styles.typeBtnActive]} 
                onPress={() => setMediaType("image")}
              >
                <MaterialIcons name="image" size={16} color={mediaType === "image" ? "#fff" : "#0284c7"} />
                <Text style={[styles.typeText, mediaType === "image" && styles.typeTextActive]}>Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.typeBtn, mediaType === "video" && styles.typeBtnActive]} 
                onPress={() => setMediaType("video")}
              >
                <MaterialIcons name="videocam" size={16} color={mediaType === "video" ? "#fff" : "#0284c7"} />
                <Text style={[styles.typeText, mediaType === "video" && styles.typeTextActive]}>Video</Text>
              </TouchableOpacity>
            </View>

            {/* Media Picker Box */}
            <TouchableOpacity 
              style={styles.mediaPickerBox} 
              onPress={() => pickMedia(mediaType)} 
              activeOpacity={0.8} 
              disabled={loading}
            >
              {mediaUri && mediaType === "image" ? (
                <Image source={{ uri: mediaUri }} style={styles.previewImage} resizeMode="cover" />
              ) : mediaUri && mediaType === "video" ? (
                <View style={styles.pickerPlaceholder}>
                  <MaterialIcons name="videocam" size={36} color="#10b981" />
                  <Text style={[styles.pickerText, { color: "#10b981" }]}>Video Selected Successfully</Text>
                </View>
              ) : (
                <View style={styles.pickerPlaceholder}>
                  <MaterialIcons 
                    name={mediaType === "video" ? "videocam" : "add-photo-alternate"} 
                    size={32} 
                    color="#0284c7" 
                  />
                  <Text style={styles.pickerText}>Tap to browse {mediaType.toUpperCase()}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitBtn} onPress={handleUpload} disabled={loading} activeOpacity={0.8}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Publish Now</Text>}
            </TouchableOpacity>

          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(7, 30, 61, 0.75)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 16 
  },
  cardContainer: { 
    width: '100%', 
    maxWidth: 340, 
    maxHeight: '85%', 
    backgroundColor: '#fff', 
    borderRadius: 18, 
    overflow: 'hidden', 
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10
  },
  scrollContent: { 
    padding: 20 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 14 
  },
  headerTitle: { 
    fontSize: 15, 
    fontWeight: '900', 
    color: '#0f172a' 
  },
  input: { 
    backgroundColor: '#f8fafc', 
    borderWidth: 1.5, 
    borderColor: '#e2e8f0', 
    borderRadius: 10, 
    paddingHorizontal: 12, 
    height: 44, 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#0f172a', 
    marginBottom: 12 
  },
  typeRow: { 
    flexDirection: 'row', 
    gap: 8, 
    marginBottom: 12 
  },
  typeBtn: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 8, 
    borderRadius: 8, 
    backgroundColor: '#f0f9ff', 
    borderWidth: 1, 
    borderColor: '#bae6fd',
    gap: 4 
  },
  typeBtnActive: { 
    backgroundColor: '#0284c7', 
    borderColor: '#0284c7' 
  },
  typeText: { 
    fontSize: 11, 
    fontWeight: '800', 
    color: '#0284c7' 
  },
  typeTextActive: { 
    color: '#fff' 
  },
  mediaPickerBox: { 
    width: '100%', 
    height: 150, 
    backgroundColor: '#f1f5f9', 
    borderRadius: 12, 
    borderWidth: 1.5, 
    borderColor: '#cbd5e1', 
    borderStyle: 'dashed', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 16, 
    overflow: 'hidden' 
  },
  pickerPlaceholder: { 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 6,
    padding: 10 
  },
  pickerText: { 
    fontSize: 11, 
    fontWeight: '800', 
    color: '#64748b',
    textAlign: 'center' 
  },
  previewImage: { 
    width: '100%', 
    height: '100%' 
  },
  submitBtn: { 
    backgroundColor: '#ef4444', 
    height: 42, 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 2 
  },
  submitText: { 
    color: '#fff', 
    fontSize: 12, 
    fontWeight: '900' 
  }
});