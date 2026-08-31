// src/dashboard/student/practice/PracticeMyResults.js
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { auth, db } from "../../../services/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function PracticeMyResults({ route }) {
  const selectedTestId = route?.params?.testId;
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, "practiceResults"),
      where("studentEmail", "==", user.email.toLowerCase()),
      where("status", "==", "Completed")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const sorted = data.sort((a, b) => (b.submittedAt?.seconds || 0) - (a.submittedAt?.seconds || 0));
      
      if (selectedTestId) {
        setResults(sorted.filter(item => item.testId === selectedTestId));
      } else {
        setResults(sorted);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [selectedTestId]);

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
        <Text style={styles.headerTitle}>Practice Test Results</Text>
      </View>

      <View style={styles.list}>
        {results.length > 0 ? (
          results.map((r) => (
            <View key={r.id} style={styles.resultCard}>
              <View style={styles.resultTop}>
                <Text style={styles.testTitle} numberOfLines={1}>{r.testTitle}</Text>
                <View style={[styles.pctBadge, { backgroundColor: parseFloat(r.percentage) >= 40 ? '#ecfdf5' : '#fef2f2' }]}>
                  <Text style={[styles.pctText, { color: parseFloat(r.percentage) >= 40 ? '#059669' : '#dc2626' }]}>{r.percentage}%</Text>
                </View>
              </View>
              
              <Text style={styles.scoreText}>Score: {r.score} / {r.totalQuestions}</Text>

              {/* Question breakdown review */}
              <View style={styles.breakdownBox}>
                {r.fullDetails?.map((item, idx) => (
                  <View key={idx} style={[styles.itemReview, item.isCorrect ? styles.borderSuccess : styles.borderDanger]}>
                    <Text style={styles.reviewQ}>{idx + 1}. {item.question}</Text>
                    <Text style={styles.reviewAns}>
                      Your Choice: <Text style={{ fontWeight: '900', color: item.isCorrect ? '#10b981' : '#ef4444' }}>
                        {item.selectedOption !== null ? item.options[item.selectedOption] : 'Not Answered'}
                      </Text>
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyBox}>
            <MaterialIcons name="assessment" size={40} color="#cbd5e1" style={{ marginBottom: 8 }} />
            <Text style={styles.emptyTitle}>No Practice Results Found</Text>
            <Text style={styles.emptySub}>Complete your assigned practice tests to view detailed performance analytics here.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f8fafc', padding: 14 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBar: { backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  headerTitle: { fontSize: 14, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' },
  list: { gap: 12, marginBottom: 20 },
  resultCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#e2e8f0', elevation: 1 },
  resultTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  testTitle: { fontSize: 13, fontWeight: '900', color: '#0f172a', flex: 1, marginRight: 8 },
  pctBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  pctText: { fontSize: 10, fontWeight: '900' },
  scoreText: { fontSize: 11, fontWeight: '800', color: '#0284c7', marginBottom: 10 },
  breakdownBox: { gap: 6, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10 },
  itemReview: { backgroundColor: '#f8fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', borderLeftWidth: 3 },
  borderSuccess: { borderLeftColor: '#10b981' },
  borderDanger: { borderLeftColor: '#ef4444' },
  reviewQ: { fontSize: 11, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  reviewAns: { fontSize: 10, color: '#64748b', fontWeight: '700' },
  emptyBox: { padding: 40, alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  emptyTitle: { fontSize: 13, fontWeight: '900', color: '#0f172a', marginBottom: 2 },
  emptySub: { fontSize: 11, color: '#64748b', textAlign: 'center', fontWeight: '600' }
});