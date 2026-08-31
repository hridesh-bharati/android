// src/dashboard/admin/examManagement/admin/pages/AdminAssignExam.js
import React, { useState, useEffect, useMemo } from "react";
import { StyleSheet, Text, View, TextInput, ScrollView, Image, Switch, ActivityIndicator } from "react-native";
import { db } from "../../../../../services/firebase";
import { collection, getDocs, query, where, doc, deleteDoc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { useExam } from "../../context/ExamProvider";
import { sendEmailNotification, examPermitTemplate } from "../../../../../services/emailService";

export default function AdminAssignExam({ route }) {
  const { examId } = route.params;
  const { exams } = useExam();
  const [students, setStudents] = useState([]);
  const [assignedData, setAssignedData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const exam = useMemo(() => exams.find(e => e.id === examId), [exams, examId]);

  useEffect(() => {
    if (!exam) return;
    const fetchStudents = async () => {
      const sSnap = await getDocs(query(collection(db, "admissions"), where("course", "==", exam.course)));
      const list = sSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        .filter(s => s.regNo && !s.issueDate && s.status !== "canceled");
      setStudents(list);
    };
    fetchStudents();
  }, [exam]);

  useEffect(() => {
    if (!examId) return;
    const q = query(collection(db, "studentExams"), where("examId", "==", examId));
    const unsubscribe = onSnapshot(q, (snap) => {
      const mapping = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        if (data.studentId) {
          mapping[data.studentId.toLowerCase().trim()] = d.id;
        }
      });
      setAssignedData(mapping);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [examId]);

  const handleToggle = async (student) => {
    const studentEmail = student.email?.toLowerCase().trim();
    if (!studentEmail) {
      alert("Student has no email address!");
      return;
    }

    const isAssigned = !!assignedData[studentEmail];
    const docId = `${studentEmail}_${examId}`;

    try {
      if (isAssigned) {
        await deleteDoc(doc(db, "studentExams", docId));
      } else {
        await setDoc(doc(db, "studentExams", docId), {
          studentId: studentEmail,
          admissionId: student.id,
          examId: examId,
          status: "Pending",
          score: 0,
          assignedAt: serverTimestamp()
        });

        if (student.email) {
          await sendEmailNotification(
            student.email,
            `Examination Permit: ${exam?.title}`,
            examPermitTemplate(student, exam)
          );
        }
      }
    } catch (err) {
      console.error("Toggle Error:", err);
      alert("Database Error");
    }
  };

  const filtered = useMemo(() => students.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || s.regNo?.toLowerCase().includes(searchTerm.toLowerCase())
  ), [students, searchTerm]);

  if (loading && students.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Permit Access</Text>
        <TextInput 
          style={styles.search} 
          placeholder="Search student..." 
          placeholderTextColor="#94a3b8"
          onChangeText={setSearchTerm} 
        />
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {filtered.map(s => {
          const isPermitted = !!assignedData[s.email?.toLowerCase().trim()];
          return (
            <View key={s.id} style={styles.studentCard}>
              <Image source={{ uri: s.photoUrl || "https://ui-avatars.com/api/?name=User" }} style={styles.avatar} />
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{s.name}</Text>
                <Text style={styles.regText}>{s.regNo} • {isPermitted ? "Permitted" : "No Access"}</Text>
              </View>
              <Switch 
                value={isPermitted}
                onValueChange={() => handleToggle(s)}
                trackColor={{ false: "#cbd5e1", true: "#34d399" }}
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a', marginBottom: 8 },
  search: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 20, paddingHorizontal: 14, height: 38, fontSize: 12, fontWeight: '700' },
  list: { padding: 16, gap: 10 },
  studentCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', elevation: 1 },
  avatar: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#e2e8f0' },
  studentInfo: { flex: 1, marginLeft: 12 },
  studentName: { fontSize: 13, fontWeight: '800', color: '#0f172a' },
  regText: { fontSize: 10, fontWeight: '700', color: '#64748b', marginTop: 2 }
});