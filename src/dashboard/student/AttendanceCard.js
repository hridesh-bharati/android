// src/dashboard/student/AttendanceCard.js
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { doc, getDoc, collection, getDocs, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../../services/firebase";

export default function AttendanceCard() {
  const [stats, setStats] = useState({ present: 0, absent: 0, half: 0 });
  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const courseDurations = { "ADCA": 450, "DCA": 180, "CCC": 90, "N/A": 365 };

  useEffect(() => {
    const user = auth.currentUser;
    const userEmail = user?.email || "";

    if (!userEmail) {
      setLoading(false);
      return;
    }

    const emailId = userEmail.trim().toLowerCase();
    const studentDocRef = doc(db, "admissions", emailId);

    const unsubscribeProfile = onSnapshot(studentDocRef, async (snap) => {
      if (snap.exists()) {
        const studentData = snap.data();
        const actualStudentId = studentData.id || studentData.regNo;
        const branch = studentData.branch || studentData.centerCode || "DIIT124";
        const course = studentData.course || "N/A";

        setStudentDetails({ id: actualStudentId, branch, course });

        if (!actualStudentId) {
          setLoading(false);
          return;
        }

        try {
          const manualDocRef = doc(db, "manual_attendance_stats", actualStudentId);
          const manualSnap = await getDoc(manualDocRef);

          if (manualSnap.exists()) {
            setStats(manualSnap.data());
          } else {
            const q = query(collection(db, "attendance"), where("branch", "==", branch));
            const attendanceSnap = await getDocs(q);

            let finalStats = { present: 0, absent: 0, half: 0 };
            attendanceSnap.docs.forEach((docSnap) => {
              const day = docSnap.data();
              if (day.records) {
                const studentRecord = day.records.find((r) => r.id === actualStudentId);
                if (studentRecord) {
                  const status = studentRecord.status?.toLowerCase();
                  if (status === "present") finalStats.present++;
                  else if (status === "absent") finalStats.absent++;
                  else if (status === "half") finalStats.half++;
                }
              }
            });
            setStats(finalStats);
          }
        } catch (err) {
          console.error("Error calculating attendance details:", err);
        }
      }
      setLoading(false);
    }, (error) => {
      console.error("Profile snapshot error:", error);
      setLoading(false);
    });

    return () => unsubscribeProfile();
  }, []);

  const currentCourse = studentDetails?.course || "N/A";
  const totalDays = courseDurations[currentCourse] || 450;
  const attendedDays = stats.present + stats.half * 0.5;
  const percentage = Math.min(Math.round((attendedDays / totalDays) * 100), 100);

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="small" color="#0284c7" />
        <Text style={styles.loadingText}>Syncing attendance matrix...</Text>
      </View>
    );
  }

  if (!studentDetails) {
    return (
      <View style={styles.card}>
        <MaterialIcons name="error-outline" size={20} color="#f59e0b" />
        <Text style={styles.loadingText}>Attendance unavailable (Profile Sync Required)</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrapper}>
          <MaterialIcons name="event-available" size={18} color="#0284c7" style={{ marginRight: 6 }} />
          <Text style={styles.titleText}>Attendance Status</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{currentCourse}</Text>
        </View>
      </View>

      <View style={styles.progressBox}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Attendance Score</Text>
          <Text style={[styles.progressVal, { color: percentage >= 75 ? "#10b981" : percentage >= 50 ? "#f59e0b" : "#ef4444" }]}>
            {percentage}%
          </Text>
        </View>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: percentage >= 75 ? "#10b981" : percentage >= 50 ? "#f59e0b" : "#ef4444" }]} />
        </View>
        <Text style={styles.totalDaysText}>Required Course Days: {totalDays} Classes</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statBox, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }]}>
          <Text style={[styles.statNum, { color: '#059669' }]}>{stats.present}</Text>
          <Text style={styles.statLabel}>Present</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#fef3c7', borderColor: '#fde68a' }]}>
          <Text style={[styles.statNum, { color: '#d97706' }]}>{stats.half}</Text>
          <Text style={styles.statLabel}>Half Day</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#fee2e2', borderColor: '#fecaca' }]}>
          <Text style={[styles.statNum, { color: '#dc2626' }]}>{stats.absent}</Text>
          <Text style={styles.statLabel}>Absent</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#ffffff", borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#e2e8f0", elevation: 2 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  titleWrapper: { flexDirection: 'row', alignItems: 'center' },
  titleText: { fontSize: 14, fontWeight: '800', color: '#0f172a' },
  badge: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#334155' },
  loadingText: { fontSize: 11, color: '#64748b', marginTop: 4, textAlign: 'center' },
  progressBox: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  progressLabel: { fontSize: 11, fontWeight: '700', color: '#64748b' },
  progressVal: { fontSize: 15, fontWeight: '900' },
  progressBarTrack: { height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  totalDaysText: { fontSize: 10, color: '#94a3b8', textAlign: 'right', marginTop: 4, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', gap: 8 },
  statBox: { flex: 1, borderRadius: 10, paddingVertical: 8, alignItems: 'center', borderWidth: 1 },
  statNum: { fontSize: 15, fontWeight: '900' },
  statLabel: { fontSize: 9, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginTop: 2 }
});