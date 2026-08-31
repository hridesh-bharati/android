// src/dashboard/admin/practice/AdminPracticeAssign.js
import React, { useEffect, useState, useMemo } from "react";
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Image, Switch, ActivityIndicator } from "react-native";
import { db } from "../../../services/firebase";
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc, onSnapshot, serverTimestamp, query, where } from "firebase/firestore";

export default function AdminPracticeAssign({ route }) {
  const { testId } = route.params;
  const [students, setStudents] = useState([]);
  const [assignedMap, setAssignedMap] = useState({});
  const [testTitle, setTestTitle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoc(doc(db, "practiceTests", testId)).then(s => s.exists() && setTestTitle(s.data().title));
    
    getDocs(collection(db, "admissions")).then(snap => {
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(s => s.email && s.status !== "pending"));
      setLoading(false);
    });

    // ✅ Realtime listener for assigned status
    const unsub = onSnapshot(query(collection(db, "practiceAssigned"), where("testId", "==", testId)), (snap) => {
      const map = {};
      snap.forEach(d => {
        const email = d.data().studentId?.toLowerCase().trim();
        if (email) map[email] = true;
      });
      setAssignedMap(map);
    });

    return () => unsub();
  }, [testId]);

  const toggleAccess = async (s) => {
    const email = s.email?.toLowerCase().trim();
    if (!email) return;
    const docId = `${email}_${testId}`;
    try {
      if (assignedMap[email]) {
        await deleteDoc(doc(db, "practiceAssigned", docId));
        await deleteDoc(doc(db, "practiceResults", docId));
      } else {
        await setDoc(doc(db, "practiceAssigned", docId), { 
          studentId: email, 
          testId, 
          name: s.name || "", 
          regNo: s.regNo || "", 
          assignedAt: serverTimestamp() 
        });
      }
    } catch (err) { console.error("Toggle error:", err); }
  };

  const filtered = useMemo(() => students.filter(s => s.name?.toLowerCase().includes(searchTerm.toLowerCase())), [students, searchTerm]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.testTitleHeader}>{testTitle}</Text>
        <Text style={styles.testSubHeader}>Toggle student test access below</Text>
        <TextInput 
          style={styles.searchBox}
          placeholder="Search by name or reg no..."
          placeholderTextColor="#94a3b8"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.map(s => {
          const emailKey = s.email?.toLowerCase().trim();
          const isOn = !!assignedMap[emailKey];
          return (
            <View key={s.id} style={styles.studentItem}>
              <Image 
                source={{ uri: s.photoUrl || `https://ui-avatars.com/api/?name=${s.name}` }} 
                style={[styles.avatar, isOn && styles.avatarActive]} 
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.studentName}>{s.name}</Text>
                <Text style={styles.regText}>{s.regNo || 'N/A'} • {s.email}</Text>
              </View>
              <Switch 
                value={isOn} 
                onValueChange={() => toggleAccess(s)}
                trackColor={{ false: '#cbd5e1', true: '#0284c7' }}
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 14 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerCard: { backgroundColor: '#fff', padding: 14, borderRadius: 14, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  testTitleHeader: { fontSize: 15, fontWeight: '900', color: '#0284c7', textAlign: 'center', marginBottom: 2 },
  testSubHeader: { fontSize: 11, fontWeight: '700', color: '#64748b', textAlign: 'center', marginBottom: 10 },
  searchBox: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 12, height: 40, fontSize: 12, fontWeight: '700', color: '#0f172a' },
  list: { gap: 8, paddingBottom: 20 },
  studentItem: { backgroundColor: '#fff', borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#cbd5e1' },
  avatarActive: { borderColor: '#0284c7', borderWidth: 2 },
  studentName: { fontSize: 13, fontWeight: '900', color: '#0f172a' },
  regText: { fontSize: 10, fontWeight: '700', color: '#64748b', marginTop: 2 }
});