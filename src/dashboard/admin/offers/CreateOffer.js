// src/dashboard/admin/offers/CreateOffer.js
import React, { useState } from "react";
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform 
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { db } from "../../../services/firebase"; // Adjust your firebase import path
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../../context/AuthContext"; // Adjust your auth import path

const C = {
  primary: "#0284c7",
  dark: "#071e3d",
  bg: "#f0f6ff",
  white: "#ffffff",
  text: "#0f172a",
  gray: "#64748b",
  border: "#ffffff",
  danger: "#ef4444",
};

export default function CreateOffer({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ caption: "", details: "" });

  const publish = async () => {
    if (!data.caption.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "offers"), {
        ...data,
        adminName: user?.displayName || "Admin",
        createdAt: serverTimestamp()
      });
      setData({ caption: "", details: "" });
      alert("Offer Published Live! 🚀");
    } catch (err) {
      console.error("Publish failed:", err);
      alert("Failed to publish offer!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {/* Background Blobs */}
      <View style={styles.waterBlobTop} />
      <View style={styles.waterBlobBottom} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Header with View Offers Button */}
        <View style={styles.topBar}>
          <View style={styles.badgeContainer}>
            <MaterialIcons name="megaphone" size={14} color={C.primary} />
            <Text style={styles.badgeText}>Create Offer</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.viewOffersBtn} 
            onPress={() => navigation?.navigate("DeleteOffer")}
            activeOpacity={0.8}
          >
            <MaterialIcons name="visibility" size={14} color={C.dark} />
            <Text style={styles.viewOffersText}>View Offers</Text>
          </TouchableOpacity>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.label}>Headline *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter offer headline..."
            placeholderTextColor={C.gray}
            value={data.caption}
            onChangeText={(val) => setData({ ...data, caption: val })}
          />

          <Text style={styles.label}>Offer Details</Text>
          <TextInput
            style={styles.textarea}
            placeholder="Write offer details..."
            placeholderTextColor={C.gray}
            multiline={true}
            numberOfLines={4}
            value={data.details}
            onChangeText={(val) => setData({ ...data, details: val })}
          />

          <TouchableOpacity
            style={[styles.submitBtn, (!data.caption.trim() || loading) && { opacity: 0.6 }]}
            onPress={publish}
            disabled={loading || !data.caption.trim()}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={C.white} size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Publish Now</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, position: 'relative' },
  waterBlobTop: { position: 'absolute', top: -30, right: -40, width: 250, height: 250, borderRadius: 125, backgroundColor: '#38bdf8', opacity: 0.16 },
  waterBlobBottom: { position: 'absolute', bottom: -30, left: -40, width: 260, height: 260, borderRadius: 130, backgroundColor: '#34d399', opacity: 0.14 },

  scrollContent: { padding: 14, paddingBottom: 40 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  
  badgeContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, gap: 6, elevation: 1 },
  badgeText: { fontSize: 11, fontWeight: '900', color: C.primary, textTransform: 'uppercase' },

  viewOffersBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, gap: 4, elevation: 1 },
  viewOffersText: { fontSize: 11, fontWeight: '900', color: C.dark },

  formCard: { backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 18, padding: 16, borderWidth: 1.5, borderColor: C.border, elevation: 3 },
  label: { fontSize: 10, fontWeight: '800', color: C.gray, textTransform: 'uppercase', marginBottom: 6, marginTop: 10 },
  
  input: { backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 12, height: 44, fontSize: 13, fontWeight: '700', color: C.text },
  textarea: { backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, height: 100, fontSize: 12, fontWeight: '700', color: C.text, textAlignVertical: 'top' },
  
  submitBtn: { backgroundColor: C.primary, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 20, elevation: 2 },
  submitBtnText: { color: C.white, fontSize: 12, fontWeight: '900', textTransform: 'uppercase' }
});