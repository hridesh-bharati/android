// src/components/QueriesForm.js

import React, { useState } from "react";
import { 
  StyleSheet, Text, View, TextInput, Pressable, 
  ActivityIndicator, ScrollView, Alert, KeyboardAvoidingView, Platform 
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { db } from "../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { sendEmailNotification, supportTemplate } from "../services/emailService";

const COLORS = {
  background: "#FFF5F5",        // Soft Drishtee peach/pink theme background
  primaryRed: "#FF5252",      
  textDark: "#111827",
  textSecondary: "#6B7280",
};

export default function QueriesForm() {
  const init = {
    fullName: "",
    mobile: "",
    email: "",
    title: "",
    query: "",
  };

  const [formData, setFormData] = useState(init);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.mobile || !formData.email || !formData.title || !formData.query) {
      Alert.alert("Missing Fields", "Please fill out all sections before submitting your query.");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "studentQueries"), {
        ...formData,
        timestamp: serverTimestamp(),
        status: "pending",
      });

      await sendEmailNotification(
        "hridesh027@gmail.com",
        `New Inquiry: ${formData.title}`,
        supportTemplate(formData)
      );

      Alert.alert("Success", "Your query has been dispatched successfully.");
      setFormData(init);
    } catch (err) {
      console.error("❌ SUPPORT ERROR:", err);
      Alert.alert("Error", err.message || "System Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.wrapper}
    >
      {/* Background Soft Accent Blob for Glassmorphism depth */}
      <View style={styles.blobShape} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        <View style={styles.bannerContainer}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="support-agent" size={26} color={COLORS.primaryRed} />
          </View>
          <Text style={styles.headerTitle}>Quick Support & Contact</Text>
          <Text style={styles.headerSubtitle}>We typically respond within 24 hours</Text>
        </View>

        {/* Form Fields with Glassmorphism Translucent Look */}
        <View style={styles.formSection}>
          {[
            { n: "fullName", l: "Full Name", i: "person-outline", t: "default", autoCap: "words" },
            { n: "mobile", l: "Mobile Number", i: "phone-iphone", t: "phone-pad", maxLen: 10 },
            { n: "email", l: "Email Address", i: "mail-outline", t: "email-address", autoCap: "none" },
            { n: "title", l: "Subject / Course Query", i: "menu-book", t: "default", autoCap: "sentences" },
          ].map((f) => {
            const isFocused = focusedField === f.n;
            const hasValue = formData[f.n].length > 0;

            return (
              <View key={f.n} style={styles.inputWrapper}>
                <Text style={[styles.floatingLabel, (isFocused || hasValue) && styles.floatingLabelActive]}>
                  {f.l}
                </Text>
                <View style={[styles.inputBox, isFocused && styles.inputBoxFocused]}>
                  <MaterialIcons 
                    name={f.i} 
                    size={20} 
                    color={isFocused ? COLORS.primaryRed : COLORS.textSecondary} 
                    style={styles.prefixIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder={f.l}
                    placeholderTextColor="#9CA3AF"
                    keyboardType={f.t}
                    maxLength={f.maxLen}
                    autoCapitalize={f.autoCap}
                    value={formData[f.n]}
                    onChangeText={(val) => handleChange(f.n, val)}
                    onFocus={() => setFocusedField(f.n)}
                    onBlur={() => setFocusedField(null)}
                  />
                  {hasValue && (
                    <Pressable onPress={() => handleChange(f.n, "")} hitSlop={10}>
                      <MaterialIcons name="cancel" size={18} color={COLORS.textSecondary} />
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })}

          {/* Multiline Message Box */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.floatingLabel, (focusedField === "query" || formData.query.length > 0) && styles.floatingLabelActive]}>
              Describe your issue or question
            </Text>
            <View style={[styles.textAreaBox, focusedField === "query" && styles.inputBoxFocused]}>
              <TextInput
                style={styles.textAreaInput}
                placeholder="Write your detailed message here..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={5}
                value={formData.query}
                onChangeText={(val) => handleChange("query", val)}
                onFocus={() => setFocusedField("query")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.footerContainer}>
          <Pressable 
            style={({ pressed }) => [styles.resetButton, pressed && { opacity: 0.7 }]} 
            onPress={() => setFormData(init)}
          >
            <MaterialIcons name="refresh" size={22} color={COLORS.textSecondary} />
          </Pressable>

          <Pressable 
            style={({ pressed }) => [styles.submitButton, pressed && { opacity: 0.85 }]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Submit Query</Text>
                <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
              </>
            )}
          </Pressable>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 16, paddingBottom: 40, flexGrow: 1 },
  
  // Decorative Background Blob
  blobShape: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "rgba(255, 82, 82, 0.15)",
    zIndex: 0,
  },

  bannerContainer: { alignItems: "center", marginBottom: 22, marginTop: 10, zIndex: 1 },
  iconContainer: { 
    width: 52, 
    height: 52, 
    borderRadius: 16, 
    // Glassmorphism Icon Box
    backgroundColor: "rgba(255, 255, 255, 0.85)", 
    justifyContent: "center", 
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#FF5252",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: COLORS.textDark },
  headerSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, fontWeight: "500" },

  formSection: { gap: 12, zIndex: 1 },
  inputWrapper: { position: "relative" },
  floatingLabel: { 
    fontSize: 11, 
    fontWeight: "700", 
    color: COLORS.textSecondary, 
    marginBottom: 4,
    marginLeft: 4,
    textTransform: "uppercase",
  },
  floatingLabelActive: { color: COLORS.primaryRed },
  
  // Glassmorphism Input Box Style (Translucent White with Subtle Border & Shadow)
  inputBox: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "rgba(255, 255, 255, 0.80)", 
    borderWidth: 1, 
    borderColor: "rgba(255, 255, 255, 0.95)", 
    borderRadius: 14, 
    paddingHorizontal: 12, 
    height: 52,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  inputBoxFocused: { borderColor: COLORS.primaryRed, borderWidth: 1.5, backgroundColor: "#FFFFFF" },
  prefixIcon: { marginRight: 10 },
  textInput: { flex: 1, fontSize: 14, color: COLORS.textDark, height: "100%", fontWeight: "500" },

  // Glassmorphism Text Area Box Style
  textAreaBox: { 
    backgroundColor: "rgba(255, 255, 255, 0.80)", 
    borderWidth: 1, 
    borderColor: "rgba(255, 255, 255, 0.95)", 
    borderRadius: 14, 
    paddingHorizontal: 12, 
    paddingVertical: 10,
    minHeight: 110,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  textAreaInput: { flex: 1, fontSize: 14, color: COLORS.textDark, textAlignVertical: "top", fontWeight: "500" },

  footerContainer: { flexDirection: "row", gap: 10, marginTop: 22, zIndex: 1 },
  resetButton: { 
    width: 52, 
    height: 52, 
    borderRadius: 14, 
    backgroundColor: "rgba(255, 255, 255, 0.85)", 
    justifyContent: "center", 
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.95)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButton: { 
    flex: 1, 
    height: 52, 
    backgroundColor: COLORS.primaryRed, 
    borderRadius: 14, 
    flexDirection: "row", 
    justifyContent: "center", 
    alignItems: "center",
    shadowColor: COLORS.primaryRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  submitButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800", letterSpacing: 0.5 }
});