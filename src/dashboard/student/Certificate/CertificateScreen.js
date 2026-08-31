// src/dashboard/student/certificate/CertificateScreen.js
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { auth, db } from "../../../services/firebase";
import { doc, onSnapshot, collection, query, where, orderBy } from "firebase/firestore";  
import { getFeeLogic } from "../../admin/studentManagement/fees/FeeServices"; 
import StudentCertificate from "./StudentCertificate";

export default function CertificateScreen({ route, navigation }) {
  const [student, setStudent] = useState(null);
  const [payments, setPayments] = useState([]);
  const [hasCompletedExam, setHasCompletedExam] = useState(false);  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribeSnap = null;
    let unsubscribePay = null;
    let unsubscribeExam = null;  

    const user = auth.currentUser;
    if (!user?.email) {
      setError("User session not found. Please login again.");
      setLoading(false);
      return;
    }

    const emailId = user.email.toLowerCase().trim();
    
    // 1. Student Admission Data (Real-time)
    const docRef = doc(db, "admissions", emailId);
    unsubscribeSnap = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setStudent({ id: snap.id, ...snap.data() });
        setError(null);
      } else {
        setError("No admission record found.");
      }
    });

    // 2. Payments Data (Fee check)
    const payQ = query(collection(db, "admissions", emailId, "payments"), orderBy("date", "desc"));
    unsubscribePay = onSnapshot(payQ, (pSnap) => {
      const payList = pSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPayments(payList);
    });

    // 3. Exam Record Check
    const examQ = query(
      collection(db, "studentExams"), 
      where("studentId", "==", emailId), 
      where("status", "==", "Completed")
    );

    unsubscribeExam = onSnapshot(examQ, (eSnap) => {
      setHasCompletedExam(!eSnap.empty);
      setLoading(false);
    }, (err) => {
      console.error("Exam Check Error:", err);
      setLoading(false);
    });

    return () => {
      if (unsubscribeSnap) unsubscribeSnap();
      if (unsubscribePay) unsubscribePay();
      if (unsubscribeExam) unsubscribeExam();
    };
  }, []);

  const summary = getFeeLogic(student?.course, payments) || { balance: 0 };
  const isFeeDue = summary.balance > 0;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0284c7" />
        <Text style={styles.loadingText}>Verifying Academic Records...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!student) return null;

  // Condition 1: Admin Block Check
  if (student.certificateDisabled) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <MaterialIcons name="security" size={50} color="#ef4444" style={styles.mb} />
          <Text style={styles.title}>Access Restricted</Text>
          <Text style={styles.subtitle}>Your certificate access has been temporarily disabled by the administrator.</Text>
        </View>
      </View>
    );
  }

  // Condition 2: Fee Due Check
  if (isFeeDue) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.iconCircleBg}>
            <MaterialIcons name="account-balance-wallet" size={36} color="#ef4444" />
          </View>
          <Text style={[styles.title, { color: '#ef4444' }]}>Payment Pending!</Text>
          <Text style={styles.subtitle}>Please clear your pending fee of ₹{summary.balance} to unlock your certificate.</Text>
          <Text style={styles.smallNote}>Contact Drishtee Computer Center office for more info.</Text>
        </View>
      </View>
    );
  }

  // Condition 3: Exam Record Presence Check
  if (!hasCompletedExam && student.status !== "done") {
    return (
      <View style={styles.container}>
        <View style={[styles.card, styles.warningBorder]}>
          <MaterialIcons name="assignment-late" size={45} color="#f59e0b" style={styles.mb} />
          <Text style={styles.title}>No Exam Record</Text>
          <Text style={styles.subtitle}>We couldn't find a completed exam record for your profile.</Text>
          <Text style={styles.dangerNote}>Note: Certificate is only available after passing the online examination.</Text>
        </View>
      </View>
    );
  }

  // Condition 4: Normal Issuance Check (Percentage & Date) -> Renders Real Certificate Component
  const isIssued = (student.percentage || student.percentage === 0) && student.issueDate;
  const progress = (student.percentage ? 50 : 0) + (student.issueDate ? 50 : 0);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      {isIssued ? (
        <StudentCertificate student={student} navigation={navigation} route={route} />
      ) : (
        <View style={styles.card}>
          <MaterialIcons name="hourglass-top" size={40} color="#0284c7" style={styles.mb} />
          <Text style={styles.title}>Generation in Progress</Text>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.subtitle}>Your data is verified. Please wait for the final approval and issue date from the administrator.</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Verification Stage: {progress}% Completed</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: '#f8fafc' },
  scrollContainer: { flexGrow: 1, padding: 16, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  loadingText: { marginTop: 10, fontSize: 12, fontWeight: '700', color: '#64748b' },
  errorText: { fontSize: 13, fontWeight: '800', color: '#ef4444' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', elevation: 2, width: '100%' },
  warningBorder: { borderLeftWidth: 4, borderLeftColor: '#f59e0b' },
  iconCircleBg: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fef2f2', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  mb: { marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '900', color: '#0f172a', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 12, color: '#64748b', textAlign: 'center', fontWeight: '600', lineHeight: 18, marginBottom: 10 },
  smallNote: { fontSize: 11, color: '#64748b', textAlign: 'center', fontWeight: '700', marginTop: 4 },
  dangerNote: { fontSize: 11, color: '#ef4444', fontWeight: '800', textAlign: 'center', marginTop: 4 },
  progressBarTrack: { width: '100%', height: 10, backgroundColor: '#f1f5f9', borderRadius: 5, overflow: 'hidden', marginVertical: 12 },
  progressBarFill: { height: '100%', backgroundColor: '#0284c7', borderRadius: 5 },
  badge: { backgroundColor: '#f8fafc', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', marginTop: 10 },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#334155' }
});