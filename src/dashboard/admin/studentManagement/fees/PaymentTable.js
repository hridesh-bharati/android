// src/dashboard/admin/studentManagement/fees/PaymentTable.js
import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { deletePayment } from "./FeeServices";

export default function PaymentTable({ payments = [], student }) {
  const handleDelete = (pid) => {
    Alert.alert("Delete Payment", "Delete this payment permanently?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deletePayment(student.email || student.id, pid) }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="receipt-long" size={20} color="#0f172a" />
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
        </View>
        <Text style={styles.countBadge}>{payments.length} Payments</Text>
      </View>

      {payments.length > 0 ? (
        payments.map((p, index) => {
          const isOnline = p.method?.toLowerCase().includes("online") || p.method?.toLowerCase().includes("upi");
          const iconName = isOnline ? "qr-code-scanner" : "payments";
          const iconBg = isOnline ? "#e0f2fe" : "#dcfce7";
          const iconColor = isOnline ? "#0284c7" : "#10b981";

          return (
            <View key={p.id || index} style={styles.transactionCard}>
              <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
                <MaterialIcons name={iconName} size={20} color={iconColor} />
              </View>

              <View style={styles.detailsContainer}>
                <Text style={styles.noteText} numberOfLines={1}>
                  {p.note} {p.otherType ? `(${p.otherType})` : ''}
                </Text>
                <Text style={styles.dateText}>
                  Paid on {p.depositDate || p.date} • <Text style={styles.methodLabel}>{p.method || 'Cash'}</Text>
                </Text>
                {p.dueDate && (
                  <Text style={styles.dueText}>Due: {p.dueDate}</Text>
                )}
              </View>

              <View style={styles.rightContainer}>
                <Text style={styles.amountText}>+₹{p.amount}</Text>
                <TouchableOpacity onPress={() => handleDelete(p.id)} style={styles.deleteBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <MaterialIcons name="delete-outline" size={18} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      ) : (
        <View style={styles.emptyBox}>
          <MaterialIcons name="receipt-long" size={36} color="#cbd5e1" style={{ marginBottom: 8 }} />
          <Text style={styles.emptyText}>No transaction records found.</Text>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { backgroundColor: 'transparent', marginTop: 8 },
  
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#0f172a', letterSpacing: 0.2 },
  countBadge: { fontSize: 10, fontWeight: '700', color: '#64748b', backgroundColor: '#e2e8f0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },

  // Shared card box styling (DRY)
  cardBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },

  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },

  detailsContainer: { flex: 1, marginRight: 8 },
  noteText: { fontSize: 13, fontWeight: '700', color: '#1e293b', marginBottom: 3 },
  dateText: { fontSize: 10, color: '#64748b', fontWeight: '500' },
  methodLabel: { fontWeight: '700', color: '#475569' },
  dueText: { fontSize: 9, color: '#ef4444', fontWeight: '600', marginTop: 2 },

  rightContainer: { alignItems: 'flex-end', justifyContent: 'center' },
  amountText: { fontSize: 14, fontWeight: '800', color: '#10b981', marginBottom: 4 },
  deleteBtn: { padding: 2 },

  emptyBox: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#e2e8f0'
  },
  emptyText: { color: '#94a3b8', fontWeight: '600', fontSize: 12 }
});