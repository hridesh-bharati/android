// src/dashboard/student/exams/StudentExamPage.js
import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { db, auth } from "../../../services/firebase";
import { doc, getDoc, collection, query, where, getDocs, updateDoc, onSnapshot, serverTimestamp } from "firebase/firestore";

export default function StudentExamPage({ route, navigation }) {
  const { examId } = route.params;
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [ans, setAns] = useState({});
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [examStarted, setExamStarted] = useState(false);
  const [admissionId, setAdmissionId] = useState(null);

  useEffect(() => {
    const fetchInitialInfo = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser?.email || !examId) return;

      try {
        const userEmail = currentUser.email.toLowerCase().trim();
        setAdmissionId(userEmail);

        const eDoc = await getDoc(doc(db, "exams", examId));
        if (eDoc.exists()) {
          const examData = eDoc.data();
          setExam(examData);
          setTimeLeft((examData.duration || 1) * 3600);
        }

        const qSnap = await getDocs(query(collection(db, "examQuestions"), where("examId", "==", examId)));
        setQuestions(qSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) { 
        console.error(err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchInitialInfo();
  }, [examId]);

  useEffect(() => {
    if (!admissionId || !examId) return;
    const unsubStatus = onSnapshot(doc(db, "studentExams", `${admissionId}_${examId}`), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.status === "Ongoing") setExamStarted(true);
        if (data.status === "Completed") {
          navigation.replace("StudentExamGreet");
        }
      }
    });
    return () => unsubStatus();
  }, [admissionId, examId, navigation]);

  const handleFinalSubmit = useCallback(async () => {
    try {
      const docId = `${admissionId}_${examId}`;
      let score = 0;
      questions.forEach(q => {
        if (ans[q.id] === q.correctAnswer) {
          score += Number(q.marks || 1);
        }
      });

      await updateDoc(doc(db, "studentExams", docId), {
        status: "Completed",
        answers: ans,
        score: score,
        completedAt: serverTimestamp()
      });
      navigation.replace("StudentExamGreet");
    } catch (err) { 
      console.error(err); 
    }
  }, [admissionId, examId, ans, questions, navigation]);

  useEffect(() => {
    if (!examStarted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examStarted, handleFinalSubmit]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  if (examStarted) {
    const q = questions[index];
    const isAnswered = !!ans[q?.id];

    return (
      <View style={styles.container}>
        <View style={styles.examTopBar}>
          <Text style={styles.qCountText}>QUESTION {index + 1} / {questions.length}</Text>
          <View style={styles.timerBadge}>
            <MaterialIcons name="alarm" size={14} color="#fff" style={{ marginRight: 4 }} />
            <Text style={styles.timerText}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.examScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.questionStatement}>{q?.question}</Text>
          
          <View style={styles.optionsContainer}>
            {["A", "B", "C", "D"].map((opt) => {
              const optionText = q ? q[`option${opt}`] : null;
              if (!optionText) return null;

              return (
                <TouchableOpacity 
                  key={opt} 
                  style={[styles.optionBtn, ans[q?.id] === opt && styles.optionBtnActive]} 
                  onPress={() => setAns({ ...ans, [q.id]: opt })}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.optionLetter, ans[q?.id] === opt && { color: '#fff' }]}>{opt}.</Text>
                  <Text style={[styles.optionText, ans[q?.id] === opt && { color: '#fff' }]}>{optionText}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.examFooter}>
          <TouchableOpacity 
            style={[styles.navBtn, index === 0 && { opacity: 0.5 }]} 
            disabled={index === 0} 
            onPress={() => setIndex(index - 1)}
          >
            <Text style={styles.navBtnText}>Prev</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.navBtnPrimary, !isAnswered && { opacity: 0.6 }]} 
            disabled={!isAnswered} 
            onPress={() => index === questions.length - 1 ? handleFinalSubmit() : setIndex(index + 1)}
          >
            <Text style={styles.navBtnPrimaryText}>{index === questions.length - 1 ? "Finish" : "Next"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.startContainer}>
      <View style={styles.startCard}>
        <Text style={styles.startTitle}>{exam?.title}</Text>
        <Text style={styles.startSub}>Total Questions: {questions.length}</Text>
        
        <View style={styles.rulesBox}>
          <Text style={styles.rulesTitle}>Examination Rules:</Text>
          <Text style={styles.ruleItem}>• Answer current question to unlock NEXT.</Text>
          <Text style={styles.ruleItem}>• Timer will auto-submit exam when it hits zero.</Text>
        </View>

        <TouchableOpacity 
          style={styles.startBtn} 
          onPress={() => updateDoc(doc(db, "studentExams", `${admissionId}_${examId}`), { status: "Ongoing", startedAt: serverTimestamp() })}
        >
          <Text style={styles.startBtnText}>START EXAMINATION</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  examTopBar: { height: 48, backgroundColor: '#0f172a', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 },
  qCountText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  timerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ef4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  timerText: { fontSize: 11, fontWeight: '900', color: '#fff' },
  examScroll: { padding: 16, paddingBottom: 30 },
  questionStatement: { fontSize: 15, fontWeight: '900', color: '#0f172a', marginBottom: 16, lineHeight: 22 },
  optionsContainer: { gap: 10 },
  optionBtn: { backgroundColor: '#fff', borderRadius: 10, padding: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', elevation: 1 },
  optionBtnActive: { backgroundColor: '#0284c7', borderColor: '#0284c7' },
  optionLetter: { fontSize: 13, fontWeight: '900', color: '#0284c7', marginRight: 8 },
  optionText: { fontSize: 13, fontWeight: '700', color: '#1e293b', flex: 1 },
  examFooter: { height: 60, backgroundColor: '#fff', flexDirection: 'row', padding: 10, borderTopWidth: 1, borderTopColor: '#e2e8f0', gap: 10 },
  navBtn: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e1' },
  navBtnText: { fontSize: 12, fontWeight: '800', color: '#334155' },
  navBtnPrimary: { flex: 1, backgroundColor: '#10b981', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  navBtnPrimaryText: { fontSize: 12, fontWeight: '900', color: '#fff' },
  startContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: '#f8fafc' },
  startCard: { width: '100%', maxWidth: 380, backgroundColor: '#fff', borderRadius: 20, padding: 22, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', elevation: 3 },
  startTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a', textAlign: 'center', marginBottom: 4 },
  startSub: { fontSize: 12, color: '#64748b', fontWeight: '700', marginBottom: 16 },
  rulesBox: { width: '100%', backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', borderLeftWidth: 4, borderLeftColor: '#0284c7', marginBottom: 20 },
  rulesTitle: { fontSize: 11, fontWeight: '900', color: '#0284c7', textTransform: 'uppercase', marginBottom: 6 },
  ruleItem: { fontSize: 11, color: '#475569', fontWeight: '600', marginBottom: 3 },
  startBtn: { width: '100%', height: 48, backgroundColor: '#0284c7', borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  startBtnText: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 0.5 }
});