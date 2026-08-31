// src/dashboard/admin/practice/AdminPracticeResults.js
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Modal } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { db } from "../../../services/firebase";
import { collection, query, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { GlassCard, SkeletonLoader } from "../../../ui/GlassCard";

const COLORS = {
  primary: '#071e3d',
  secondary: '#0284c7',
  accent: '#38bdf8',
  danger: '#ff0000',
  white: '#ffffff',
  lightGray: '#cbd5e1',
  gray: '#94a3b8',
  darkGray: '#1e293b',
};

const FONTS = {
  bold: 'System',
  regular: 'System',
};

export default function AdminPracticeResults({ route, navigation }) {
  const preSelectedEmail = route?.params?.email || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "practiceResults"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const finished = list.filter(r => ["Completed", "Submitted"].includes(r.status) || !r.status);
      setResults(finished.sort((a, b) => (b.submittedAt?.seconds || 0) - (a.submittedAt?.seconds || 0)));
      setLoading(false);
    }, (err) => {
      console.error("Fetch error:", err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const confirmDelete = async () => {
    if (!deleteId) return;
    const targetId = deleteId;
    setDeleteId(null);
    try {
      await deleteDoc(doc(db, "practiceResults", targetId));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const filtered = useMemo(() => {
    return results.filter((r) => {
      const matchesEmail = preSelectedEmail ? r.studentEmail?.toLowerCase() === preSelectedEmail : true;
      const matchesSearch =
        r.testTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesEmail && matchesSearch;
    });
  }, [results, searchTerm, preSelectedEmail]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Exam Records</Text>
        <SkeletonLoader count={4} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* 🚀 Native Android UX Top Navigation Action Bar */}
      <View style={styles.topActionBar}>
        <TouchableOpacity style={styles.actionTab} onPress={() => navigation?.navigate("AdminPracticeDashboard")} activeOpacity={0.7}>
          <MaterialIcons name="dashboard" size={18} color={COLORS.secondary} />
          <Text style={styles.actionTabText}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionTab} onPress={() => navigation?.navigate("AdminPracticeUpload")} activeOpacity={0.7}>
          <MaterialIcons name="cloud-upload" size={18} color={COLORS.secondary} />
          <Text style={styles.actionTabText}>Upload Test</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionTab} onPress={() => navigation?.navigate("AdminPracticeLive")} activeOpacity={0.7}>
          <MaterialIcons name="sensors" size={18} color={COLORS.danger} />
          <Text style={styles.actionTabText}>Live</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.headerTitle}>Exam Records ({filtered.length})</Text>

      <TextInput 
        style={styles.searchBox}
        placeholder="Search student or test..."
        placeholderTextColor={COLORS.gray}
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      <View style={styles.list}>
        {filtered.map((r) => {
          const percent = parseFloat(r.percentage || 0);
          return (
            <GlassCard key={r.id}>
              <View style={styles.resultTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.testTitle} numberOfLines={1}>{r.testTitle || "Practice Test"}</Text>
                  <Text style={styles.studentName}>{r.studentName || r.studentEmail || "No Name"}</Text>
                  {r.submitReason && <Text style={styles.reasonText}>Type: {r.submitReason}</Text>}
                </View>
                <TouchableOpacity onPress={() => setDeleteId(r.id)} style={styles.deleteBtn} activeOpacity={0.7}>
                  <MaterialIcons name="delete" size={20} color={COLORS.danger} />
                </TouchableOpacity>
              </View>

              <View style={styles.scoreRow}>
                <Text style={styles.scoreText}>Score: {r.score ?? 0}/{r.totalQuestions ?? 0}</Text>
                <Text style={[styles.pctText, { color: percent >= 40 ? '#10b981' : COLORS.danger }]}>{percent}%</Text>
              </View>
            </GlassCard>
          );
        })}
        {filtered.length === 0 && <Text style={styles.noRecordText}>No exam records found.</Text>}
      </View>

      <Modal visible={!!deleteId} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <MaterialIcons name="warning" size={32} color={COLORS.secondary} style={{ marginBottom: 8 }} />
            <Text style={styles.modalTitle}>Delete Test Record</Text>
            <Text style={styles.modalSub}>Are you sure you want to delete this test result?</Text>
            
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setDeleteId(null)} activeOpacity={0.8}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={confirmDelete} activeOpacity={0.8}>
                <Text style={styles.confirmBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f0f6ff', padding: 14 },
  topActionBar: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 12, padding: 6, marginBottom: 14, borderWidth: 1, borderColor: COLORS.lightGray, elevation: 1, gap: 6 },
  actionTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, backgroundColor: '#f8fafc', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', gap: 4 },
  actionTabText: { fontSize: 11, fontFamily: FONTS.bold, fontWeight: '800', color: COLORS.darkGray },
  headerTitle: { fontSize: 15, fontFamily: FONTS.bold, fontWeight: '900', color: COLORS.primary, marginBottom: 12, textTransform: 'uppercase' },
  searchBox: { backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.lightGray, borderRadius: 12, paddingHorizontal: 14, height: 44, fontSize: 13, fontFamily: FONTS.regular, fontWeight: '700', color: COLORS.darkGray, marginBottom: 12, elevation: 2 },
  list: { gap: 4 },
  resultTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  testTitle: { fontSize: 14, fontFamily: FONTS.bold, fontWeight: '900', color: COLORS.darkGray },
  studentName: { fontSize: 12, fontFamily: FONTS.regular, fontWeight: '700', color: COLORS.secondary, marginTop: 2 },
  reasonText: { fontSize: 10, fontFamily: FONTS.regular, fontWeight: '700', color: COLORS.gray, marginTop: 2 },
  deleteBtn: { padding: 4 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(226, 232, 240, 0.8)', paddingTop: 8 },
  scoreText: { fontSize: 12, fontFamily: FONTS.bold, fontWeight: '800', color: COLORS.darkGray },
  pctText: { fontSize: 12, fontFamily: FONTS.bold, fontWeight: '900' },
  noRecordText: { textAlign: 'center', color: COLORS.gray, marginTop: 20, fontSize: 12, fontFamily: FONTS.regular, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(7, 30, 61, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalCard: { width: '100%', maxWidth: 300, backgroundColor: COLORS.white, borderRadius: 16, padding: 20, alignItems: 'center', elevation: 8, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10 },
  modalTitle: { fontSize: 15, fontFamily: FONTS.bold, fontWeight: '900', color: COLORS.darkGray, marginBottom: 4 },
  modalSub: { fontSize: 12, fontFamily: FONTS.regular, color: COLORS.gray, textAlign: 'center', fontWeight: '600', marginBottom: 20 },
  modalBtnRow: { flexDirection: 'row', gap: 10, width: '100%' },
  cancelBtn: { flex: 1, backgroundColor: '#f1f5f9', height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.lightGray },
  cancelBtnText: { color: COLORS.darkGray, fontSize: 12, fontFamily: FONTS.bold, fontWeight: '900' },
  confirmBtn: { flex: 1, backgroundColor: COLORS.danger, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  confirmBtnText: { color: COLORS.white, fontSize: 12, fontFamily: FONTS.bold, fontWeight: '900' }
});