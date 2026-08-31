// src/dashboard/admin/Profile.js
import React, { useState, useEffect } from "react";
import { 
  StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, 
  ActivityIndicator, Image, Alert, Platform 
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db, auth } from "../../../services/firebase";
import { useAuth } from "../../../context/AuthContext";

const C = {
  primary: "#0284c7",
  primaryLight: "#e0f2fe",
  dark: "#071e3d",
  success: "#10b981",
  white: "#ffffff",
  border: "rgba(255, 255, 255, 0.8)",
  gray: "#64748b",
  bg: "#f0f6ff",
  lightBg: "rgba(255, 255, 255, 0.9)",
  danger: "#ef4444",
};

export default function AdminProfile() {
  const { user, userProfile, isAdmin } = useAuth();
  const [loading, setLoading] = useState({ saving: false, img: false });
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", about: "", photoURL: "" });

  // Check if current user is admin via email or role flag
  const isUserAdmin = isAdmin || user?.email?.toLowerCase() === "hridesh027@gmail.com";

  useEffect(() => {
    if (user || userProfile) {
      setForm({
        name: userProfile?.name || user?.displayName || "",
        phone: userProfile?.phone || "",
        about: userProfile?.about || "",
        photoURL: userProfile?.photoURL || user?.photoURL || ""
      });
    }
  }, [userProfile, user]);

  if (!user || !isUserAdmin) {
    return (
      <View style={styles.center}>
        <MaterialIcons name="lock-outline" size={48} color={C.danger} />
        <Text style={{ color: C.danger, fontWeight: "900", fontSize: 14, marginTop: 8 }}>Unauthorized Access</Text>
        <Text style={{ color: C.gray, fontSize: 11, marginTop: 4 }}>Please log in with an administrator account.</Text>
      </View>
    );
  }

  const getOptimizedUrl = (url) => {
    if (!url) return "https://ui-avatars.com/api/?name=Admin&background=random";
    return url;
  };

  const uploadImg = async (fileObj, localUri) => {
    setLoading(p => ({ ...p, img: true }));
    try {
      const fd = new FormData();
      fd.append("file", fileObj);
      fd.append("upload_preset", "hridesh99!");
      fd.append("cloud_name", "draowpiml");

      const res = await fetch("https://api.cloudinary.com/v1_1/draowpiml/image/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (res.ok && data.secure_url) {
        const secureUrl = data.secure_url;
        await updateDoc(doc(db, "users", user.uid), { photoURL: secureUrl });
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, { photoURL: secureUrl });
        }
        
        setForm(prev => ({ ...prev, photoURL: secureUrl }));
        Alert.alert("Success", "Profile photo updated successfully!");
      } else {
        throw new Error("Upload failed");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Image upload failed");
    } finally {
      setLoading(p => ({ ...p, img: false }));
    }
  };

  const handleWebFilePick = (event) => {
    const file = event.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      uploadImg(file, previewUrl);
    }
  };

  const triggerPicker = () => {
    if (Platform.OS === "web") {
      document.getElementById("native-avatar-picker")?.click();
    } else {
      Alert.alert("Notice", "Please use expo-image-picker for mobile file selection.");
    }
  };

  const saveProfile = async () => {
    setLoading(p => ({ ...p, saving: true }));
    try {
      await updateDoc(doc(db, "users", user.uid), { ...form, updatedAt: serverTimestamp() });
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: form.name });
      }
      setEdit(false);
      Alert.alert("Success", "Profile saved successfully!");
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(p => ({ ...p, saving: false }));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.waterBlobTop} />
      <View style={styles.waterBlobBottom} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.profileHeader}>
            <TouchableOpacity style={styles.avatarContainer} onPress={edit ? triggerPicker : null} activeOpacity={edit ? 0.8 : 1}>
              <Image source={{ uri: getOptimizedUrl(form.photoURL) }} style={styles.avatar} />
              {edit && (
                <View style={styles.cameraBadge}>
                  {loading.img ? (
                    <ActivityIndicator size="small" color={C.white} />
                  ) : (
                    <MaterialIcons name="camera-alt" size={14} color={C.white} />
                  )}
                </View>
              )}
            </TouchableOpacity>

            {Platform.OS === "web" && (
              <input 
                type="file" 
                id="native-avatar-picker" 
                style={{ display: 'none' }} 
                accept="image/*" 
                onChange={handleWebFilePick} 
              />
            )}

            <Text style={styles.profileName} numberOfLines={1}>{form.name || "Administrator"}</Text>
            <Text style={styles.profileEmail} numberOfLines={1}>{user.email}</Text>
          </View>

          <View style={styles.formBody}>
            <Field label="Full Name" val={form.name} edit={edit} on={v => setForm({ ...form, name: v })} />
            <Field label="About / Bio" val={form.about} edit={edit} on={v => setForm({ ...form, about: v })} textarea />
            <Field label="Phone Number" val={form.phone} edit={edit} on={v => setForm({ ...form, phone: v })} keyboardType="phone-pad" />

            <View style={styles.btnRow}>
              {!edit ? (
                <TouchableOpacity style={styles.editBtn} onPress={() => setEdit(true)} activeOpacity={0.8}>
                  <Text style={styles.editBtnText}>Edit Profile</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.saveBtn} onPress={saveProfile} disabled={loading.saving} activeOpacity={0.8}>
                    {loading.saving ? <ActivityIndicator size="small" color={C.white} /> : <Text style={styles.saveBtnText}>Save</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setEdit(false)} activeOpacity={0.8}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const Field = ({ label, val, edit, on, textarea, keyboardType }) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    {edit ? (
      <TextInput
        style={[styles.input, textarea && { height: 70, textAlignVertical: 'top' }]}
        value={val}
        onChangeText={on}
        multiline={textarea}
        numberOfLines={textarea ? 3 : 1}
        keyboardType={keyboardType || "default"}
        placeholder={`Enter ${label.toLowerCase()}...`}
        placeholderTextColor="#94a3b8"
      />
    ) : (
      <View style={styles.displayBox}>
        <Text style={styles.displayText}>{val || "---"}</Text>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, position: 'relative' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg, padding: 20 },
  waterBlobTop: { position: 'absolute', top: -30, right: -40, width: 250, height: 250, borderRadius: 125, backgroundColor: '#38bdf8', opacity: 0.16 },
  waterBlobBottom: { position: 'absolute', bottom: -30, left: -40, width: 260, height: 260, borderRadius: 130, backgroundColor: '#34d399', opacity: 0.14 },

  scrollContent: { padding: 16, alignItems: 'center', justifyContent: 'center', flexGrow: 1 },
  card: { width: '100%', maxWidth: 360, backgroundColor: C.lightBg, borderRadius: 20, borderWidth: 1.5, borderColor: C.border, overflow: 'hidden', elevation: 4 },
  
  profileHeader: { alignItems: 'center', padding: 20, backgroundColor: 'rgba(255,255,255,0.6)', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  avatarContainer: { position: 'relative', marginBottom: 10 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: C.white, backgroundColor: '#e2e8f0' },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: C.primary, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: C.white, elevation: 3 },
  profileName: { fontSize: 15, fontWeight: '900', color: C.dark },
  profileEmail: { fontSize: 11, fontWeight: '700', color: C.gray, marginTop: 2 },

  formBody: { padding: 16, gap: 12 },
  fieldGroup: { width: '100%' },
  fieldLabel: { fontSize: 9, fontWeight: '900', color: C.gray, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  input: { backgroundColor: C.white, borderWidth: 1.5, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 10, height: 40, fontSize: 13, fontWeight: '700', color: C.dark },
  displayBox: { paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', minHeight: 26, justifyContent: 'center' },
  displayText: { fontSize: 13, fontWeight: '700', color: C.dark },

  btnRow: { marginTop: 10 },
  editBtn: { backgroundColor: C.dark, height: 42, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  editBtnText: { color: C.white, fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  actionRow: { flexDirection: 'row', gap: 8 },
  saveBtn: { flex: 1, backgroundColor: C.success, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  saveBtnText: { color: C.white, fontSize: 12, fontWeight: '900' },
  cancelBtn: { flex: 1, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#cbd5e1', height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  cancelBtnText: { color: C.dark, fontSize: 12, fontWeight: '900' }
});