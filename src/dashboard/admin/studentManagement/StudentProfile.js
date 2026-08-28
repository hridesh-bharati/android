// src/dashboard/admin/studentManagement/StudentProfile.js
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, Image, TextInput, TouchableOpacity, ActivityIndicator, Switch, Alert, Dimensions } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { doc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { useAdmissions } from "./AdmissionProvider";
import StudentQuickActions from "./StudentQuickActions";

const { width } = Dimensions.get("window");
const safe = (val) => (val && val !== "undefined" && val !== "" ? val : "—");

export default function StudentProfile({ route, navigation }) {
  const { email } = route?.params || {};
  const { admissions, loading } = useAdmissions();

  const student = admissions.find((a) => a.email?.toLowerCase() === email?.toLowerCase());

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => { if (student) setFormData(student); }, [student]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const oldEmail = student.email.toLowerCase().trim();
      const newEmail = formData.email ? formData.email.toLowerCase().trim() : oldEmail;

      if (oldEmail !== newEmail) {
        await setDoc(doc(db, "admissions", newEmail), formData);
        await deleteDoc(doc(db, "admissions", oldEmail));
      } else {
        await updateDoc(doc(db, "admissions", oldEmail), formData);
      }
      setIsEditing(false);
      Alert.alert("Success", "Profile Updated Successfully!");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Save Failed!");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#a855f7" />
      </View>
    );
  }

  if (!student) {
    return (
      <View style={styles.center}>
        <Text style={{ fontWeight: "700", color: "#64748b" }}>Student Not Found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderField = (label, key, iconName, keyboardType = "default") => (
    <View style={styles.infoRow}>
      <View style={styles.infoLabelContainer}>
        <MaterialIcons name={iconName} size={14} color="#64748b" style={{ marginRight: 6 }} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      {isEditing ? (
        <TextInput 
          style={styles.inputEdit} 
          value={formData[key] || ""} 
          onChangeText={(val) => handleChange(key, val)} 
          keyboardType={keyboardType}
        />
      ) : (
        <Text style={styles.infoValue}>{safe(formData[key])}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      {/* Background Gradient Orbs for Glassmorphism Effect */}
      <View style={styles.orbTopRight} />
      <View style={styles.orbBottomLeft} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        {/* Top Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <MaterialIcons name="arrow-back" size={20} color="#334155" />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Profile Manager</Text>
          {!isEditing ? (
            <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setIsEditing(false); setFormData(student); }}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSaving}>
                <Text style={styles.saveBtnText}>{isSaving ? "Saving..." : "Save"}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Glassmorphism Identity Card */}
        <View style={styles.glassCardWrapper}>
          <View style={styles.glassCardContent}>
            <Image source={{ uri: formData.photoUrl || "https://placehold.co/150x150" }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>{safe(formData.name || formData.fullName)}</Text>
              <Text style={styles.subText} numberOfLines={1}>{safe(formData.course)}</Text>
              <Text style={styles.branchText}>{safe(formData.branch)}</Text>
              <View style={styles.idBadges}>
                <View style={styles.badge}><Text style={styles.badgeText}>ID: {safe(formData.regNo)}</Text></View>
                <View style={[styles.badge, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}><Text style={[styles.badgeText, { color: '#d97706' }]}>{safe(formData.status)}</Text></View>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Stats Box (Glassmorphism) */}
        <View style={styles.statsRow}>
          {[
            { label: "PERC%", key: "percentage", icon: "trending-up", color: "#10b981" },
            { label: "ADMISSION", key: "admissionDate", icon: "event", color: "#a855f7" },
            { label: "ISSUE", key: "issueDate", icon: "card-membership", color: "#ec4899" },
          ].map((stat) => (
            <View key={stat.key} style={styles.glassStatBox}>
              <MaterialIcons name={stat.icon} size={18} color={stat.color} style={{ marginBottom: 4 }} />
              <Text style={styles.statLabel}>{stat.label}</Text>
              {isEditing ? (
                <TextInput 
                  style={styles.inputStatEdit} 
                  value={String(formData[stat.key] || "")} 
                  onChangeText={(val) => handleChange(stat.key, val)} 
                />
              ) : (
                <Text style={styles.statValue} numberOfLines={1}>{safe(formData[stat.key])}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Modular Quick Action Buttons Component */}
        <StudentQuickActions studentData={formData} />

        {/* Personal Info Box (Glassmorphism) */}
        <View style={styles.glassSectionBox}>
          <Text style={styles.sectionTitle}><MaterialIcons name="person" size={14} color="#a855f7" /> PERSONAL DETAILS</Text>
          {renderField("Branch", "branch", "store")}
          {renderField("Course", "course", "menu-book")}
          {renderField("Full Name", "name", "badge")}
          {renderField("Father's Name", "fatherName", "face")}
          {renderField("Mother's Name", "motherName", "face")}
          {renderField("Mobile", "mobile", "phone", "phone-pad")}
          {renderField("Email", "email", "email", "email-address")}
          {renderField("Gender", "gender", "wc")}
          {renderField("Date of Birth", "dob", "cake")}
          {renderField("Aadhar", "aadharNo", "fingerprint", "numeric")}
        </View>

        {/* Communication Address Box (Glassmorphism) */}
        <View style={[styles.glassSectionBox, { marginTop: 16 }]}>
          <Text style={styles.sectionTitle}><MaterialIcons name="location-on" size={14} color="#a855f7" /> COMMUNICATION ADDRESS</Text>
          <View style={styles.addressGrid}>
            {[
              { label: "VILLAGE", key: "village", icon: "home" },
              { label: "POST", key: "post", icon: "local-post-office" },
              { label: "THANA", key: "thana", icon: "security" },
              { label: "CITY", key: "city", icon: "location-city" },
              { label: "STATE", key: "state", icon: "map" },
              { label: "PINCODE", key: "pincode", icon: "pin-drop" },
            ].map((addr) => (
              <View key={addr.key} style={styles.addressField}>
                <View style={styles.infoLabelContainer}>
                  <MaterialIcons name={addr.icon} size={13} color="#64748b" style={{ marginRight: 4 }} />
                  <Text style={styles.infoLabel}>{addr.label}</Text>
                </View>
                {isEditing ? (
                  <TextInput 
                    style={styles.inputEdit} 
                    value={formData[addr.key] || ""} 
                    onChangeText={(val) => handleChange(addr.key, val)} 
                  />
                ) : (
                  <Text style={styles.infoValue} numberOfLines={1}>{safe(formData[addr.key])}</Text>
                )}
              </View>
            ))}
          </View>
          <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(226, 232, 240, 0.6)', paddingTop: 8 }}>
            <View style={styles.infoLabelContainer}>
              <MaterialIcons name="description" size={13} color="#64748b" style={{ marginRight: 4 }} />
              <Text style={styles.infoLabel}>FULL ADDRESS STRING</Text>
            </View>
            {isEditing ? (
              <TextInput 
                style={[styles.inputEdit, { height: 60, textAlignVertical: 'top', paddingTop: 6 }]} 
                multiline 
                numberOfLines={3} 
                value={formData.address || ""} 
                onChangeText={(val) => handleChange("address", val)} 
              />
            ) : (
              <Text style={styles.infoValue}>{safe(formData.address)}</Text>
            )}
          </View>
        </View>

        {/* Status Toggle / Certificate Portal Switch (Glassmorphism) */}
        <View style={[styles.glassSectionBox, { marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={[styles.shieldIcon, { backgroundColor: formData.certificateDisabled ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)' }]}>
              <MaterialIcons 
                name={formData.certificateDisabled ? "security" : "verified-user"} 
                size={22} 
                color={formData.certificateDisabled ? "#ef4444" : "#10b981"} 
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#1e293b' }}>Certificate Portal</Text>
              <Text style={{ fontSize: 10, fontWeight: '700', color: formData.certificateDisabled ? '#ef4444' : '#10b981', marginTop: 2 }}>
                {formData.certificateDisabled ? 'CERTIFICATE IS LOCKED' : 'CERTIFICATE IS ACTIVE'}
              </Text>
            </View>
          </View>
          <Switch 
            value={!formData.certificateDisabled}
            onValueChange={async (val) => {
              const ns = !val;
              try {
                await updateDoc(doc(db, "admissions", student.email.toLowerCase()), { certificateDisabled: ns });
                setFormData(p => ({ ...p, certificateDisabled: ns }));
              } catch (e) {
                Alert.alert("Error", "Update Failed");
              }
            }}
            trackColor={{ false: '#cbd5e1', true: '#f472b6' }}
            thumbColor={!formData.certificateDisabled ? '#a855f7' : '#f4f3f4'}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#f3e8ff", position: 'relative', overflow: 'hidden' },
  
  // Background Soft Gradient Orbs (Glassmorphism Vibe)
  orbTopRight: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(236, 72, 153, 0.25)',
  },
  orbBottomLeft: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(168, 85, 247, 0.22)',
  },

  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  topBarTitle: { fontSize: 16, fontWeight: "800", color: "#1e293b" },
  iconBtn: { padding: 8, backgroundColor: "rgba(255, 255, 255, 0.8)", borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.9)', elevation: 2 },
  editActions: { flexDirection: 'row', gap: 6 },
  editBtn: { backgroundColor: "#a855f7", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 14, elevation: 3 },
  editBtnText: { color: "#ffffff", fontWeight: "700", fontSize: 12 },
  cancelBtn: { backgroundColor: "rgba(255, 255, 255, 0.7)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14 },
  cancelBtnText: { color: "#475569", fontWeight: "700", fontSize: 12 },
  saveBtn: { backgroundColor: "#10b981", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 14, elevation: 3 },
  saveBtnText: { color: "#ffffff", fontWeight: "700", fontSize: 12 },
  
  // Glassmorphism Identity Card Styles
  glassCardWrapper: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 16,
    elevation: 6,
  },
  glassCardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    gap: 14,
  },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#ffffff', backgroundColor: '#e2e8f0' },
  name: { fontSize: 17, fontWeight: '800', color: '#1e293b', marginBottom: 2 },
  subText: { fontSize: 11, color: '#475569', fontWeight: '700', marginBottom: 1 },
  branchText: { fontSize: 10, color: '#a855f7', fontWeight: '800', marginBottom: 8 },
  idBadges: { flexDirection: "row", gap: 6, flexWrap: 'wrap' },
  badge: { backgroundColor: "rgba(255, 255, 255, 0.9)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.8)' },
  badgeText: { fontSize: 9, fontWeight: "800", color: "#a855f7" },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  glassStatBox: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.75)', borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.9)', elevation: 3 },
  statLabel: { fontSize: 9, fontWeight: '800', color: '#64748b', marginBottom: 2 },
  statValue: { fontSize: 11, fontWeight: '700', color: '#1e293b' },
  inputStatEdit: { backgroundColor: 'rgba(255, 255, 255, 0.9)', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, width: '100%', height: 26, fontSize: 11, textAlign: 'center', fontWeight: '700', color: '#1e293b' },
  
  glassSectionBox: { backgroundColor: "rgba(255, 255, 255, 0.75)", borderRadius: 20, padding: 16, borderWidth: 1.5, borderColor: "rgba(255, 255, 255, 0.95)", elevation: 4 },
  sectionTitle: { fontSize: 11, fontWeight: "800", color: "#a855f7", marginBottom: 12 },
  infoRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(226, 232, 240, 0.6)' },
  infoLabelContainer: { flexDirection: 'row', alignItems: 'center' },
  infoLabel: { fontSize: 9, fontWeight: "700", color: "#64748b", textTransform: "uppercase" },
  infoValue: { fontSize: 12, fontWeight: "700", color: "#1e293b", marginTop: 2, marginLeft: 20 },
  inputEdit: { backgroundColor: "rgba(255, 255, 255, 0.9)", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingHorizontal: 10, height: 36, fontSize: 12, color: "#1e293b", marginTop: 2, marginLeft: 20 },
  addressGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  addressField: { width: '48%' },
  shieldIcon: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  backBtn: { marginTop: 12, backgroundColor: "#a855f7", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  backBtnText: { color: "#ffffff", fontWeight: "700", fontSize: 12 },
});