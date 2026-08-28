// src/dashboard/admin/AdminDashboardMain.js
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
      {/* Light Clean Console Header Banner */}
      <View style={styles.welcomeBanner}>
        <View style={styles.bannerBadge}>
          <MaterialCommunityIcons name="shield-check" size={12} color="#0284c7" />
          <Text style={styles.bannerBadgeText}>Drishtee Console</Text>
        </View>
        <Text style={styles.bannerTitle}>Welcome back, Hridesh 👋</Text>
        <Text style={styles.bannerSubtitle}>
          Real-time center analytics and active database monitoring for Drishtee Computer Centre systems.
        </Text>
      </View>

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={[styles.metricCard, { borderLeftColor: '#7c3aed' }]}>
          <View style={[styles.metricIconWrap, { backgroundColor: '#f3e8ff' }]}>
            <MaterialCommunityIcons name="account-group" size={20} color="#7c3aed" />
          </View>
          <View>
            <Text style={styles.metricNumber}>{stats.total}</Text>
            <Text style={styles.metricLabel}>Total Students</Text>
          </View>
        </View>

        <View style={[styles.metricCard, { borderLeftColor: '#0284c7' }]}>
          <View style={[styles.metricIconWrap, { backgroundColor: '#e0f2fe' }]}>
            <MaterialCommunityIcons name="lightning-bolt" size={20} color="#0284c7" />
          </View>
          <View>
            <Text style={styles.metricNumber}>{stats.todayEnrolled}</Text>
            <Text style={styles.metricLabel}>New Today</Text>
          </View>
        </View>

        <View style={[styles.metricCard, { borderLeftColor: '#10b981' }]}>
          <View style={[styles.metricIconWrap, { backgroundColor: '#dcfce7' }]}>
            <MaterialCommunityIcons name="certificate" size={20} color="#10b981" />
          </View>
          <View>
            <Text style={styles.metricNumber}>{stats.activeCount}</Text>
            <Text style={styles.metricLabel}>Active Portals</Text>
          </View>
        </View>
      </View>

      {/* Active Tab State or Quick Action Shortcuts */}
      {activeTab && activeTab !== 'dashboard' ? (
        <View style={styles.activeViewCard}>
          <View style={styles.activeCardHeader}>
            <MaterialCommunityIcons name="folder-open-outline" size={18} color="#0284c7" />
            <Text style={styles.activeViewTitle}>Active Module: {activeTab.replace('_', ' ').toUpperCase()}</Text>
          </View>
          <Text style={styles.activeViewBody}>
            Management controls and operational live sync are active for this partition. Select another section from the menu anytime.
          </Text>
        </View>
      ) : (
        <View style={styles.quickSection}>
          <Text style={styles.sectionTitle}>Quick Center Management</Text>
          <View style={styles.quickGrid}>
            <TouchableOpacity style={styles.quickActionBox} onPress={() => onNavigate && onNavigate('student_management')}>
              <MaterialCommunityIcons name="account-search" size={22} color="#7c3aed" />
              <Text style={styles.quickActionText}>Directory</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionBox} onPress={() => onNavigate && onNavigate('new_admission')}>
              <MaterialCommunityIcons name="account-plus" size={22} color="#10b981" />
              <Text style={styles.quickActionText}>Admission</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionBox} onPress={() => onNavigate && onNavigate('fees_management')}>
              <MaterialCommunityIcons name="currency-inr" size={22} color="#f59e0b" />
              <Text style={styles.quickActionText}>Fee Dues</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Real-time Recent Registrations List */}
      <View style={styles.recentSection}>
        <View style={styles.recentHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Registrations</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live Sync</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.emptyBox}>
            <ActivityIndicator size="small" color="#0284c7" />
            <Text style={styles.emptyText}>Syncing records...</Text>
          </View>
        ) : recentStudents.length > 0 ? (
          recentStudents.map((student, index) => {
            const studentName = student.name || student.fullName || 'Unnamed Student';
            const studentPhoto = student.photoUrl;

            return (
              <TouchableOpacity 
                key={student.id || index} 
                style={styles.studentRow} 
                activeOpacity={0.7}
                onPress={() => handleStudentPress(student)}
              >
                {studentPhoto ? (
                  <Image source={{ uri: studentPhoto }} style={styles.studentAvatarImg} />
                ) : (
                  <View style={styles.studentAvatarBox}>
                    <Text style={styles.studentInitial}>{studentName.charAt(0).toUpperCase()}</Text>
                  </View>
                )}

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.studentName} numberOfLines={1}>{studentName}</Text>
                  <Text style={styles.studentCourse} numberOfLines={1}>
                    {student.course || 'Course Not Assigned'} • <Text style={{ color: '#0284c7' }}>{student.branch || 'Main'}</Text>
                  </Text>
                </View>

                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>{student.status || 'Active'}</Text>
                </View>
              </TouchableOpacity>
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
    padding: 16,
    backgroundColor: '#f8fafc',
    flex: 1,
  },
  welcomeBanner: {
    backgroundColor: '#ffffff', // Light clean surface
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  bannerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  bannerBadgeText: {
    color: '#0284c7',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  bannerTitle: {
    fontSize: 18,
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
    gap: 8,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
  },
  metricIconWrap: {
    width: 34,
    height: 34,
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
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 8,
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
  quickActionText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#334155',
    marginTop: 6,
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
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  studentAvatarBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentAvatarImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
  },
  studentInitial: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0284c7',
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
    padding: 20,
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