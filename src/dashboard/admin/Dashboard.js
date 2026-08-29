// src/dashboard/admin/Dashboard.js
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function AdminDashboardMain({ activeTab, onNavigate }) {
  const [stats, setStats] = useState({ total: 0, todayEnrolled: 0, activeCount: 0, totalQueries: 0, pendingQueries: 0 });
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sync admissions collection
    const qAdmissions = query(collection(db, "admissions"), orderBy("createdAt", "desc"));

    const unsubscribeAdmissions = onSnapshot(
      qAdmissions,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const total = docs.length;

        const todayStr = new Date().toISOString().split("T")[0];
        const todayEnrolled = docs.filter((item) => {
          const itemDate = item.createdAt?.toDate 
            ? item.createdAt.toDate().toISOString().split("T")[0] 
            : item.admissionDate;
          return itemDate === todayStr;
        }).length;

        const activeCount = docs.filter((item) => !item.certificateDisabled).length;

        setStats((prev) => ({ ...prev, total, todayEnrolled, activeCount }));
        setRecentStudents(docs.slice(0, 6));
        setLoading(false);
      },
      (error) => {
        console.error("Admissions Real-time Sync Error:", error);
        setLoading(false);
      }
    );

    // Sync studentQueries collection for live inquiry stats
    const qQueries = query(collection(db, "studentQueries"));

    const unsubscribeQueries = onSnapshot(
      qQueries,
      (snapshot) => {
        const queryDocs = snapshot.docs.map((doc) => doc.data());
        const totalQueries = queryDocs.length;
        const pendingQueries = queryDocs.filter((item) => item.status !== "reviewed").length;

        setStats((prev) => ({ ...prev, totalQueries, pendingQueries }));
      },
      (error) => {
        console.error("Queries Real-time Sync Error:", error);
      }
    );

    return () => {
      unsubscribeAdmissions();
      unsubscribeQueries();
    };
  }, []);

  const handleStudentPress = (student) => {
    if (onNavigate && student.email) {
      onNavigate('StudentProfile', { email: student.email });
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      {/* Background Glowing Ambient Orbs */}
      <View style={styles.bgGlowOrbTopLeft} />
      <View style={styles.bgGlowOrbBottomRight} />
      <View style={styles.bgGlowOrbCenter} />

      {/* Modern Clean Header Card with Glassmorphism */}
      <View style={styles.welcomeBanner}>
        <View style={styles.bannerHeaderTop}>
          <View style={styles.bannerBadge}>
            <MaterialCommunityIcons name="shield-check" size={12} color="#0284c7" />
            <Text style={styles.bannerBadgeText}>Drishtee Console</Text>
          </View>
          <View style={styles.liveBadgeRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>ONLINE</Text>
          </View>
        </View>
        <Text style={styles.bannerTitle}>Welcome back, Hridesh 👋</Text>
        <Text style={styles.bannerSubtitle}>
          Real-time center analytics and active database monitoring for Drishtee Computer Centre systems.
        </Text>
      </View>

      {/* 2x2 Proper Grid Layout with increased height */}
      <View style={styles.metricsGrid}>
        <View style={[styles.metricCard, { borderTopColor: '#7c3aed' }]}>
          <View style={[styles.metricIconWrap, { backgroundColor: '#f3e8ff' }]}>
            <MaterialCommunityIcons name="account-group" size={22} color="#7c3aed" />
          </View>
          <View style={styles.metricContent}>
            <Text style={styles.metricNumber} numberOfLines={1}>{stats.total}</Text>
            <Text style={styles.metricLabel} numberOfLines={1}>Total Students</Text>
          </View>
        </View>

        <View style={[styles.metricCard, { borderTopColor: '#0284c7' }]}>
          <View style={[styles.metricIconWrap, { backgroundColor: '#e0f2fe' }]}>
            <MaterialCommunityIcons name="lightning-bolt" size={22} color="#0284c7" />
          </View>
          <View style={styles.metricContent}>
            <Text style={styles.metricNumber} numberOfLines={1}>{stats.todayEnrolled}</Text>
            <Text style={styles.metricLabel} numberOfLines={1}>New Today</Text>
          </View>
        </View>

        <View style={[styles.metricCard, { borderTopColor: '#10b981' }]}>
          <View style={[styles.metricIconWrap, { backgroundColor: '#dcfce7' }]}>
            <MaterialCommunityIcons name="certificate" size={22} color="#10b981" />
          </View>
          <View style={styles.metricContent}>
            <Text style={styles.metricNumber} numberOfLines={1}>{stats.activeCount}</Text>
            <Text style={styles.metricLabel} numberOfLines={1}>Active Portals</Text>
          </View>
        </View>

        <View style={[styles.metricCard, { borderTopColor: '#f59e0b' }]}>
          <View style={[styles.metricIconWrap, { backgroundColor: '#fef3c7' }]}>
            <MaterialCommunityIcons name="forum-outline" size={22} color="#f59e0b" />
          </View>
          <View style={styles.metricContent}>
            <Text style={styles.metricNumber} numberOfLines={1}>{stats.pendingQueries}</Text>
            <Text style={styles.metricLabel} numberOfLines={1}>Pending Enquiries</Text>
          </View>
        </View>
      </View>
      
      {/* Modern Recent Registrations List */}
      <View style={styles.recentSection}>
        <View style={styles.recentHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Registrations</Text>
          <Text style={styles.seeAllText}>Live Feed</Text>
        </View>

        {loading ? (
          <View style={styles.emptyBox}>
            <ActivityIndicator size="small" color="#0284c7" />
            <Text style={styles.emptyText}>Syncing records...</Text>
          </View>
        ) : recentStudents.length > 0 ? (
          recentStudents.map((student, index) => {
            const studentName = student.name || student.fullName || 'Unnamed Student';
            const studentPhoto = student.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=random&length=2`;

            return (
              <View key={student.id || index} style={styles.studentRow}>
                <TouchableOpacity onPress={() => handleStudentPress(student)} activeOpacity={0.8}>
                  <Image source={{ uri: studentPhoto }} style={styles.studentAvatarImg} />
                </TouchableOpacity>

                <TouchableOpacity style={{ flex: 1, marginLeft: 12 }} activeOpacity={0.8} onPress={() => handleStudentPress(student)}>
                  <Text style={styles.studentName} numberOfLines={1}>{studentName}</Text>
                  <Text style={styles.studentCourse} numberOfLines={1}>
                    {student.course || 'Course Not Assigned'} • <Text style={{ color: '#0284c7' }}>{student.branch || 'Main'}</Text>
                  </Text>
                </TouchableOpacity>

                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>{student.status || 'Active'}</Text>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons name="database-off" size={24} color="#94a3b8" />
            <Text style={styles.emptyText}>No admission records found in Firestore.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0F6FF',
    flex: 1,
    position: 'relative',
  },
  // Background Glowing Orbs
  bgGlowOrbTopLeft: {
    position: "absolute",
    top: -60,
    left: -40,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#38BDF8",
    opacity: 0.3,
  },
  bgGlowOrbBottomRight: {
    position: "absolute",
    bottom: 40,
    right: -40,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#34D399",
    opacity: 0.25,
  },
  bgGlowOrbCenter: {
    position: "absolute",
    top: "40%",
    left: "20%",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#C084FC",
    opacity: 0.2,
  },
  welcomeBanner: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 8,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  bannerHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bannerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bannerBadgeText: {
    color: '#0284c7',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  liveBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  liveBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: 0.2,
  },
  bannerSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 16,
    fontWeight: '500',
  },
  // 2x2 Proper Grid Layout with increased card height
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    width: '48.5%',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 6,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    marginBottom: 12,
  },
  metricIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  metricContent: {
    flex: 1,
    minWidth: 0,
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  recentSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 8,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
  },
  recentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  seeAllText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284c7',
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  studentAvatarImg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: '#bae6fd',
    backgroundColor: '#f1f5f9',
  },
  studentName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  studentCourse: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
  },
  emptyBox: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 6,
  },
});