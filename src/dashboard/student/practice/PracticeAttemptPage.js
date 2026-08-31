// src/dashboard/student/practice/PracticeAttemptPage.js
import React, { useEffect, useState, useCallback, useRef } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, AppState } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { db, auth } from "../../../services/firebase";
import { collection, query, where, getDocs, doc, getDoc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";

export default function PracticeAttemptPage({ route, navigation }) {
  const { testId } = route.params;
  const [questions, setQuestions] = useState([]);
  const [testInfo, setTestInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  const timerRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const isSubmittingRef = useRef(isSubmitting);
  isSubmittingRef.current = isSubmitting;

  const autoSubmitTest = useCallback(async (reason = "Manual") => {
    if (isSubmittingRef.current) return;
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      let score = 0;
      const details = questions.map(q => {
        const isCorrect = answers[q.id] === q.correct;
        if (isCorrect) score++;
        return {
          question: q.question,
          options: q.options,
          correctOption: q.correct,
          selectedOption: answers[q.id] ?? null,
          isCorrect
        };
      });

      const user = auth.currentUser;
      if (!user) return;
      const email = user.email.toLowerCase().trim();

      await setDoc(doc(db, "practiceResults", `${email}_${testId}`), {
        testTitle: testInfo?.title || "Practice Test",
        score,
        totalQuestions: questions.length,
        status: "Completed",
        percentage: questions.length > 0 ? ((score / questions.length) * 100).toFixed(2) : 0,
        submittedAt: serverTimestamp(),
        fullDetails: details,
        submitReason: reason
      }, { merge: true });

      if (reason === "Cheating") {
        Alert.alert("Alert", "App minimization / switching detected! Test submitted automatically.");
      } else if (reason === "Timeout") {
        Alert.alert("Time Up", "Test submitted automatically as time expired.");
      }

      navigation.replace("PracticeMyResults", { testId });
    } catch (err) {
      console.error("Auto submit error:", err);
      setIsSubmitting(false);
    }
  }, [answers, questions, testId, navigation, testInfo]);

  // --- 🕵️‍♂️ Anti-Cheat: App Minimize / Background Detection ---
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appStateRef.current.match(/active/) &&
        (nextAppState === "background" || nextAppState === "inactive")
      ) {
        autoSubmitTest("Cheating");
      }
      appStateRef.current = nextAppState;
    });

    return () => subscription.remove();
  }, [autoSubmitTest]);

  // --- ⏱️ Countdown Timer ---
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      autoSubmitTest("Timeout");
      return;
    }
    timerRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft, autoSubmitTest]);

  // --- 🔒 Initial Fetch & Access Listener ---
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigation.replace("PracticeTestList");
      return;
    }

    const email = user.email.toLowerCase().trim();
    const assignRef = doc(db, "practiceAssigned", `${email}_${testId}`);
    const resultRef = doc(db, "practiceResults", `${email}_${testId}`);

    const unsubAssign = onSnapshot(assignRef, (snap) => {
      if (!snap.exists() && !isSubmittingRef.current) {
        Alert.alert("Access Revoked", "Admin has disabled your test access.");
        navigation.replace("PracticeTestList");
      }
    });

    const initTest = async () => {
      try {
        const rSnap = await getDoc(resultRef);
        if (rSnap.exists() && ["Completed", "Submitted"].includes(rSnap.data().status)) {
          alert("You have already completed this test!");
          return navigation.replace("PracticeMyResults", { testId });
        }

        const [tDoc, sSnap] = await Promise.all([
          getDoc(doc(db, "practiceTests", testId)),
          getDoc(doc(db, "admissions", email))
        ]);

        if (!tDoc.exists()) throw new Error("Test not found");
        const data = tDoc.data();
        setTestInfo(data);
        if (data.duration) setTimeLeft(data.duration * 60);

        const realName = sSnap.exists() ? sSnap.data().name : (user.displayName || email.split('@')[0]);

        await setDoc(resultRef, {
          testId, 
          testTitle: data?.title || "Practice",
          studentEmail: email, 
          studentName: realName,
          status: "Ongoing", 
          startedAt: serverTimestamp(),
        }, { merge: true });

        const qSnap = await getDocs(query(collection(db, "practiceQuestions"), where("testId", "==", testId)));
        const shuffled = qSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort(() => Math.random() - 0.5);
        setQuestions(shuffled);
      } catch (err) {
        console.error(err);
        navigation.replace("PracticeTestList");
      } finally { 
        setLoading(false); 
      }
    };

    initTest();

    return () => unsubAssign();
  }, [testId, navigation]);

  const formatTime = (seconds) => {
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  const currentQ = questions[currentIndex];
  if (!currentQ) return <View style={styles.center}><Text>No Questions Found</Text></View>;
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.topRowInfo}>
          <Text style={styles.testName}>{testInfo?.title}</Text>
          {timeLeft !== null && <Text style={styles.timerText}>⏱️ {formatTime(timeLeft)}</Text>}
        </View>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.questionCard} showsVerticalScrollIndicator={false}>
        <Text style={styles.qNum}>QUESTION {currentIndex + 1} / {questions.length}</Text>
        <Text style={styles.qText}>{currentQ.question}</Text>

        <View style={styles.optionsList}>
          {currentQ.options.map((opt, i) => {
            const isSelected = answers[currentQ.id] === i;
            return (
              <TouchableOpacity 
                key={i} 
                style={[styles.optionItem, isSelected && styles.optionItemActive]}
                onPress={() => setAnswers({ ...answers, [currentQ.id]: i })}
                activeOpacity={0.8}
              >
                <View style={[styles.optionCircle, isSelected && styles.optionCircleActive]}>
                  <Text style={[styles.optionLetter, isSelected && { color: '#fff' }]}>{String.fromCharCode(65 + i)}</Text>
                </View>
                <Text style={[styles.optionText, isSelected && { color: '#0284c7', fontWeight: '900' }]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footerRow}>
        <TouchableOpacity 
          style={[styles.bottomBtn, currentIndex === 0 && { opacity: 0.5 }]} 
          disabled={currentIndex === 0} 
          onPress={() => setCurrentIndex(c => c - 1)}
        >
          <Text style={styles.bottomBtnText}>Back</Text>
        </TouchableOpacity>

        {currentIndex === questions.length - 1 ? (
          <TouchableOpacity style={[styles.bottomBtn, { backgroundColor: '#10b981' }]} onPress={() => autoSubmitTest("Manual")}>
            <Text style={[styles.bottomBtnText, { color: '#fff' }]}>Finish</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.bottomBtn, { backgroundColor: '#0284c7' }]} onPress={() => setCurrentIndex(c => c + 1)}>
            <Text style={[styles.bottomBtnText, { color: '#fff' }]}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: { backgroundColor: '#fff', padding: 14, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  topRowInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  testName: { fontSize: 12, fontWeight: '900', color: '#64748b', textTransform: 'uppercase' },
  timerText: { fontSize: 12, fontWeight: '900', color: '#ef4444' },
  progressBarTrack: { height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#0284c7', borderRadius: 3 },
  questionCard: { padding: 16, paddingBottom: 30 },
  qNum: { fontSize: 10, fontWeight: '900', color: '#0284c7', marginBottom: 4, textTransform: 'uppercase' },
  qText: { fontSize: 15, fontWeight: '900', color: '#0f172a', marginBottom: 16, lineHeight: 22 },
  optionsList: { gap: 10 },
  optionItem: { backgroundColor: '#fff', borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  optionItemActive: { borderColor: '#0284c7', backgroundColor: '#f0f9ff' },
  optionCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: '#cbd5e1' },
  optionCircleActive: { backgroundColor: '#0284c7', borderColor: '#0284c7' },
  optionLetter: { fontSize: 11, fontWeight: '900', color: '#334155' },
  optionText: { fontSize: 13, fontWeight: '700', color: '#1e293b', flex: 1 },
  footerRow: { height: 60, backgroundColor: '#fff', flexDirection: 'row', padding: 10, borderTopWidth: 1, borderTopColor: '#e2e8f0', gap: 10 },
  bottomBtn: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e1' },
  bottomBtnText: { fontSize: 12, fontWeight: '900', color: '#334155' }
});