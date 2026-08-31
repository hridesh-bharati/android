// src/dashboard/admin/examManagement/admin/pages/AdminCreateExam.js
import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useExam } from "../../context/ExamProvider";

const COLORS = {
  primary: '#071e3d',
  secondary: '#0284c7',
  danger: '#dc3545',
  white: '#ffffff',
  glassBg: 'rgba(255, 255, 255, 0.78)',
  border: 'rgba(255, 255, 255, 0.6)',
  gray: '#64748b',
  dark: '#0f172a'
};

export default function AdminCreateExam({ navigation }) {
  const { courses, createExam } = useExam();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    course: "",
    date: "",
    startTime: "",
    duration: "1",
    totalMarks: "100",
    passingMarks: "33"
  });

  const calculateEndTime = (start, durationHrs) => {
    if (!start) return "";
    const [hours, minutes] = start.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0);
    date.setMinutes(date.getMinutes() + (durationHrs * 60));
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.course || !formData.date || !formData.startTime) {
      alert("Please fill all required fields!");
      return;
    }

    setLoading(true);
    const endTime = calculateEndTime(formData.startTime, parseFloat(formData.duration));

    const examId = await createExam({
      ...formData,
      endTime,
      duration: parseFloat(formData.duration),
      totalMarks: Number(formData.totalMarks),
      passingMarks: Number(formData.passingMarks),
      totalQuestions: 0,
      status: "Draft"
    });

    setLoading(false);
    if (examId) {
      navigation.replace("AdminAddQuestions", { examId });
    }
  };

  return (
    <View style={styles.container}>
      {/* 🌊 Liquid / Water Ambient Glass Effect Blobs */}
      <View style={styles.waterBlobTop} />
      <View style={styles.waterBlobBottom} />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={20} color={COLORS.dark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create New Paper</Text>
        </View>

        {/* Glassmorphic Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.label}>Exam Title *</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ex: Final ADCA Exam" 
            placeholderTextColor="#94a3b8"
            onChangeText={(val) => setFormData({ ...formData, title: val })} 
          />

          <Text style={styles.label}>Select Course *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.courseScroll}>
            {courses?.map(c => (
              <TouchableOpacity 
                key={c} 
                style={[styles.courseChip, formData.course === c && styles.courseChipActive]}
                onPress={() => setFormData({ ...formData, course: c })}
                activeOpacity={0.8}
              >
                <Text style={[styles.courseChipText, formData.course === c && styles.courseChipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Date *</Text>
          <TextInput 
            style={styles.input} 
            placeholder="YYYY-MM-DD" 
            placeholderTextColor="#94a3b8"
            onChangeText={(val) => setFormData({ ...formData, date: val })} 
          />

          <Text style={styles.label}>Start Time *</Text>
          <TextInput 
            style={styles.input} 
            placeholder="HH:MM (24 hr format)" 
            placeholderTextColor="#94a3b8"
            onChangeText={(val) => setFormData({ ...formData, startTime: val })} 
          />

          <Text style={styles.label}>Duration (Hrs)</Text>
          <TextInput 
            style={styles.input} 
            defaultValue="1" 
            keyboardType="numeric"
            placeholderTextColor="#94a3b8"
            onChangeText={(val) => setFormData({ ...formData, duration: val })} 
          />

          <Text style={styles.label}>Passing Marks</Text>
          <TextInput 
            style={styles.input} 
            defaultValue="33" 
            keyboardType="numeric"
            placeholderTextColor="#94a3b8"
            onChangeText={(val) => setFormData({ ...formData, passingMarks: val })} 
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>NEXT: ADD QUESTIONS</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f6ff', position: 'relative' },
  
  // 🌊 Water / Fluid Flow Effect Blobs
  waterBlobTop: {
    position: 'absolute', top: -40, left: -40, width: 250, height: 250,
    borderRadius: 125, backgroundColor: '#38bdf8', opacity: 0.16, transform: [{ scale: 1.4 }]
  },
  waterBlobBottom: {
    position: 'absolute', bottom: -40, right: -40, width: 260, height: 260,
    borderRadius: 130, backgroundColor: '#34d399', opacity: 0.14
  },

  scrollContainer: { flexGrow: 1, padding: 14, paddingBottom: 40 },
  
  headerBar: { 
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14, 
    backgroundColor: COLORS.glassBg, padding: 12, borderRadius: 14, 
    borderWidth: 1, borderColor: COLORS.border, elevation: 2 
  },
  backBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  headerTitle: { fontSize: 15, fontWeight: '900', color: COLORS.dark },
  
  formCard: { 
    backgroundColor: COLORS.glassBg, borderRadius: 18, padding: 16, 
    borderWidth: 1, borderColor: COLORS.border, elevation: 4, 
    shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 12 
  },
  label: { fontSize: 10, fontWeight: '800', color: COLORS.gray, textTransform: 'uppercase', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: 'rgba(248, 250, 252, 0.9)', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 12, height: 45, fontSize: 13, fontWeight: '700', color: COLORS.dark },
  
  courseScroll: { flexDirection: 'row', marginBottom: 4 },
  courseChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(241, 245, 249, 0.9)', marginRight: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  courseChipActive: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
  courseChipText: { fontSize: 11, fontWeight: '800', color: '#475569' },
  courseChipTextActive: { color: '#fff' },
  
  submitBtn: { height: 48, backgroundColor: COLORS.secondary, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 24, elevation: 3, shadowColor: COLORS.secondary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  submitBtnText: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 0.5 }
});