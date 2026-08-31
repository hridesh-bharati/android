// src/dashboard/admin/practice/AdminPracticeQuestionsManage.js
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { db } from "../../../services/firebase";
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, writeBatch, updateDoc, increment } from "firebase/firestore";

export default function AdminPracticeQuestionsManage({ route }) {
  const { testId } = route.params;
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);
  const [qList, setQList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadQ = async () => {
    if (!testId) return;
    const q = query(collection(db, "practiceQuestions"), where("testId", "==", testId));
    const snap = await getDocs(q);
    setQList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { loadQ(); }, [testId]);

  const saveQ = async () => {
    if (!question || options.some(o => !o)) {
      return Alert.alert("Error", "Fill all fields");
    }
    try {
      if (editingId) {
        await updateDoc(doc(db, "practiceQuestions", editingId), {
          question, options, correct: Number(correct)
        });
        Alert.alert("Success", "Question updated");
      } else {
        await addDoc(collection(db, "practiceQuestions"), {
          testId, question, options, correct: Number(correct)
        });
        await updateDoc(doc(db, "practiceTests", testId), { totalQuestions: increment(1) });
        Alert.alert("Success", "Question added");
      }
      setQuestion(""); setOptions(["", "", "", ""]); setCorrect(0); setEditingId(null); loadQ();
    } catch { 
      Alert.alert("Error", "Operation failed"); 
    }
  };

  const deleteQuestion = async (qId) => {
    Alert.alert("Delete Question", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          await deleteDoc(doc(db, "practiceQuestions", qId));
          await updateDoc(doc(db, "practiceTests", testId), { totalQuestions: increment(-1) });
          loadQ();
        } 
      }
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#0284c7" /></View>;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.headerTitle}>Manage Questions ({qList.length})</Text>

      <View style={[styles.formCard, editingId && { borderColor: '#f59e0b' }]}>
        <TextInput 
          style={styles.textArea} 
          placeholder="Type question here..." 
          placeholderTextColor="#94a3b8"
          multiline 
          numberOfLines={3}
          value={question} 
          onChangeText={setQuestion} 
        />

        {options.map((o, i) => (
          <View key={i} style={styles.optionInputRow}>
            <View style={styles.optLetterBox}><Text style={styles.optLetter}>{String.fromCharCode(65 + i)}</Text></View>
            <TextInput 
              style={styles.optionInput} 
              placeholder={`Option ${String.fromCharCode(65 + i)}`}
              placeholderTextColor="#94a3b8"
              value={o}
              onChangeText={(val) => {
                const newO = [...options]; newO[i] = val; setOptions(newO);
              }}
            />
          </View>
        ))}

        <Text style={styles.label}>Correct Option Index (0 = A, 1 = B, etc.):</Text>
        <TextInput 
          style={styles.input} 
          keyboardType="numeric"
          value={correct.toString()} 
          onChangeText={(val) => setCorrect(Number(val))} 
        />

        <TouchableOpacity style={[styles.primaryBtn, editingId && { backgroundColor: '#f59e0b' }]} onPress={saveQ}>
          <Text style={styles.primaryBtnText}>{editingId ? "Update Question" : "Save Question"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {qList.map((q, i) => (
          <View key={q.id} style={styles.qCard}>
            <View style={styles.qTopRow}>
              <Text style={styles.qNum}>Q{i + 1}.</Text>
              <Text style={styles.qTitle} numberOfLines={2}>{q.question}</Text>
              <TouchableOpacity onPress={() => deleteQuestion(q.id)}>
                <MaterialIcons name="delete" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f8fafc', padding: 14 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 14, fontWeight: '900', color: '#0f172a', marginBottom: 12, textTransform: 'uppercase' },
  formCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16, gap: 8 },
  textArea: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 10, fontSize: 12, fontWeight: '700', color: '#0f172a', textAlignVertical: 'top' },
  optionInputRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  optLetterBox: { width: 32, height: 38, backgroundColor: '#f1f5f9', borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e1' },
  optLetter: { fontSize: 12, fontWeight: '900', color: '#0284c7' },
  optionInput: { flex: 1, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 10, height: 38, fontSize: 12, fontWeight: '700', color: '#0f172a' },
  label: { fontSize: 10, fontWeight: '800', color: '#64748b', marginTop: 4 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 10, height: 38, fontSize: 12, fontWeight: '700', color: '#0f172a' },
  primaryBtn: { backgroundColor: '#0284c7', height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 6 },
  primaryBtnText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  list: { gap: 8 },
  qCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  qTopRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  qNum: { fontSize: 12, fontWeight: '900', color: '#0284c7' },
  qTitle: { fontSize: 12, fontWeight: '800', color: '#0f172a', flex: 1 }
});