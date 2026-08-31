// src/dashboard/admin/examManagement/admin/pages/AdminExamResultView.js
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { db } from "../../../../../services/firebase";
import { doc, getDoc, collection, query, where, getDocs, updateDoc, increment } from "firebase/firestore";

export default function AdminExamResultView({ route }) {
  const { studentExamId } = route.params;
  const [data, setData] = useState({ result: null, student: null, exam: null, questions: [] });
  const [loading, setLoading] = useState(true);
  const [extraMarks, setExtraMarks] = useState({ attendance: 0, notes: 0 });

  const fetchData = async () => {
    try {
      const resSnap = await getDoc(doc(db, "studentExams", studentExamId));
      if (!resSnap.exists()) return alert("Record not found");
      const res = resSnap.data();

      setExtraMarks({
        attendance: res.attendanceMarks || 0,
        notes: res.notesMarks || 0
      });

      const [sS, eS, qS] = await Promise.all([
        getDoc(doc(db, "admissions", res.studentId)),
        getDoc(doc(db, "exams", res.examId)),
        getDocs(query(collection(db, "examQuestions"), where("examId", "==", res.examId)))
      ]);

      setData({ 
        result: res, 
        student: sS.data(), 
        exam: eS.data(), 
        questions: qS.docs.map(d => ({ id: d.id, ...d.data() })) 
      });
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, [studentExamId]);

  const updateExtraMarks = async () => {
    try {
      await updateDoc(doc(db, "studentExams", studentExamId), {
        attendanceMarks: Number(extraMarks.attendance),
        notesMarks: Number(extraMarks.notes),
      });
      alert("Marks synced successfully!");
      fetchData();
    } catch (err) { alert("Update failed"); }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  const { result, student, exam, questions } = data;
  const totalObtained = (result?.score || 0) + Number(extraMarks.attendance) + Number(extraMarks.notes);
  const grandTotalMarks = (exam?.totalMarks || 0) + 30;
  const percentage = ((totalObtained / grandTotalMarks) * 100).toFixed(1);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Profile Card */}
      <View style={styles.profileCard}>
        <Image source={{ uri: student?.photoUrl || "https://ui-avatars.com/api/?name=User" }} style={styles.avatar} />
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text style={styles.name}>{student?.name?.toUpperCase()}</Text>
          <Text style={styles.courseReg}>{student?.course} | REG: {student?.regNo}</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreObtained}>{totalObtained}</Text>
          <Text style={styles.percentageText}>{percentage}%</Text>
        </View>
      </View>

      {/* Internal Marks Sync */}
      <View style={styles.internalCard}>
        <View style={styles.internalInputGroup}>
          <Text style={styles.internalLabel}>Attendance (10)</Text>
          <TextInput 
            style={styles.internalInput} 
            keyboardType="numeric"
            value={String(extraMarks.attendance)}
            onChangeText={(val) => setExtraMarks({ ...extraMarks, attendance: Math.min(10, Number(val)) })}
          />
        </View>
        <View style={styles.internalInputGroup}>
          <Text style={styles.internalLabel}>Notes (20)</Text>
          <TextInput 
            style={styles.internalInput} 
            keyboardType="numeric"
            value={String(extraMarks.notes)}
            onChangeText={(val) => setExtraMarks({ ...extraMarks, notes: Math.min(20, Number(val)) })}
          />
        </View>
        <TouchableOpacity style={styles.syncBtn} onPress={updateExtraMarks}>
          <Text style={styles.syncBtnText}>SYNC</Text>
        </TouchableOpacity>
      </View>

      {/* Question Analysis List */}
      <View style={styles.analysisSection}>
        <Text style={styles.analysisHeader}>Assessment Breakdown</Text>
        {questions.map((q, i) => {
          const ansObj = result.answers?.[q.id];
          const isCorrect = ansObj === q.correctAnswer;

          return (
            <View key={q.id} style={[styles.qItemCard, isCorrect ? styles.borderSuccess : styles.borderDanger]}>
              <Text style={styles.qText}>Q{i + 1}. {q.question}</Text>
              <View style={styles.qAnswerRow}>
                <Text style={styles.ansSub}>Student: <Text style={{ fontWeight: '900', color: isCorrect ? '#10b981' : '#ef4444' }}>{ansObj || 'N/A'}</Text></Text>
                <Text style={styles.ansSub}>Correct: <Text style={{ fontWeight: '900', color: '#0f172a' }}>{q.correctAnswer}</Text></Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f8fafc', padding: 14 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 12 },
  avatar: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#e2e8f0' },
  name: { fontSize: 14, fontWeight: '900', color: '#0f172a' },
  courseReg: { fontSize: 10, fontWeight: '700', color: '#64748b', marginTop: 2 },
  scoreContainer: { alignItems: 'flex-end' },
  scoreObtained: { fontSize: 18, fontWeight: '900', color: '#0284c7' },
  percentageText: { fontSize: 11, fontWeight: '800', color: '#10b981' },
  internalCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16 },
  internalInputGroup: { flex: 1 },
  internalLabel: { fontSize: 9, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: 4 },
  internalInput: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, height: 38, textAlign: 'center', fontWeight: '800' },
  syncBtn: { backgroundColor: '#0f172a', height: 38, paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  syncBtnText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  analysisSection: { gap: 8 },
  analysisHeader: { fontSize: 12, fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: 4 },
  qItemCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#e2e8f0', borderLeftWidth: 4 },
  borderSuccess: { borderLeftColor: '#10b981' },
  borderDanger: { borderLeftColor: '#ef4444' },
  qText: { fontSize: 12, fontWeight: '800', color: '#0f172a', marginBottom: 6 },
  qAnswerRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 6 },
  ansSub: { fontSize: 10, color: '#64748b', fontWeight: '700' }
});