// src/dashboard/admin/studentManagement/fees/FeePage.js
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { doc, getDoc, collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../../../../services/firebase";
import { getFeeLogic } from "./FeeServices";
import FeeSummaryCard from "./FeeSummaryCard";
import PaymentTable from "./PaymentTable";
import AddPaymentModal from "./AddPaymentModal";
import { goBack } from "../../../../services/NavigationService";

export default function FeePage({ route }) {
  const { email } = route?.params || {};
  const [payments, setPayments] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  if (!email) {
    setLoading(false);
    return;
  }

  const emailId = String(email).toLowerCase().trim();

  let fallbackUnsub = null;

  const fetchStudent = async () => {
    try {
      const sDoc = await getDoc(
        doc(db, "admissions", emailId)
      );

      if (sDoc.exists()) {
        setStudent({
          id: sDoc.id,
          ...sDoc.data(),
        });
      } else {
        setStudent(null);
      }
    } catch (err) {
      console.error(
        "Student Fetch Error:",
        err
      );
    }
  };

  const paymentsRef = collection(
    db,
    "admissions",
    emailId,
    "payments"
  );

  const orderedQuery = query(
    paymentsRef,
    orderBy("createdAt", "desc")
  );

  const unsub = onSnapshot(
    orderedQuery,
    (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setPayments(list);
      setLoading(false);
    },

    (error) => {
      console.warn(
        "Ordered payment query failed:",
        error
      );

      // Fallback without orderBy
      const fallbackQuery = query(
        paymentsRef
      );

      fallbackUnsub = onSnapshot(
        fallbackQuery,
        (fallbackSnap) => {
          const list =
            fallbackSnap.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            }));

          // Latest first
          list.sort((a, b) => {
            const aTime =
              a.createdAt?.seconds || 0;

            const bTime =
              b.createdAt?.seconds || 0;

            return bTime - aTime;
          });

          setPayments(list);
          setLoading(false);
        },

        (fallbackError) => {
          console.error(
            "Payment listener error:",
            fallbackError
          );

          setLoading(false);
        }
      );
    }
  );

  fetchStudent();

  return () => {
    unsub();

    if (fallbackUnsub) {
      fallbackUnsub();
    }
  };

}, [email]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  if (!email) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No student email provided</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const summary = getFeeLogic(student?.course, payments);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => goBack()} style={styles.iconBtn}>
          <MaterialIcons name="arrow-back" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Fee Management</Text>
        <AddPaymentModal student={student} summary={summary} payments={payments} />
      </View>

      {/* Summary Dashboard Card (Already contains student info, so duplicate banner removed) */}
      <FeeSummaryCard student={student} summary={summary} payments={payments} />

      {/* Payment History Table */}
      <PaymentTable payments={payments} student={student} summary={summary} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  topBarTitle: { fontSize: 16, fontWeight: "800", color: "#0f172a" },
  iconBtn: { padding: 6, backgroundColor: "#ffffff", borderRadius: 8, borderWidth: 1, borderColor: "#e2e8f0" },
  errorText: { fontSize: 16, color: "#ef4444", fontWeight: "600" },
  backButton: { marginTop: 16, backgroundColor: "#0284c7", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  backButtonText: { color: "#ffffff", fontWeight: "700" }
});