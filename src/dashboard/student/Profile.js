// src/dashboard/student/Profile.js
import React, { useEffect, useState, useMemo } from "react";
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Dimensions } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../../services/firebase";

const { width } = Dimensions.get('window');

const InfoItem = ({ icon, label, value }) => (
  <View style={styles.infoCard}>
    <View style={styles.infoIconBox}>
      <MaterialIcons name={icon} size={16} color="#0284c7" />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoVal} numberOfLines={1}>{value || "—"}</Text>
    </View>
  </View>
);

const QuickMetric = ({ label, value, icon, color }) => (
  <View style={styles.metricCard}>
    <View style={[styles.metricIconWrap, { backgroundColor: `${color}12` }]}>
      <MaterialIcons name={icon} size={15} color={color} />
    </View>
    <Text style={styles.metricVal} numberOfLines={1}>{value || "—"}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
  </View>
);

export default function Profile() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    const userEmail = user?.email || "";
    if (!userEmail) {
      setLoading(false);
      return;
    }

    const emailId = userEmail.trim().toLowerCase();
    const docRef = doc(db, "admissions", emailId);

    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setStudent(snap.data());
      } else {
        setStudent(null);
      }
      setLoading(false);
    }, (err) => {
      console.error("Firestore error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const personalData = useMemo(() => [
    { icon: "badge", label: "Father's Name", value: student?.fatherName },
    { icon: "face", label: "Mother's Name", value: student?.motherName },
    { icon: "cake", label: "Birth Date", value: student?.dob },
    { icon: "wc", label: "Gender", value: student?.gender },
    { icon: "category", label: "Category", value: student?.category },
    { icon: "school", label: "Qualification", value: student?.qualification },
    { icon: "phone", label: "Contact Number", value: student?.mobile },
    { icon: "fingerprint", label: "Aadhar ID", value: student?.aadharNo ? "********" + student.aadharNo.slice(-4) : "—" },
  ], [student]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" color="#0284c7" />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }
  
  if (!student) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="error-outline" size={28} color="#f59e0b" style={{ marginBottom: 6 }} />
        <Text style={styles.notfoundTitle}>Profile Not Synced</Text>
        <Text style={styles.notfoundSub}>Contact administrator to link your account with {user?.email}.</Text>
      </View>
    );
  }

  const profileImg = student.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || 'User')}&background=0284c7&color=fff`;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 35 }}>
      {/* Clean App Header Banner */}
      <View style={styles.appHeader}>
        <Text style={styles.headerTitle}>STUDENT PROFILE</Text>
      </View>

      {/* Floating Identity Profile Card */}
      <View style={styles.profileCardContainer}>
        <TouchableOpacity style={styles.avatarContainer} activeOpacity={0.9} onPress={() => setShowModal(true)}>
          <Image source={{ uri: profileImg }} style={styles.avatarImage} resizeMode="cover" />
        </TouchableOpacity>

        <Text style={styles.studentName}>{student.name || "Student Name"}</Text>
        <Text style={styles.studentEmail}>{student.email || user?.email}</Text>

        <View style={styles.courseTagRow}>
          <View style={styles.coursePill}>
            <Text style={styles.coursePillText}>{student.course || "Enrolled Course"}</Text>
          </View>
          <View style={styles.appIdPill}>
            <Text style={styles.appIdText}>{student.applicationId || "REG-PENDING"}</Text>
          </View>
        </View>

        {/* Quick Metrics Bar */}
        <View style={styles.metricsGrid}>
          <QuickMetric label="Branch" value={student.branch || "—"} icon="domain" color="#0284c7" />
          <QuickMetric label="Joined" value={student.admissionDate?.split('-')[0] || '2026'} icon="event" color="#10b981" />
          <QuickMetric label="Status" value={student.status ? student.status.toUpperCase() : "PENDING"} icon="security" color="#f59e0b" />
        </View>
      </View>

      {/* Personal Details Section */}
      <View style={styles.sectionWrapper}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.gridContainer}>
          {personalData.map((item, idx) => (
            <View key={idx} style={styles.gridItem}>
              <InfoItem {...item} />
            </View>
          ))}
        </View>
      </View>

      {/* Address Section */}
      <View style={styles.sectionWrapper}>
        <Text style={styles.sectionTitle}>Address Details</Text>
        <View style={styles.addressBox}>
          <Text style={styles.addressMainText}>{student.address || "No complete address added."}</Text>
          
          <View style={styles.addressSubGrid}>
            <View style={styles.addressSubItem}>
              <Text style={styles.subItemLabel}>Village</Text>
              <Text style={styles.subItemVal} numberOfLines={1}>{student.village || "—"}</Text>
            </View>
            <View style={styles.addressSubItem}>
              <Text style={styles.subItemLabel}>Post Office</Text>
              <Text style={styles.subItemVal} numberOfLines={1}>{student.post || "—"}</Text>
            </View>
            <View style={styles.addressSubItem}>
              <Text style={styles.subItemLabel}>District</Text>
              <Text style={styles.subItemVal} numberOfLines={1}>{student.city || "—"}</Text>
            </View>
            <View style={styles.addressSubItem}>
              <Text style={styles.subItemLabel}>State</Text>
              <Text style={styles.subItemVal} numberOfLines={1}>{student.state || "—"}</Text>
            </View>
            <View style={styles.addressSubItem}>
              <Text style={styles.subItemLabel}>Pincode</Text>
              <Text style={styles.subItemVal} numberOfLines={1}>{student.pincode || "—"}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Image Modal */}
      <Modal visible={showModal} transparent={true} animationType="fade" onRequestClose={() => setShowModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowModal(false)}>
          <Image source={{ uri: profileImg }} style={styles.modalZoomImage} resizeMode="contain" />
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', padding: 20 },
  loadingText: { marginTop: 6, fontSize: 11, fontWeight: '600', color: '#64748b' },
  notfoundTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 2 },
  notfoundSub: { fontSize: 11, color: '#64748b', textAlign: 'center' },

  appHeader: { 
    backgroundColor: '#0284c7', 
    paddingTop: 18, 
    paddingBottom: 42, 
    paddingHorizontal: 16, 
    borderBottomLeftRadius: 18, 
    borderBottomRightRadius: 18, 
  },
  headerTitle: { fontSize: 11, fontWeight: '800', color: '#ffffff', letterSpacing: 0.8 },

  profileCardContainer: {
    marginHorizontal: 14,
    marginTop: -28,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#94a3b8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: '#ffffff',
    overflow: 'hidden',
    marginTop: -36,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarImage: { width: '100%', height: '100%' },

  studentName: { fontSize: 15, fontWeight: '800', color: '#0f172a', textAlign: 'center', marginBottom: 1 },
  studentEmail: { fontSize: 11, color: '#64748b', fontWeight: '500', marginBottom: 10 },

  courseTagRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  coursePill: { backgroundColor: '#f0f9ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#bae6fd' },
  coursePillText: { fontSize: 10, fontWeight: '700', color: '#0284c7' },
  appIdPill: { backgroundColor: '#0f172a', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  appIdText: { fontSize: 10, fontWeight: '700', color: '#ffffff' },

  metricsGrid: { flexDirection: 'row', width: '100%', gap: 6, borderTopWidth: 1, borderTopColor: '#f8fafc', paddingTop: 10 },
  metricCard: { flex: 1, alignItems: 'center', backgroundColor: '#f8fafc', paddingVertical: 6, borderRadius: 8 },
  metricIconWrap: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  metricVal: { fontSize: 11, fontWeight: '800', color: '#0f172a', marginBottom: 1 },
  metricLabel: { fontSize: 7.5, fontWeight: '700', color: '#64748b', textTransform: 'uppercase' },

  sectionWrapper: { marginTop: 14, paddingHorizontal: 14 },
  sectionTitle: { fontSize: 10.5, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 6 },
  gridItem: { width: '48.5%' },

  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 8,
  },
  infoIconBox: { width: 26, height: 26, borderRadius: 6, backgroundColor: '#f0f9ff', justifyContent: 'center', alignItems: 'center' },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 7.5, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' },
  infoVal: { fontSize: 11, fontWeight: '800', color: '#0f172a' },

  addressBox: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  addressMainText: { fontSize: 11.5, fontWeight: '700', color: '#0f172a', marginBottom: 10, lineHeight: 16 },
  addressSubGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  addressSubItem: { width: '31%', backgroundColor: '#f8fafc', padding: 6, borderRadius: 6 },
  subItemLabel: { fontSize: 7, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' },
  subItemVal: { fontSize: 10, fontWeight: '800', color: '#0f172a', marginTop: 1 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalZoomImage: { width: width - 40, height: width - 40, borderRadius: 12 }
});