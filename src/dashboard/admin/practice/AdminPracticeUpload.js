// src/dashboard/admin/practice/AdminPracticeUpload.js
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Platform } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { db } from "../../../services/firebase";
import { collection, addDoc, deleteDoc, doc, getDocs, serverTimestamp, query, orderBy } from "firebase/firestore";

const C = {
  primary: '#071e3d',
  secondary: '#0284c7',
  danger: '#ef4444',
  white: '#ffffff',
  border: '#e2e8f0',
  gray: '#64748b',
  bg: '#f8fafc',
  dark: '#0f172a'
};

const shadowStyle = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
  android: { elevation: 3 }
});

export default function AdminPracticeUpload({ navigation }) {
  const [tests, setTests] = useState([]);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Custom Minimal Modal States
  const [deleteId, setDeleteId] = useState(null);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: "", message: "", isSuccess: false });

  const showAlert = (title, message, isSuccess = false) => {
    setAlertConfig({ visible: true, title, message, isSuccess });
  };

  const loadTests = async () => {
    try {
      const q = query(collection(db, "practiceTests"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setTests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { loadTests(); }, []);

  const createTest = async () => {
    if (!title.trim() || !duration.trim()) {
      return showAlert("Error", "Please fill all fields");
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "practiceTests"), {
        title: title.trim(), 
        duration: Number(duration), 
        totalQuestions: 0, 
        createdAt: serverTimestamp()
      });
      setTitle(""); 
      setDuration(""); 
      loadTests();
      showAlert("Success", "Practice paper created successfully", true);
    } catch { 
      showAlert("Error", "Failed to create paper"); 
    } finally { 
      setLoading(false); 
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const targetId = deleteId;
    setDeleteId(null);
    try {
      await deleteDoc(doc(db, "practiceTests", targetId));
      loadTests();
      showAlert("Deleted", "Practice test removed successfully", true);
    } catch (error) {
      showAlert("Error", "Failed to delete paper");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.topBadge}>
        <MaterialIcons name="bolt" size={12} color={C.secondary} />
        <Text style={styles.topBadgeText}>Drishtee Console</Text>
      </View>
      <Text style={styles.headerTitle}>Manage Practice Tests</Text>

      <View style={styles.formCard}>
        <TextInput 
          style={styles.input} 
          placeholder="Paper Title (e.g., Tally Prime Test 1)" 
          placeholderTextColor="#94a3b8"
          value={title} 
          onChangeText={setTitle} 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Duration (in minutes)" 
          placeholderTextColor="#94a3b8"
          keyboardType="numeric"
          value={duration} 
          onChangeText={setDuration} 
        />
        <TouchableOpacity style={styles.primaryBtn} onPress={createTest} disabled={loading} activeOpacity={0.8}>
          {loading ? <ActivityIndicator color={C.white} /> : <Text style={styles.primaryBtnText}>Create Paper</Text>}
        </TouchableOpacity>
      </View>

      {fetching ? (
        <ActivityIndicator size="large" color={C.secondary} style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.list}>
          {tests.map((test) => (
            <View key={test.id} style={styles.testCard}>
              <View style={styles.testTopRow}>
                <Text style={styles.testTitle} numberOfLines={1}>{test.title}</Text>
                <TouchableOpacity onPress={() => setDeleteId(test.id)} style={styles.delBtn} activeOpacity={0.7}>
                  <MaterialIcons name="delete-outline" size={18} color={C.danger} />
                </TouchableOpacity>
              </View>
              <Text style={styles.testSub}>⏱ {test.duration} Mins | 📝 {test.totalQuestions || 0} Questions</Text>

              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={styles.actionBtnDark} 
                  onPress={() => navigation.navigate("AdminPracticeAssign", { testId: test.id })}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionBtnDarkText}>Assign</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionBtnOutline} 
                  onPress={() => navigation.navigate("AdminPracticeQuestionsManage", { testId: test.id })}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionBtnOutlineText}>Questions</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Custom Delete Confirmation Modal */}
      <Modal visible={!!deleteId} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <MaterialIcons name="warning-amber" size={28} color={C.secondary} style={{ marginBottom: 6 }} />
            <Text style={styles.modalTitle}>Confirm Delete</Text>
            <Text style={styles.modalSub}>Are you sure you want to delete this test?</Text>
            
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

      {/* Custom Feedback Modal (Replaces standard Alert.alert) */}
      <Modal visible={alertConfig.visible} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <MaterialIcons 
              name={alertConfig.isSuccess ? "check-circle" : "error-outline"} 
              size={28} 
              color={alertConfig.isSuccess ? '#10b981' : C.danger} 
              style={{ marginBottom: 6 }} 
            />
            <Text style={styles.modalTitle}>{alertConfig.title}</Text>
            <Text style={styles.modalSub}>{alertConfig.message}</Text>
            
            <TouchableOpacity 
              style={styles.singleBtn} 
              onPress={() => setAlertConfig(prev => ({ ...prev, visible: false }))} 
              activeOpacity={0.8}
            >
              <Text style={styles.confirmBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: C.bg, padding: 14 },
  topBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e0f2fe', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 6, borderWidth: 1, borderColor: '#bae6fd' },
  topBadgeText: { fontSize: 10, fontWeight: '900', color: C.secondary, marginLeft: 4, textTransform: 'uppercase' },
  headerTitle: { fontSize: 14, fontWeight: '900', color: C.primary, marginBottom: 12, textTransform: 'uppercase' },
  formCard: { 
    backgroundColor: C.white, 
    borderRadius: 12, 
    padding: 14, 
    borderWidth: 1, 
    borderColor: C.border, 
    marginBottom: 14, 
    gap: 10,
    ...shadowStyle
  },
  input: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingHorizontal: 12, height: 42, fontSize: 13, fontWeight: '700', color: C.dark },
  primaryBtn: { 
    backgroundColor: C.secondary, 
    height: 42, 
    borderRadius: 8, 
    justifyContent: 'center', 
    alignItems: 'center',
    ...shadowStyle
  },
  primaryBtnText: { color: C.white, fontSize: 12, fontWeight: '900' },
  list: { gap: 10 },
  testCard: { 
    backgroundColor: C.white, 
    borderRadius: 12, 
    padding: 12, 
    borderWidth: 1, 
    borderColor: C.border,
    ...shadowStyle
  },
  testTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  testTitle: { fontSize: 13, fontWeight: '900', color: C.dark, flex: 1, marginRight: 8 },
  delBtn: { backgroundColor: '#fef2f2', padding: 4, borderRadius: 6, borderWidth: 1, borderColor: '#fee2e2' },
  testSub: { fontSize: 11, fontWeight: '700', color: C.gray, marginBottom: 10 },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtnDark: { flex: 1, backgroundColor: C.dark, height: 36, borderRadius: 6, justifyContent: 'center', alignItems: 'center', ...shadowStyle },
  actionBtnDarkText: { color: C.white, fontSize: 11, fontWeight: '900' },
  actionBtnOutline: { flex: 1, backgroundColor: C.white, height: 36, borderRadius: 6, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.secondary },
  actionBtnOutlineText: { color: C.secondary, fontSize: 11, fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(7, 30, 61, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalCard: { width: '100%', maxWidth: 280, backgroundColor: C.white, borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: C.border, ...shadowStyle },
  modalTitle: { fontSize: 14, fontWeight: '900', color: C.dark, marginBottom: 4 },
  modalSub: { fontSize: 11, color: C.gray, textAlign: 'center', fontWeight: '600', marginBottom: 16 },
  modalBtnRow: { flexDirection: 'row', gap: 8, width: '100%' },
  cancelBtn: { flex: 1, backgroundColor: '#f1f5f9', height: 38, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.border },
  cancelBtnText: { color: C.dark, fontSize: 11, fontWeight: '900' },
  confirmBtn: { flex: 1, backgroundColor: C.danger, height: 38, borderRadius: 8, justifyContent: 'center', alignItems: 'center', ...shadowStyle },
  confirmBtnText: { color: C.white, fontSize: 11, fontWeight: '900' },
  singleBtn: { width: '100%', backgroundColor: C.secondary, height: 38, borderRadius: 8, justifyContent: 'center', alignItems: 'center', ...shadowStyle }
});