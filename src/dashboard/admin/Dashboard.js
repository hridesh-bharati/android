// src/dashboard/admin/Dashboard.js
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function AdminDashboardMain({ activeTab, onNavigate }) {
  const [stats, setStats] = useState({ total: 0, todayEnrolled: 0, activeCount: 0 });
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "admissions"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
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

        setStats({ total, todayEnrolled, activeCount });
        setRecentStudents(docs.slice(0, 6));
        setLoading(false);
      },
      (error) => {
        console.error("Dashboard Real-time Sync Error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleStudentPress = (student) => {
    if (onNavigate && student.email) {
      onNavigate('StudentProfile', { email: student.email });
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      {/* Modern Clean Header Card */}
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

      {/* Clean Modern Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={[styles.metricCard, { borderTopColor: '#7c3aed' }]}>
          <View style={[styles.metricIconWrap, { backgroundColor: '#f3e8ff' }]}>
            <MaterialCommunityIcons name="account-group" size={20} color="#7c3aed" />
          </View>
          <View>
            <Text style={styles.metricNumber}>{stats.total}</Text>
            <Text style={styles.metricLabel}>Total Students</Text>
          </View>
        </View>

        <View style={[styles.metricCard, { borderTopColor: '#0284c7' }]}>
          <View style={[styles.metricIconWrap, { backgroundColor: '#e0f2fe' }]}>
            <MaterialCommunityIcons name="lightning-bolt" size={20} color="#0284c7" />
          </View>
          <View>
            <Text style={styles.metricNumber}>{stats.todayEnrolled}</Text>
            <Text style={styles.metricLabel}>New Today</Text>
          </View>
        </View>

        <View style={[styles.metricCard, { borderTopColor: '#10b981' }]}>
          <View style={[styles.metricIconWrap, { backgroundColor: '#dcfce7' }]}>
            <MaterialCommunityIcons name="certificate" size={20} color="#10b981" />
          </View>
          <View>
            <Text style={styles.metricNumber}>{stats.activeCount}</Text>
            <Text style={styles.metricLabel}>Active Portals</Text>
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
    backgroundColor: '#f8fafc',
    flex: 1,
  },
  welcomeBanner: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
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
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
  },
  metricIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 1,
  },
  activeViewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  activeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  activeViewTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  activeViewBody: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
  quickSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  quickActionBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
  },
  quickIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#334155',
    textAlign: 'center',
  },
  recentSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    borderWidth: 1,
    borderColor: '#e2e8f0',
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