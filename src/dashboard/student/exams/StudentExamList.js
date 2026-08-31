// src/dashboard/student/exams/StudentExamList.js
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { auth, db } from "../../../services/firebase";
import { collection, onSnapshot, doc, getDoc, query, where, getDocs } from "firebase/firestore";

export default function StudentExamList({ navigation }) {
  const [studentCourse, setStudentCourse] = useState(null);
  const [completedExams, setCompletedExams] = useState([]);
  const [assignedExams, setAssignedExams] = useState([]);
  const [exams, setExams] = useState([]);
  const [fetching, setFetching] = useState(true);

  const user = auth.currentUser;

  useEffect(() => {
    if (!user?.email) {
      setFetching(false);
      return;
    }

    const userEmail = user.email.toLowerCase().trim();

    const fetchInitial = async () => {
      try {
        const docRef = doc(db, "admissions", userEmail);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setStudentCourse(snap.data().course);
        }

        const examsSnap = await getDocs(collection(db, "exams"));
        setExams(examsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchInitial();

    const q = query(collection(db, "studentExams"), where("studentId", "==", userEmail));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const assignedIds = [];
      const completedIds = [];

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.examId) {
          assignedIds.push(data.examId);
          if (data.status === "Completed") {
            completedIds.push(data.examId);
          }
        }
      });

      setAssignedExams(assignedIds);
      setCompletedExams(completedIds);
      setFetching(false);
    }, () => setFetching(false));

    return () => unsubscribe();
  }, [user]);

  const myExams = exams.filter((e) => {
    const isLive = e.isLive === true;
    const courseMatch = e.course?.toLowerCase().trim() === studentCourse?.toLowerCase().trim();
    const isAssigned = assignedExams.includes(e.id);
    return isLive && courseMatch && isAssigned;
  });

  if (fetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Main Examinations</Text>
        <View style={styles.courseBadge}>
          <Text style={styles.courseBadgeText}>{studentCourse || "Student"}</Text>
        </View>
      </View>

      <View style={styles.list}>
        {myExams.length > 0 ? (
          myExams.map((e) => {
            const isDone = completedExams.includes(e.id);
            return (
              <View key={e.id} style={styles.examCard}>
                <View style={styles.examCardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.examTitle, isDone && styles.textStrike]} numberOfLines={1}>{e.title}</Text>
                    <View style={styles.examInfoRow}>
                      <MaterialIcons name="schedule" size={12} color="#0284c7" />
                      <Text style={styles.examInfoText}>{e.duration} Hrs | {e.totalMarks || "100"} Marks</Text>
                    </View>
                  </View>
                  <View style={[styles.statusChip, isDone ? styles.chipSuccess : styles.chipDanger]}>
                    <Text style={[styles.chipText, isDone ? styles.textSuccess : styles.textDanger]}>
                      {isDone ? "FINISHED" : "LIVE NOW"}
                    </Text>
                  </View>
                </View>

                {isDone ? (
                  <TouchableOpacity 
                    style={styles.outlineBtn} 
                    onPress={() => navigation.navigate("CertificateNavigator")}
                  >
                    <Text style={styles.outlineBtnText}>VIEW CERTIFICATE STATUS</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={styles.primaryBtn} 
                    onPress={() => navigation.navigate("StudentExamPage", { examId: e.id })}
                  >
                    <Text style={styles.primaryBtnText}>START MAIN EXAM</Text>
                    <MaterialIcons name="arrow-forward" size={16} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        ) : (
          <View style={styles.emptyBox}>
            <MaterialIcons name="assignment-late" size={40} color="#cbd5e1" style={{ marginBottom: 8 }} />
            <Text style={styles.emptyTitle}>No Main Exams Available</Text>
            <Text style={styles.emptySub}>Your official examinations will appear here once scheduled by the administrator.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f8fafc', padding: 14 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBar: { backgroundColor: '#fff', padding: 14, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  headerTitle: { fontSize: 14, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' },
  courseBadge: { backgroundColor: '#0f172a', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  courseBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  list: { gap: 10 },
  examCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#e2e8f0', elevation: 1 },
  examCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  examTitle: { fontSize: 13, fontWeight: '900', color: '#0f172a', marginBottom: 4 },
  textStrike: { textDecorationLine: 'line-through', color: '#94a3b8' },
  examInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  examInfoText: { fontSize: 10, fontWeight: '700', color: '#64748b' },
  statusChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  chipSuccess: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
  chipDanger: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  chipText: { fontSize: 9, fontWeight: '900' },
  textSuccess: { color: '#059669' },
  textDanger: { color: '#dc2626' },
  primaryBtn: { backgroundColor: '#0284c7', height: 40, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 4 },
  primaryBtnText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  outlineBtn: { backgroundColor: '#fff', height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#059669', marginTop: 4 },
  outlineBtnText: { color: '#059669', fontSize: 11, fontWeight: '900' },
  emptyBox: { padding: 40, alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  emptyTitle: { fontSize: 13, fontWeight: '900', color: '#0f172a', marginBottom: 2 },
  emptySub: { fontSize: 11, color: '#64748b', textAlign: 'center', fontWeight: '600' }
});