// src/dashboard/admin/studentManagement/fees/AddPaymentModal.js
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, Pressable, ActivityIndicator, Alert, ScrollView } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { addPayment, COURSE_CONFIG } from "./FeeServices";

export default function AddPaymentModal({ student, summary, payments = [], onPaymentAdded }) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false); // Category dropdown modal state
  
  const [formData, setFormData] = useState({
    amount: 700,
    method: "Cash",
    dueDate: new Date().toISOString().split("T")[0],
    depositDate: new Date().toISOString().split("T")[0],
    note: "Monthly Fee",
    otherType: "",
  });

  useEffect(() => {
    if (show && summary) {
      const courseKey = student?.course?.toUpperCase() || "";
      const monthly = COURSE_CONFIG[courseKey]?.monthly || 700;

      const baseDate = student?.admissionDate ? new Date(student.admissionDate) : new Date();
      let calculatedDueDate = new Date();
      if (!isNaN(baseDate.getTime())) {
        const monthlyCount = payments.filter(p => p.note === "Monthly Fee").length;
        calculatedDueDate = new Date(baseDate.getTime());
        calculatedDueDate.setMonth(calculatedDueDate.getMonth() + monthlyCount);
      }

      setFormData(prev => ({
        ...prev,
        amount: Math.min(monthly, summary.balance) || monthly,
        note: "Monthly Fee",
        dueDate: calculatedDueDate.toISOString().split("T")[0],
        depositDate: new Date().toISOString().split("T")[0]
      }));
    }
  }, [show, summary, student, payments]);

  const updateForm = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }));

  const handleTypeChange = (type) => {
    const courseKey = student?.course?.toUpperCase() || "";
    let fee = 0;

    if (type === "Admission Fee") fee = COURSE_CONFIG[courseKey]?.adm || 500;
    else if (type === "Monthly Fee") fee = COURSE_CONFIG[courseKey]?.monthly || 700;
    else fee = 100;

    if (type !== "Other Fee" && fee > (summary?.balance || 0)) {
      fee = Math.max(0, summary?.balance || 0);
    }

    setFormData((prev) => ({ ...prev, note: type, amount: fee }));
    setShowCategoryModal(false);
  };

  const handleSubmit = async () => {
    const finalNote = formData.note === "Other Fee" ? (formData.otherType || "Other Fee") : formData.note;

    if (formData.note !== "Other Fee" && Number(formData.amount) > (summary?.balance || 0)) {
      Alert.alert("Invalid Amount", `Amount exceeds course balance (Max: ₹${summary.balance})`);
      return;
    }

    if (Number(formData.amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    try {
      setLoading(true);
      const targetId = student.email || student.id;
      const paymentData = {
        ...formData,
        note: finalNote,
        amount: Number(formData.amount),
        date: formData.depositDate
      };

      await addPayment(targetId, paymentData);
      Alert.alert("Success", "Payment Saved Successfully");
      setShow(false);
      setFormData(prev => ({ ...prev, otherType: "" }));
      if (onPaymentAdded) onPaymentAdded();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Process Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity style={styles.collectBtn} onPress={() => setShow(true)} activeOpacity={0.8}>
        <MaterialIcons name="add" size={16} color="#ffffff" />
        <Text style={styles.collectBtnText}>Collect Fee</Text>
      </TouchableOpacity>

      {/* Main Payment Modal */}
      <Modal transparent={true} visible={show} animationType="fade" onRequestClose={() => setShow(false)}>
        {/* Backdrop par onPress hatakar Keyboard/Touch issues resolve kiye gaye hain */}
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Transaction</Text>
              <TouchableOpacity onPress={() => setShow(false)}>
                <MaterialIcons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Fee Category Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fee Category</Text>
              <TouchableOpacity style={styles.dropdownBox} onPress={() => setShowCategoryModal(true)}>
                <Text style={styles.dropdownText}>{formData.note}</Text>
                <MaterialIcons name="arrow-drop-down" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            {formData.note === "Other Fee" && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Re-exam, File Fee, Late Fine"
                  placeholderTextColor="#94a3b8"
                  value={formData.otherType}
                  onChangeText={(val) => updateForm("otherType", val)}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Amount (₹)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={String(formData.amount)}
                onChangeText={(val) => updateForm("amount", val)}
              />
              <Text style={styles.balanceHint}>Balance Due: ₹{summary?.balance || 0}</Text>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 6 }]}>
                <Text style={styles.label}>Fee Due Date</Text>
                <TextInput
                  style={styles.input}
                  value={formData.dueDate}
                  onChangeText={(val) => updateForm("dueDate", val)}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 6 }]}>
                <Text style={styles.label}>Deposit Date</Text>
                <TextInput
                  style={styles.input}
                  value={formData.depositDate}
                  onChangeText={(val) => updateForm("depositDate", val)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Payment Method</Text>
              <TextInput
                style={styles.input}
                value={formData.method}
                onChangeText={(val) => updateForm("method", val)}
              />
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Confirm Payment</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Category Selection Sub-Modal */}
      <Modal transparent={true} visible={showCategoryModal} animationType="fade" onRequestClose={() => setShowCategoryModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowCategoryModal(false)}>
          <View style={[styles.modalContent, { maxWidth: 300 }]}>
            <Text style={[styles.modalTitle, { marginBottom: 12 }]}>Select Fee Category</Text>
            {["Monthly Fee", "Admission Fee", "Other Fee"].map((cat) => (
              <TouchableOpacity 
                key={cat} 
                style={styles.categoryOption} 
                onPress={() => handleTypeChange(cat)}
              >
                <Text style={styles.categoryOptionText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  collectBtn: { backgroundColor: '#0284c7', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, gap: 4, elevation: 2 },
  collectBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalContent: { width: '100%', maxWidth: 380, backgroundColor: '#ffffff', borderRadius: 24, padding: 20, elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 10, fontWeight: '700', color: '#64748b', marginBottom: 4, textTransform: 'uppercase' },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 12, height: 40, fontSize: 12, color: '#0f172a', fontWeight: '700' },
  dropdownBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 12, height: 40 },
  dropdownText: { fontSize: 12, color: '#0f172a', fontWeight: '700' },
  balanceHint: { fontSize: 10, color: '#64748b', fontWeight: '600', marginTop: 3 },
  row: { flexDirection: 'row' },
  submitBtn: { backgroundColor: '#10b981', borderRadius: 12, height: 44, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 2 },
  submitBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '800' },
  categoryOption: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  categoryOptionText: { fontSize: 14, fontWeight: '700', color: '#334155' }
});