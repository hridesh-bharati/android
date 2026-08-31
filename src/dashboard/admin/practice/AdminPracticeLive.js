// src/dashboard/admin/practice/AdminPracticeLive.js
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { db } from "../../../services/firebase";
import { collection, query, where, onSnapshot, doc, deleteDoc, getDoc } from "firebase/firestore";

export default function AdminPracticeLive() {
  const [live, setLive] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Realtime listener for ongoing test attempts
    const q = query(collection(db, "practiceResults"), where("status", "==", "Ongoing"));
    const unsub = onSnapshot(q, async (snap) => {
      const list = await Promise.all(snap.docs.map(async (d) => {
        const data = d.data();
        let photo = "";
        let regNo = "N/A";
        if (data.studentEmail) {
          const sSnap = await getDoc(doc(db, "admissions", data.studentEmail.toLowerCase().trim()));
          if (sSnap.exists()) {
            photo = sSnap.data().photoUrl || "";
            regNo = sSnap.data().regNo || "N/A";
          }
        }
        return { id: d.id, name: data.studentName || "Student", title: data.testTitle || "Test", photo, regNo };
      }));
      setLive(list);
      setLoading(false);
    }, (err) => {
      console.error("Live monitoring error:", err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleKickStudent = (id) => {
    Alert.alert("End Exam", "Are you sure you want to terminate this student's ongoing test session?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Terminate", 
        style: "destructive", 
        onPress: async () => {
          await deleteDoc(doc(db, "practiceResults", id));
        }
      }
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#ef4444" /></View>;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.headerTitle}>Live Students ({live.length})</Text>

      {live.length > 0 ? (
        <View style={styles.list}>
          {live.map((s) => (
            <View key={s.id} style={styles.liveCard}>
              <Image source={{ uri: s.photo || `https://ui-avatars.com/api/?name=${s.name}` }} style={styles.avatar} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.studentName} numberOfLines={1}>{s.name}</Text>
                <Text style={styles.subText}>{s.regNo} | {s.title}</Text>
              </View>
              <TouchableOpacity onPress={() => handleKickStudent(s.id)}>
                <MaterialIcons name="cancel" size={24} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyBox}>
          <MaterialIcons name="personal-video" size={40} color="#cbd5e1" style={{ marginBottom: 8 }} />
          <Text style={styles.emptyTitle}>No Students Online</Text>
          <Text style={styles.emptySub}>No students are currently taking a live practice test.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f8fafc', padding: 14 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 14, fontWeight: '900', color: '#0f172a', marginBottom: 12, textTransform: 'uppercase' },
  list: { gap: 8 },
  liveCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#cbd5e1' },
  studentName: { fontSize: 13, fontWeight: '900', color: '#0f172a' },
  subText: { fontSize: 10, fontWeight: '700', color: '#64748b', marginTop: 2 },
  emptyBox: { padding: 40, alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', marginTop: 20 },
  emptyTitle: { fontSize: 13, fontWeight: '900', color: '#0f172a', marginBottom: 2 },
  emptySub: { fontSize: 11, color: '#64748b', textAlign: 'center', fontWeight: '600' }
});