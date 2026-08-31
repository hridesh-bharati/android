// src/dashboard/admin/examManagement/admin/pages/AdminCompletedExams.js
import React, { useState, useEffect, useMemo } from "react";
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { db } from "../../../../../services/firebase";
import { collection, query, where, onSnapshot, getDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";

export default function AdminCompletedExams({ route, navigation }) {
  const filterExamId = route?.params?.examId;
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");

  const normId = (id) => id?.toLowerCase().trim();
  const getTime = (t) => t?.toMillis() || 0;

  useEffect(() => {
    const q = query(collection(db, "studentExams"), where("status", "==", "Completed"));

    const unsubscribe = onSnapshot(q, async (snap) => {
      const studentCache = {};
      const examCache = {};

      const enriched = await Promise.all(
        snap.docs.map(async (d) => {
          const data = { id: d.id, ...d.data() };
          const sKey = normId(data.studentId);
          const eKey = data.examId;

          if (!studentCache[sKey]) {
            studentCache[sKey] = getDoc(doc(db, "admissions", sKey)).then((s) => s.data() || {});
          }
          if (!examCache[eKey]) {
            examCache[eKey] = getDoc(doc(db, "exams", eKey)).then((s) => s.data() || { totalMarks: 70 });
          }

          const [student, exam] = await Promise.all([studentCache[sKey], examCache[eKey]]);
          return { ...data, student, exam };
        })
      );

      const grouped = {};
      enriched.forEach((item) => {
        const key = item.student?.regNo || item.studentId || "UNKNOWN";
        (grouped[key] ||= []).push(item);
      });

      const final = Object.values(grouped)
        .flatMap((arr) =>
          arr
            .sort((a, b) => getTime(a.completedAt) - getTime(b.completedAt))
            .map((item, i) => ({ ...item, uiAttempt: i + 1 }))
        )
        .sort((a, b) => getTime(b.completedAt) - getTime(a.completedAt));

      setCompleted(final);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatDate = (t) => t?.toDate().toISOString().split('T')[0];

  const list = useMemo(() =>
    completed
      .filter(i =>
        (!filterDate || formatDate(i.completedAt) === filterDate) &&
        (!filterExamId || i.examId === filterExamId)
      )
      .map(i => {
        const total = (Number(i.score) || 0) + (Number(i.attendanceMarks) || 0) + (Number(i.notesMarks) || 0);
        const grand = (Number(i.exam?.totalMarks) || 70) + 30;
        return { ...i, total, grand, pct: ((total / (grand || 1)) * 100).toFixed(1) };
      }),
    [completed, filterDate, filterExamId]
  );

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "studentExams", id));
    } catch (e) {
      alert("Error deleting record");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.filterBar}>
        <Text style={styles.filterTitle}>Results ({list.length})</Text>
        <TextInput 
          style={styles.dateInput} 
          placeholder="YYYY-MM-DD" 
          value={filterDate} 
          onChangeText={setFilterDate} 
        />
      </View>

      <View style={styles.grid}>
        {list.length > 0 ? list.map(item => (
          <View key={item.id} style={styles.resultCard}>
            <View style={styles.cardHeader}>
              <Image source={{ uri: item.student?.photoUrl || "https://ui-avatars.com/api/?name=User" }} style={styles.avatar} />
              <View style={{ flex: 1, marginHorizontal: 8 }}>
                <Text style={styles.studentName} numberOfLines={1}>{item.student?.name}</Text>
                <Text style={styles.regText}>REG: {item.student?.regNo}</Text>
              </View>
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreText}>{item.total}/{item.grand}</Text>
                <Text style={styles.pctText}>{item.pct}%</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.examTitle} numberOfLines={1}>{item.exam?.title || 'Exam'}</Text>
              <View style={styles.actionRow}>
                <TouchableOpacity 
                  onPress={() => updateDoc(doc(db, "studentExams", item.id), { isAdminViewed: !item.isAdminViewed })}
                >
                  <MaterialIcons name={item.isAdminViewed ? "check-circle" : "radio-button-unchecked"} size={20} color={item.isAdminViewed ? "#10b981" : "#94a3b8"} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate("AdminExamResultView", { studentExamId: item.id })}>
                  <MaterialIcons name="visibility" size={20} color="#0284c7" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <MaterialIcons name="delete" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )) : (
          <Text style={styles.noResult}>No Results Found</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f8fafc', padding: 14 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filterBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 12 },
  filterTitle: { fontSize: 13, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' },
  dateInput: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 10, height: 35, width: 120, fontSize: 11, fontWeight: '700' },
  grid: { gap: 10 },
  resultCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e2e8f0', elevation: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: { width: 38, height: 38, borderRadius: 6, backgroundColor: '#e2e8f0' },
  studentName: { fontSize: 12, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' },
  regText: { fontSize: 9, fontWeight: '700', color: '#64748b', marginTop: 1 },
  scoreBadge: { alignItems: 'flex-end' },
  scoreText: { fontSize: 11, fontWeight: '900', color: '#10b981' },
  pctText: { fontSize: 9, fontWeight: '800', color: '#64748b' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 8 },
  examTitle: { fontSize: 11, fontWeight: '800', color: '#0284c7', flex: 1 },
  actionRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  noResult: { textAlign: 'center', color: '#94a3b8', marginTop: 40, fontWeight: '700' }
});