// src/dashboard/student/practice/PracticeTestList.js
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { auth, db } from "../../../services/firebase";
import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";

export default function PracticeTestList({ navigation }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      return;
    }
    const userEmail = user.email.toLowerCase().trim();
    
    // ✅ Realtime listener for assigned tests
    const q = query(collection(db, "practiceAssigned"), where("studentId", "==", userEmail));
    
    const unsub = onSnapshot(q, async (snap) => {
      setLoading(true);
      try {
        const list = await Promise.all(
          snap.docs.map(async (d) => {
            const tId = d.data().testId;
            if (!tId) return null;
            const resultRef = doc(db, "practiceResults", `${userEmail}_${tId}`);
            const resultSnap = await getDoc(resultRef);
            const completed = resultSnap.exists() && resultSnap.data().status === "Completed";
            const tDoc = await getDoc(doc(db, "practiceTests", tId));

            if (!tDoc.exists()) {
              return completed ? { id: tId, title: resultSnap.data().testTitle || "Test", duration: "-", completed: true } : null;
            }
            return { id: tId, ...tDoc.data(), completed };
          })
        );
        setTests(list.filter(Boolean));
      } catch (err) {
        console.error("Error loading assigned tests:", err);
      } finally { 
        setLoading(false); 
      }
    });

    return () => unsub();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Practice Tests</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{tests.length} Assigned</Text>
        </View>
      </View>

      <View style={styles.list}>
        {tests.length > 0 ? (
          tests.map((t) => (
            <View key={t.id} style={styles.testCard}>
              <View style={styles.testCardTop}>
                <View style={styles.iconBox}>
                  <MaterialIcons name={t.completed ? "check-circle" : "quiz"} size={22} color={t.completed ? "#10b981" : "#0284c7"} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.testTitle} numberOfLines={1}>{t.title}</Text>
                  <Text style={styles.testDuration}>Duration: {t.duration || 15} Mins</Text>
                </View>
                {t.completed && (
                  <View style={styles.doneChip}>
                    <Text style={styles.doneChipText}>DONE</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity 
                style={[styles.testBtn, t.completed ? styles.btnDark : styles.btnPrimary]}
                onPress={() => navigation.navigate(t.completed ? "PracticeMyResults" : "PracticeAttemptPage", { testId: t.id })}
              >
                <Text style={styles.testBtnText}>{t.completed ? "Review Practice Result" : "Take Practice Test"}</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyBox}>
            <MaterialIcons name="speaker-notes-off" size={40} color="#cbd5e1" style={{ marginBottom: 8 }} />
            <Text style={styles.emptyTitle}>No Practice Tests Assigned</Text>
            <Text style={styles.emptySub}>Practice tests assigned by your instructor will show up here.</Text>
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
  countBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  countText: { fontSize: 10, fontWeight: '800', color: '#334155' },
  list: { gap: 10 },
  testCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#e2e8f0', elevation: 1 },
  testCardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#f0f9ff', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#bae6fd' },
  testTitle: { fontSize: 13, fontWeight: '900', color: '#0f172a' },
  testDuration: { fontSize: 10, fontWeight: '700', color: '#64748b', marginTop: 2 },
  doneChip: { backgroundColor: '#ecfdf5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: '#a7f3d0' },
  doneChipText: { fontSize: 9, fontWeight: '900', color: '#059669' },
  testBtn: { height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  btnPrimary: { backgroundColor: '#0284c7' },
  btnDark: { backgroundColor: '#0f172a' },
  testBtnText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  emptyBox: { padding: 40, alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  emptyTitle: { fontSize: 13, fontWeight: '900', color: '#0f172a', marginBottom: 2 },
  emptySub: { fontSize: 11, color: '#64748b', textAlign: 'center', fontWeight: '600' }
});