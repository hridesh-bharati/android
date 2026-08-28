// src/dashboard/admin/studentManagement/fees/FeeSummaryCard.js
import React from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

export default function FeeSummaryCard({ student, summary, payments = [] }) {
  const coursePaymentsTotal = payments
    .filter(p => p.note === "Monthly Fee" || p.note === "Admission Fee")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const otherPaymentsTotal = payments
    .filter(p => p.note !== "Monthly Fee" && p.note !== "Admission Fee")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const actualCourseDue = (summary?.netFee || 0) - coursePaymentsTotal;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image
          source={{ uri: student?.photoUrl || `https://ui-avatars.com/api/?name=${student?.name || 'User'}` }}
          style={styles.avatar}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.name} numberOfLines={1}>{student?.name || "Loading..."}</Text>
          <View style={styles.badge}><Text style={styles.badgeText}>{student?.course}</Text></View>
        </View>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}><MaterialIcons name="person-outline" size={12} /> Reg: {student?.regNo || 'N/A'}</Text>
        <Text style={styles.metaText}><MaterialIcons name="event" size={12} /> Adm: {student?.admissionDate || 'N/A'}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>COURSE PAID</Text>
          <Text style={[styles.statVal, { color: '#10b981' }]}>₹{coursePaymentsTotal}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>OTHER PAID</Text>
          <Text style={[styles.statVal, { color: '#0284c7' }]}>₹{otherPaymentsTotal}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>COURSE DUE</Text>
          <Text style={[styles.statVal, { color: actualCourseDue > 0 ? '#f59e0b' : '#10b981' }]}>₹{actualCourseDue > 0 ? actualCourseDue : 0}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#0284c7', marginRight: 12 },
  headerInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  badge: { backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, alignSelf: 'flex-start' },
  badgeText: { fontSize: 9, fontWeight: '800', color: '#d97706' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#f1f5f9', paddingVertical: 8, marginBottom: 12 },
  metaText: { fontSize: 10, fontWeight: '700', color: '#64748b' },
  statsGrid: { flexDirection: 'row', gap: 8 },
  statBox: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  statLabel: { fontSize: 8, fontWeight: '800', color: '#94a3b8', marginBottom: 4 },
  statVal: { fontSize: 13, fontWeight: '800' }
});