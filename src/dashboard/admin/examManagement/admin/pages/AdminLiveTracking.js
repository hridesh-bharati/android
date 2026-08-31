// src/dashboard/admin/examManagement/admin/pages/AdminLiveTracking.js
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Image, Alert } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { db } from "../../../../../services/firebase";
import { collection, query, where, onSnapshot, getDoc, doc, deleteDoc } from "firebase/firestore";

export default function AdminLiveTracking() {
  const [liveStudents, setLiveStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "studentExams"), where("status", "==", "Ongoing"));

    const unsubscribe = onSnapshot(q, async (snap) => {
      if (snap.empty) {
        setLiveStudents([]);
        setLoading(false);
        return;
      }

      try {
        const promises = snap.docs.map(async (examDoc) => {
          const data = examDoc.data();
          if (!data.examId || !data.studentId) return null;

          const [examSnap, studentSnap] = await Promise.all([
            getDoc(doc(db, "exams", data.examId)),
            getDoc(doc(db, "admissions", data.studentId.toLowerCase().trim()))
          ]);

          if (!examSnap.exists() || !examSnap.data().isLive || !studentSnap.exists()) {
            return null;
          }

          return {
            id: examDoc.id,
            ...data,
            studentInfo: studentSnap.data(),
            examName: examSnap.data().title
          };
        });

        const results = await Promise.all(promises);
        setLiveStudents(results.filter(r => r !== null));
      } catch (err) {
        console.error("Tracking error:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleTerminate = async (id, name) => {
    Alert.alert(
      "Force Terminate",
      `Are you sure you want to kick ${name} out?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Terminate",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "studentExams", id));
            } catch (err) {
              alert("Failed to terminate session.");
            }
          }
        }
      ]
    );
  };

  const filtered = liveStudents.filter(s =>
    s.studentInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentInfo?.regNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerBar}>
        <View>
          <Text style={styles.headerTitle}>Live Exam Monitor</Text>
          <Text style={styles.headerSub}>Tracking active students in LIVE exams</Text>
        </View>
        <View style={styles.liveBadge}>
          <Text style={styles.liveBadgeText}>{liveStudents.length} ACTIVE</Text>
        </View>
      </View>

      <TextInput 
        style={styles.search} 
        placeholder="Search name or Reg..." 
        placeholderTextColor="#94a3b8"
        onChangeText={setSearchTerm} 
      />

      <View style={styles.grid}>
        {filtered.length > 0 ? filtered.map((s) => (
          <View key={s.id} style={styles.monitorCard}>
            <TouchableOpacity style={styles.trashBtn} onPress={() => handleTerminate(s.id, s.studentInfo?.name)}>
              <MaterialIcons name="delete" size={16} color="#ef4444" />
            </TouchableOpacity>

            <View style={styles.cardTopRow}>
              <Image source={{ uri: s.studentInfo?.photoUrl || "https://ui-avatars.com/api/?name=User" }} style={styles.avatar} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.studentName} numberOfLines={1}>{s.studentInfo?.name}</Text>
                <Text style={styles.regText}>{s.studentInfo?.regNo}</Text>
                <Text style={styles.courseText}>{s.studentInfo?.course}</Text>
              </View>
            </View>

            <View style={styles.examBox}>
              <Text style={styles.examBoxLabel}>EXAM PAPER:</Text>
              <Text style={styles.examBoxName} numberOfLines={1}>{s.examName}</Text>
            </View>

            <View style={styles.cardBottomRow}>
              <Text style={styles.onlineStatus}>● ONLINE</Text>
            </View>
          </View>
        )) : (
          <Text style={styles.noActive}>No Active Exam Sessions</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f8fafc', padding: 14 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, backgroundColor: '#fff', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  headerTitle: { fontSize: 14, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' },
  headerSub: { fontSize: 10, fontWeight: '700', color: '#64748b', marginTop: 2 },
  liveBadge: { backgroundColor: '#fee2e2', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#fecaca' },
  liveBadgeText: { fontSize: 10, fontWeight: '900', color: '#dc2626' },
  search: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 12, height: 40, fontSize: 12, fontWeight: '700', marginBottom: 12 },
  grid: { gap: 10 },
  monitorCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#e2e8f0', position: 'relative', elevation: 1 },
  trashBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: '#f8fafc', padding: 6, borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 45, height: 45, borderRadius: 8, backgroundColor: '#e2e8f0' },
  studentName: { fontSize: 12, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' },
  regText: { fontSize: 10, fontWeight: '800', color: '#dc2626', marginTop: 1 },
  courseText: { fontSize: 9, fontWeight: '700', color: '#64748b', marginTop: 1, textTransform: 'uppercase' },
  examBox: { backgroundColor: '#f8fafc', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#f1f5f9', borderLeftWidth: 3, borderLeftColor: '#dc2626', marginBottom: 10 },
  examBoxLabel: { fontSize: 8, fontWeight: '800', color: '#64748b' },
  examBoxName: { fontSize: 11, fontWeight: '900', color: '#0f172a', marginTop: 1 },
  cardBottomRow: { alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 8 },
  onlineStatus: { fontSize: 10, fontWeight: '900', color: '#10b981' },
  noActive: { textAlign: 'center', color: '#94a3b8', marginTop: 40, fontWeight: '700' }
});