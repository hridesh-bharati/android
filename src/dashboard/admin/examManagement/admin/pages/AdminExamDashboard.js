// src/dashboard/admin/examManagement/admin/pages/AdminExamDashboard.js
import React, { useMemo, useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useExam } from "../../context/ExamProvider";
import { db } from "../../../../../services/firebase";
import { collection, onSnapshot } from "firebase/firestore";

const C = {
  primary: '#071e3d',
  secondary: '#0284c7',
  danger: '#ef4444',
  success: '#10b981',
  white: '#ffffff',
  border: 'rgba(255, 255, 255, 0.6)',
  gray: '#64748b',
  bg: '#e8f2ff',
  dark: '#0f172a'
};

const glassCard = {
  backgroundColor: 'rgba(255, 255, 255, 0.75)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.9)',
  ...Platform.select({
    ios: { shadowColor: '#0284c7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
    android: { elevation: 3 }
  })
};

export default function AdminExamDashboard({ navigation }) {
  const { exams, loading, toggleExamLive, deleteExam } = useExam();
  const [studentStats, setStudentStats] = useState({ ongoing: 0, ready: 0, totalRecords: 0 });

  useEffect(() => {
    const liveExamIds = exams.filter(e => e.isLive).map(e => e.id);
    const q = collection(db, "studentExams");
    const unsubscribe = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => d.data());
      setStudentStats({
        ongoing: docs.filter(s => s.status === "Ongoing" && liveExamIds.includes(s.examId)).length,
        ready: docs.filter(s => s.status === "Pending" && liveExamIds.includes(s.examId)).length,
        totalRecords: docs.length
      });
    });
    return () => unsubscribe();
  }, [exams]);

  const cards = useMemo(() => [
    { label: 'Testing', v: studentStats.ongoing, c: 'rgba(254, 243, 199, 0.85)', textC: '#d97706' },
    { label: 'Live Course', v: exams.filter(e => e.isLive).length, c: 'rgba(254, 226, 226, 0.85)', textC: '#dc2626' },
    { label: 'Ready', v: studentStats.ready, c: 'rgba(209, 250, 229, 0.85)', textC: '#059669' },
    { label: 'Total', v: studentStats.totalRecords, c: 'rgba(224, 242, 254, 0.85)', textC: '#0284c7' }
  ], [exams, studentStats]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.secondary} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Water Effect Ripple Blobs Background Elements */}
      <View style={styles.waterBlob1} />
      <View style={styles.waterBlob2} />

      {/* Top Header (Scrollable - Not Sticky) */}
      <View style={[styles.header, glassCard]}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="security" size={18} color={C.secondary} />
          <Text style={styles.headerTitle}>Exam Console</Text>
        </View>
        <TouchableOpacity style={styles.newExamBtn} onPress={() => navigation.navigate("AdminCreateExam")} activeOpacity={0.8}>
          <MaterialIcons name="add" size={16} color="#fff" />
          <Text style={styles.newExamBtnText}>New Exam</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {cards.map((s, i) => (
          <View key={i} style={[styles.statBox, glassCard, { backgroundColor: s.c }]}>
            <Text style={[styles.statValue, { color: s.textC }]}>{s.v}</Text>
            <Text style={[styles.statLabel, { color: s.textC }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Exams List */}
      <View style={styles.examGrid}>
        {exams.length > 0 ? exams.map(e => (
          <View key={e.id} style={[styles.examCard, glassCard]}>
            <View style={styles.examCardTop}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.examCardTitle} numberOfLines={1}>{e.title}</Text>
                <TouchableOpacity onPress={() => deleteExam(e.id)} activeOpacity={0.7}>
                  <Text style={styles.deleteText}>DELETE PERMANENTLY</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.courseBadge}>
                <Text style={styles.courseBadgeText}>{e.course}</Text>
              </View>
            </View>

            <View style={styles.examCardMiddle}>
              <View style={styles.timeRow}>
                <MaterialIcons name="schedule" size={14} color={C.secondary} />
                <Text style={styles.timeText}>{e.startTime} | {e.duration} Hrs</Text>
              </View>
              <TouchableOpacity 
                style={[styles.liveToggle, e.isLive ? styles.liveActive : styles.liveInactive]}
                onPress={() => toggleExamLive(e.id, e.isLive)}
                activeOpacity={0.8}
              >
                <Text style={[styles.liveToggleText, e.isLive && { color: '#dc3545' }]}>
                  {e.isLive ? "● LIVE NOW" : "POWER GO LIVE"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.examCardActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("AdminAddQuestions", { examId: e.id })} activeOpacity={0.8}>
                <MaterialIcons name="edit" size={16} color={C.secondary} />
                <Text style={styles.actionText}>Questions</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("AdminAssignExam", { examId: e.id })} activeOpacity={0.8}>
                <MaterialIcons name="person-add" size={16} color={C.dark} />
                <Text style={styles.actionText}>Permit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("AdminCompletedExams", { examId: e.id })} activeOpacity={0.8}>
                <MaterialIcons name="assessment" size={16} color={C.success} />
                <Text style={styles.actionText}>Results</Text>
              </TouchableOpacity>
            </View>
          </View>
        )) : (
          <Text style={styles.noExamText}>No Exam Papers Found</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: C.bg, padding: 12, paddingBottom: 40, position: 'relative' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },
  waterBlob1: {
    position: 'absolute',
    top: 40,
    left: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    transform: [{ scaleX: 1.5 }]
  },
  waterBlob2: {
    position: 'absolute',
    top: 250,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(14, 165, 233, 0.15)'
  },
  header: { 
    height: 54, 
    borderRadius: 14,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 14, 
    marginBottom: 12 
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerTitle: { fontSize: 14, fontWeight: '900', color: C.dark },
  newExamBtn: { 
    backgroundColor: C.secondary, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 8, 
    gap: 2,
    ...Platform.select({
      ios: { shadowColor: C.secondary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
      android: { elevation: 3 }
    })
  },
  newExamBtnText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  statsGrid: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statBox: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  statValue: { fontSize: 15, fontWeight: '900' },
  statLabel: { fontSize: 8, fontWeight: '800', textTransform: 'uppercase', marginTop: 1 },
  examGrid: { gap: 10 },
  examCard: { 
    borderRadius: 14, 
    padding: 14 
  },
  examCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  examCardTitle: { fontSize: 13, fontWeight: '900', color: C.dark, marginBottom: 2 },
  deleteText: { fontSize: 9, fontWeight: '800', color: C.danger },
  courseBadge: { backgroundColor: C.dark, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  courseBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff', textTransform: 'uppercase' },
  examCardMiddle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(226, 232, 240, 0.6)', paddingTop: 10, marginBottom: 10 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText: { fontSize: 11, fontWeight: '700', color: C.gray },
  liveToggle: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: 'rgba(248, 250, 252, 0.8)' },
  liveActive: { borderColor: '#dc3545', backgroundColor: 'rgba(254, 226, 226, 0.9)' },
  liveToggleText: { fontSize: 10, fontWeight: '800', color: C.gray },
  examCardActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(226, 232, 240, 0.6)', paddingTop: 10, gap: 6 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(248, 250, 252, 0.8)', paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(226, 232, 240, 0.8)', gap: 4 },
  actionText: { fontSize: 10, fontWeight: '800', color: '#334155', textTransform: 'uppercase' },
  noExamText: { textAlign: 'center', color: C.gray, marginTop: 40, fontWeight: '700', fontSize: 12 }
});