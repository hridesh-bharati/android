// src/dashboard/admin/studentManagement/StudentCard.js
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity, TextInput, ActivityIndicator, Modal, Dimensions } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../services/firebase";

const STATUS_COLORS = { accepted: "#10b981", canceled: "#ef4444", pending: "#f59e0b", done: "#3b82f6" };
const BRANCH_DISPLAY = { DIIT124: "Main Branch", DIIT125: "East Branch" };
const { width, height } = Dimensions.get("window");

export const getActualStatus = (s) => {
  if (s.status === "canceled") return "canceled";
  return s.regNo && s.issueDate ? "done" : s.regNo ? "accepted" : "pending";
};

// ======================= CUSTOM CONFIRM BOX =======================
const CustomConfirmBox = ({ visible, onClose, onConfirm, title, message, loading = false }) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.confirmOverlay}>
        <View style={styles.confirmModal}>
          {/* Icon */}
          <View style={styles.confirmIconContainer}>
            <MaterialIcons name="warning" size={40} color="#ef4444" />
          </View>
          
          {/* Title */}
          <Text style={styles.confirmTitle}>{title || "Confirm Delete"}</Text>
          
          {/* Message */}
          <Text style={styles.confirmMessage}>{message || "Are you sure you want to delete this student?"}</Text>
          
          {/* Buttons */}
          <View style={styles.confirmButtonRow}>
            <TouchableOpacity 
              style={[styles.confirmBtn, styles.confirmBtnCancel]} 
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.confirmBtnTextCancel}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.confirmBtn, styles.confirmBtnDanger]} 
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.confirmBtnTextDanger}>Delete</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
// ================================================================

