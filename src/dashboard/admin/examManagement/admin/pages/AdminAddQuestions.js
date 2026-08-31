// src/dashboard/admin/examManagement/admin/pages/AdminAddQuestions.js
import React, { useState, useEffect } from "react";
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ScrollView, ActivityIndicator, Alert, Modal 
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { db } from "../../../../../services/firebase";
import { collection, query, where, getDocs, doc, writeBatch, serverTimestamp } from "firebase/firestore";
import { useExam } from "../../context/ExamProvider";

export default function AdminAddQuestions({ route, navigation }) {
  const { examId } = route.params;
  const { exams } = useExam();
  const [list, setList] = useState([]);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [q, setQ] = useState({
    question: "",
    type: "mcq",
    language: "javascript",
    optionA: "", optionB: "", optionC: "", optionD: "",
    correctAnswer: "A",
    marks: 1,
    sampleCode: ""
  });

  const resetForm = () => {
    setQ({
      question: "", type: "mcq", language: "javascript",
      optionA: "", optionB: "", optionC: "", optionD: "",
      correctAnswer: "A", marks: 1, sampleCode: ""
    });
    setEditingId(null);
  };

  useEffect(() => {
    const foundExam = exams.find(e => e.id === examId);
    setExam(foundExam);

    const fetchQs = async () => {
      try {
        const snap = await getDocs(query(collection(db, "examQuestions"), where("examId", "==", examId)));
        setList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) { 
        console.error(err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchQs();
  }, [examId, exams]);

  const fetchFromMasterBank = async () => {
    if (!exam?.course) return alert("Course not found!");
    setFetching(true);
    try {
      const qry = query(collection(db, "masterQuestions"), where("course", "==", exam.course));
      const snap = await getDocs(qry);
      const masterData = snap.docs.map(d => {
        const { id, ...rest } = d.data();
        return rest;
      });
      if (masterData.length === 0) {
        Alert.alert("Notice", `No questions found in Master Bank for: ${exam.course}`);
      } else {
        setList(masterData);
        Alert.alert("Success", `${masterData.length} Questions imported! Save to apply changes.`);
      }
    } catch (err) { 
      Alert.alert("Fetch Error", err.message); 
    } finally { 
      setFetching(false); 
    }
  };

  const handleAddOrUpdate = () => {
    if (!q.question) return alert("Question is required!");
    if (q.type === 'mcq' && (!q.optionA || !q.optionB)) {
      return alert("MCQ needs at least 2 options!");
    }
    if (q.type === 'programming' && q.marks <= 1) {
      q.marks = 10;
    }

    setList(editingId !== null
      ? list.map((item, i) => (i === editingId ? { ...q } : item))
      : [...list, { ...q }]
    );
    resetForm();
  };

  const handleFinalSave = async () => {
    Alert.alert(
      "Confirm Save",
      "CAUTION: This will override existing exam questions and master bank definitions. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: async () => {
            setLoading(true);
            try {
              let batch = writeBatch(db);
              const oldExamQs = await getDocs(query(collection(db, "examQuestions"), where("examId", "==", examId)));
              oldExamQs.forEach(d => batch.delete(d.ref));

              const oldMasterQs = await getDocs(query(collection(db, "masterQuestions"), where("course", "==", exam.course)));
              oldMasterQs.forEach(d => batch.delete(d.ref));

              await batch.commit();
              batch = writeBatch(db);

              list.forEach((item) => {
                const examQRef = doc(collection(db, "examQuestions"));
                batch.set(examQRef, { ...item, examId, updatedAt: serverTimestamp() });

                const masterRef = doc(collection(db, "masterQuestions"));
                batch.set(masterRef, { ...item, course: exam.course, updatedAt: serverTimestamp() });
              });

              await batch.commit();
              Alert.alert("Success", "Exam and Master Bank Updated!");
              navigation.goBack();
            } catch (err) { 
              Alert.alert("Save Error", err.message); 
            } finally { 
              setLoading(false); 
            }
          }
        }
      ]
    );
  };

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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={22} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Builder: {exam?.title}</Text>
        <TouchableOpacity style={styles.importBtn} onPress={fetchFromMasterBank} disabled={fetching}>
          <Text style={styles.importBtnText}>{fetching ? "..." : "IMPORT"}</Text>
        </TouchableOpacity>
      </View>

      {/* Question Form Card */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>{editingId !== null ? "Edit Question" : "New Question"}</Text>

        <View style={styles.typeRow}>
          <TouchableOpacity 
            style={[styles.typeBtn, q.type === 'mcq' && styles.typeBtnActive]}
            onPress={() => setQ({ ...q, type: 'mcq', marks: 1 })}
          >
            <Text style={[styles.typeText, q.type === 'mcq' && styles.typeTextActive]}>MCQ</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.typeBtn, q.type === 'programming' && styles.typeBtnActive]}
            onPress={() => setQ({ ...q, type: 'programming', marks: 10 })}
          >
            <Text style={[styles.typeText, q.type === 'programming' && styles.typeTextActive]}>Programming</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.textArea}
          placeholder="Enter Question Statement..."
          placeholderTextColor="#94a3b8"
          value={q.question}
          onChangeText={val => setQ({ ...q, question: val })}
          multiline
          numberOfLines={3}
        />

        {q.type === 'mcq' && (
          <View style={styles.mcqGrid}>
            {['A', 'B', 'C', 'D'].map(opt => (
              <TextInput
                key={opt}
                style={styles.mcqInput}
                placeholder={`Option ${opt}`}
                placeholderTextColor="#94a3b8"
                value={q[`option${opt}`]}
                onChangeText={val => setQ({ ...q, [`option${opt}`]: val })}
              />
            ))}
          </View>
        )}

        <View style={styles.rowInputs}>
          {q.type === 'mcq' && (
            <View style={{ flex: 1 }}>
              <Text style={styles.subLabel}>Correct Ans</Text>
              <TextInput
                style={styles.inputSmall}
                value={q.correctAnswer}
                onChangeText={val => setQ({ ...q, correctAnswer: val.toUpperCase() })}
                maxLength={1}
              />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.subLabel}>Marks</Text>
            <TextInput
              style={styles.inputSmall}
              value={String(q.marks)}
              keyboardType="numeric"
              onChangeText={val => setQ({ ...q, marks: Number(val) })}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.actionBtn} onPress={handleAddOrUpdate}>
          <Text style={styles.actionBtnText}>{editingId !== null ? "UPDATE IN LIST" : "ADD TO LIST"}</Text>
        </TouchableOpacity>
      </View>

      {/* Question Bank List */}
      <View style={styles.listSection}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Question Bank ({list.length})</Text>
          {list.length > 0 && (
            <TouchableOpacity style={styles.finalSaveBtn} onPress={handleFinalSave}>
              <Text style={styles.finalSaveText}>FINAL SAVE</Text>
            </TouchableOpacity>
          )}
        </View>

        {list.map((item, i) => (
          <View key={i} style={styles.qCard}>
            <View style={styles.qCardHeader}>
              <Text style={styles.qBadge}>{item.type.toUpperCase()} | {item.marks}M</Text>
              <View style={styles.qActions}>
                <TouchableOpacity onPress={() => { setEditingId(i); setQ(item); }}>
                  <MaterialIcons name="edit" size={16} color="#0284c7" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setList(list.filter((_, idx) => idx !== i))}>
                  <MaterialIcons name="delete" size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.qText}>{i + 1}. {item.question}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f8fafc', padding: 14 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  headerTitle: { fontSize: 14, fontWeight: '900', color: '#0f172a', flex: 1, marginHorizontal: 8 },
  importBtn: { backgroundColor: '#f59e0b', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  importBtnText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16 },
  sectionLabel: { fontSize: 11, fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: 8 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  typeBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1' },
  typeBtnActive: { backgroundColor: '#0284c7', borderColor: '#0284c7' },
  typeText: { fontSize: 11, fontWeight: '800', color: '#64748b' },
  typeTextActive: { color: '#fff' },
  textArea: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 10, fontSize: 12, fontWeight: '600', color: '#0f172a', height: 80, textAlignVertical: 'top', marginBottom: 10 },
  mcqGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  mcqInput: { width: '48%', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, height: 38, paddingHorizontal: 8, fontSize: 11, fontWeight: '700' },
  rowInputs: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  subLabel: { fontSize: 9, fontWeight: '800', color: '#64748b', marginBottom: 2, textTransform: 'uppercase' },
  inputSmall: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, height: 38, textAlign: 'center', fontWeight: '800' },
  actionBtn: { backgroundColor: '#0284c7', height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  actionBtnText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  listSection: { gap: 8 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  listTitle: { fontSize: 13, fontWeight: '900', color: '#0f172a' },
  finalSaveBtn: { backgroundColor: '#0f172a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  finalSaveText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  qCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  qCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  qBadge: { fontSize: 9, fontWeight: '900', color: '#0284c7', backgroundColor: '#e0f2fe', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  qActions: { flexDirection: 'row', gap: 10 },
  qText: { fontSize: 12, fontWeight: '800', color: '#0f172a' }
});