const StudentCard = React.memo(({ student, onSave, onDelete, navigation }) => {
  const [regNumber, setRegNumber] = useState("");
  const [percent, setPercent] = useState("");
  const [issDate, setIssDate] = useState("");
  const [admissionDate, setAdmissionDate] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [editingRegNo, setEditingRegNo] = useState(false);
  const [showRegInput, setShowRegInput] = useState(false);
  const [isEditingFinal, setIsEditingFinal] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  
  // ===== DELETE CONFIRM BOX STATE =====
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const status = useMemo(() => getActualStatus(student), [student]);

  const isPending = status === "pending";
  const isAccepted = status === "accepted";
  const isDone = status === "done";

  const studentBranch = student.branch || student.centerCode;
  const studentCourse = student.course || "General";
  const isValidDigit = /^\d{1,8}$/.test(regNumber.trim());

  const avatarUrl = useMemo(() => student.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || "Student")}&background=random&length=2`, [student.photoUrl, student.name]);

  useEffect(() => {
    setPercent(student.percentage ? String(student.percentage) : "");
    setIssDate(student.issueDate || new Date().toISOString().split('T')[0]);
    setAdmissionDate(student.admissionDate || student.appliedDate?.split('T')[0] || "");
    setRegNumber(student.regNo ? student.regNo.split("/").pop() : "");
    setEditingRegNo(false);
    setShowRegInput(false);
    setIsEditingFinal(false);
  }, [student]);

  const checkDuplicateRegNo = useCallback(async (branch, regNum) => {
    if (!branch || !regNum) return false;
    try {
      const q = query(collection(db, "admissions"), where("regShort", "==", Number(regNum)), where("branch", "==", branch));
      const snapshot = await getDocs(q);
      return snapshot.docs.some(d => d.id !== student.id);
    } catch { return false; }
  }, [student.id]);

  useEffect(() => {
    const check = async () => {
      if (!studentBranch || !regNumber.trim() || !isValidDigit) { setIsDuplicate(false); return; }
      setIsDuplicate(await checkDuplicateRegNo(studentBranch, regNumber.trim()));
    };
    const timer = setTimeout(check, 300);
    return () => clearTimeout(timer);
  }, [regNumber, studentBranch, isValidDigit, checkDuplicateRegNo]);

  const handleStatusChange = useCallback(async (newStatus) => {
    setLoading(true);
    try {
      await onSave(student.id, { status: newStatus });
      setShowRejectConfirm(false);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  }, [onSave, student.id]);

  const handleGenerateRegNo = useCallback(async () => {
    if (!isValidDigit || isDuplicate) return;
    setLoading(true);
    try {
      const cleanRegNum = regNumber.trim();
      const courseCode = studentCourse.toString().replace(/\s+/g, "").toUpperCase().slice(0, 10);
      const newRegNo = `${studentBranch}/${courseCode}/${cleanRegNum}`;

      await onSave(student.id, {
        branch: studentBranch, regNo: newRegNo, regShort: Number(cleanRegNum), status: "accepted"
      });

      setShowRegInput(false);
      setEditingRegNo(false);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  }, [isValidDigit, isDuplicate, regNumber, studentCourse, studentBranch, onSave, student.id]);

  const handleMarkDone = useCallback(async () => {
    if (!percent || !admissionDate || !issDate) {
      // Using custom alert or just return
      return;
    }
    setLoading(true);
    try {
      await onSave(student.id, {
        status: "done", 
        percentage: Number(percent), 
        admissionDate, 
        issueDate: issDate
      });
      setIsEditingFinal(false);
    } catch (err) {
      console.error(err);
    } finally { 
      setLoading(false); 
    }
  }, [student.id, percent, admissionDate, issDate, onSave]);

  // ===== HANDLE DELETE =====
  const handleDeletePress = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await onDelete(student.id);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      {/* CUSTOM CONFIRM BOX */}
      <CustomConfirmBox
        visible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Student"
        message={`Are you sure you want to delete "${student.name || student.fullName}"? This action cannot be undone.`}
        loading={deleteLoading}
      />

      <View style={[styles.statusBar, { backgroundColor: STATUS_COLORS[status] || "#6366f1" }]} />
      <View style={styles.cardBody}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation?.navigate("StudentProfile", { email: student.email })}>
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.studentName} numberOfLines={1}>{student.name || student.fullName}</Text>
            <Text style={styles.studentCourse} numberOfLines={1}>{studentCourse}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: `${STATUS_COLORS[status]}15`, borderColor: `${STATUS_COLORS[status]}30` }]}>
            <Text style={[styles.badgeText, { color: STATUS_COLORS[status] }]}>{status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <MaterialIcons name="location-on" size={12} color="#64748b" />
            <Text style={styles.metaText}>{BRANCH_DISPLAY[studentBranch] || studentBranch}</Text>
          </View>
          {student.regNo ? (
            <View style={styles.metaChip}>
              <Text style={styles.metaTextBold}>{student.regNo}</Text>
              {!isDone && (
                <TouchableOpacity onPress={() => setEditingRegNo(true)} style={{ marginLeft: 4 }}>
                  <MaterialIcons name="edit" size={12} color="#0284c7" />
                </TouchableOpacity>
              )}
            </View>
          ) : null}
        </View>

        {isPending && !showRegInput && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.btn, styles.btnSuccess]} onPress={() => setShowRegInput(true)}>
              <Text style={styles.btnTextWhite}>APPROVE</Text>
            </TouchableOpacity>
            {!showRejectConfirm ? (
              <TouchableOpacity style={[styles.btn, styles.btnOutlineDanger]} onPress={() => setShowRejectConfirm(true)}>
                <Text style={styles.btnTextDanger}>REJECT</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.confirmBox}>
                <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={() => handleStatusChange("canceled")}>
                  <Text style={styles.btnTextWhite}>CONFIRM?</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnIcon} onPress={() => setShowRejectConfirm(false)}>
                  <MaterialIcons name="close" size={16} color="#475569" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {((isPending && showRegInput) || (isAccepted && (!student.regNo || editingRegNo))) && (
          <View style={styles.subFormBox}>
            <View style={styles.subFormHeader}>
              <Text style={styles.subFormTitle}>Assign Registration No</Text>
              <TouchableOpacity onPress={() => { setEditingRegNo(false); setShowRegInput(false); }}>
                <MaterialIcons name="close" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>
            <TextInput 
              style={[styles.inputField, isDuplicate && { borderColor: '#ef4444' }]} 
              value={regNumber} 
              placeholder="1-8 digits" 
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              maxLength={8}
              onChangeText={e => setRegNumber(e.replace(/[^0-9]/g, ""))} 
            />
            {isDuplicate && <Text style={styles.errorText}>Already Taken!</Text>}
            <TouchableOpacity 
              style={[styles.btn, styles.btnSuccess, { marginTop: 6 }, (!isValidDigit || isDuplicate) && { opacity: 0.6 }]} 
              onPress={handleGenerateRegNo} 
              disabled={loading || !isValidDigit || isDuplicate}
            >
              {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.btnTextWhite}>CONFIRM</Text>}
            </TouchableOpacity>
          </View>
        )}

        {((isAccepted && student.regNo && !editingRegNo && !showRegInput) || (isDone && isEditingFinal)) && (
          <View style={styles.subFormBox}>
            <View style={styles.subFormHeader}>
              <Text style={styles.subFormTitle}>Course Progress</Text>
              <TouchableOpacity style={styles.smallDoneBtn} onPress={handleMarkDone} disabled={loading}>
                {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.btnTextWhite}>Done</Text>}
              </TouchableOpacity>
            </View>
            <TextInput 
              style={[styles.inputField, { marginBottom: 6 }]} 
              placeholder="Percentage (%)" 
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={percent} 
              onChangeText={setPercent} 
            />
            <View style={styles.dateRow}>
              <TextInput style={[styles.inputField, { flex: 1, marginRight: 4 }]} placeholder="Admission Date" placeholderTextColor="#94a3b8" value={admissionDate} onChangeText={setAdmissionDate} />
              <TextInput style={[styles.inputField, { flex: 1, marginLeft: 4 }]} placeholder="Issue Date" placeholderTextColor="#94a3b8" value={issDate} onChangeText={setIssDate} />
            </View>
          </View>
        )}

        {isDone && !isEditingFinal && (
          <View style={styles.passedBox}>
            <View style={styles.passedHeader}>
              <Text style={styles.passedTitle}>PASSED</Text>
              <TouchableOpacity onPress={() => setIsEditingFinal(true)}>
                <MaterialIcons name="edit" size={14} color="#0284c7" />
              </TouchableOpacity>
            </View>
            <Text style={styles.passedSub}>Score: {student.percentage}% | Issued: {student.issueDate}</Text>
          </View>
        )}

        <View style={styles.footerRow}>
          <TouchableOpacity onPress={handleDeletePress} style={styles.deleteBtn}>
            <MaterialIcons name="delete" size={14} color="#ef4444" />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

export default StudentCard;

const styles = StyleSheet.create({
  card: { backgroundColor: "#ffffff", borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", marginVertical: 6, overflow: 'hidden', elevation: 2 },
  statusBar: { height: 4, width: '100%' },
  cardBody: { padding: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#e2e8f0' },
  headerInfo: { flex: 1 },
  studentName: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  studentCourse: { fontSize: 11, color: '#64748b', marginTop: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  badgeText: { fontSize: 9, fontWeight: '800' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  metaChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0', gap: 4 },
  metaText: { fontSize: 10, color: '#475569' },
  metaTextBold: { fontSize: 10, fontWeight: '700', color: '#0f172a' },
  actionRow: { flexDirection: 'row', gap: 6, marginTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 8 },
  btn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, justifyContent: 'center', alignItems: 'center', flex: 1 },
  btnSuccess: { backgroundColor: '#10b981' },
  btnOutlineDanger: { borderWidth: 1, borderColor: '#ef4444', backgroundColor: 'transparent' },
  btnDanger: { backgroundColor: '#ef4444' },
  btnTextWhite: { color: '#ffffff', fontSize: 11, fontWeight: '700' },
  btnTextDanger: { color: '#ef4444', fontSize: 11, fontWeight: '700' },
  confirmBox: { flexDirection: 'row', flex: 1, gap: 4 },
  btnIcon: { padding: 6, backgroundColor: '#f1f5f9', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  subFormBox: { backgroundColor: '#f8fafc', padding: 8, borderRadius: 8, marginTop: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  subFormHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  subFormTitle: { fontSize: 11, fontWeight: '700', color: '#10b981' },
  inputField: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, paddingHorizontal: 8, height: 32, fontSize: 11, color: '#0f172a' },
  errorText: { color: '#ef4444', fontSize: 10, fontWeight: '700', marginTop: 2 },
  dateRow: { flexDirection: 'row', marginTop: 4 },
  smallDoneBtn: { backgroundColor: '#10b981', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  passedBox: { backgroundColor: '#e7f3ff', padding: 8, borderRadius: 8, marginTop: 8, borderWidth: 1, borderColor: '#bae6fd' },
  passedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  passedTitle: { fontSize: 11, fontWeight: '800', color: '#0284c7' },
  passedSub: { fontSize: 10, color: '#334155', marginTop: 2 },
  footerRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 6 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  deleteText: { fontSize: 11, color: '#ef4444', fontWeight: '600' },

  // ===== CUSTOM CONFIRM BOX STYLES =====
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: width * 0.85,
    maxWidth: 340,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  confirmIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  confirmMessage: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  confirmButtonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnCancel: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  confirmBtnDanger: {
    backgroundColor: '#ef4444',
  },
  confirmBtnTextCancel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  confirmBtnTextDanger: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});