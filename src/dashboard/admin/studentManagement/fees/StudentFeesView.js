// src/dashboard/admin/studentManagement/fees/StudentFeesView.js
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../../../services/firebase";

export default function StudentFeesView({ studentId }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }
    const targetId = studentId.toLowerCase().trim();

    const q = query(
      collection(db, "admissions", targetId, "payments"),
      orderBy("date", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPayments(list);
      setLoading(false);
    }, () => {
      const fallbackQuery = query(collection(db, "admissions", targetId, "payments"));
      onSnapshot(fallbackQuery, (fallbackSnap) => {
        const list = fallbackSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        list.reverse();
        setPayments(list);
        setLoading(false);
      });
    });

    return () => unsub();
  }, [studentId]);

  const totalPaid = payments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color="#0284c7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.alertBox}>
        <MaterialIcons name="verified" size={18} color="#10b981" style={{ marginRight: 6 }} />
        <Text style={styles.alertText}>Total Paid : ₹{totalPaid}</Text>
      </View>

      <View style={styles.tableCard}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.th, { flex: 1.2 }]}>Date</Text>
          <Text style={[styles.th, { flex: 1.5 }]}>Type</Text>
          <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>Amount</Text>
          <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>Mode</Text>
        </View>

        {payments.length > 0 ? (
          payments.map((p) => {
            const dateStr = p.date?.seconds
              ? new Date(p.date.seconds * 1000).toLocaleDateString()
              : (p.date || p.depositDate || "-");

            return (
              <View key={p.id} style={styles.tableRow}>
                <Text style={[styles.td, { flex: 1.2, color: '#64748b' }]}>{dateStr}</Text>
                <Text style={[styles.td, { flex: 1.5, fontWeight: '700', color: '#1e293b' }]} numberOfLines={1}>{p.type || p.note || 'Fee'}</Text>
                <Text style={[styles.td, { flex: 1, textAlign: 'right', fontWeight: '800', color: '#10b981' }]}>₹{p.amount}</Text>
                <Text style={[styles.td, { flex: 1, textAlign: 'right', color: '#475569', fontWeight: '600' }]} numberOfLines={1}>{p.mode || p.method || 'Cash'}</Text>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No financial records found.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 12 },
  center: { padding: 20, alignItems: 'center' },
  alertBox: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  alertText: { fontSize: 13, fontWeight: '800', color: '#166534' },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    elevation: 1
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  th: { fontSize: 10, fontWeight: '800', color: '#64748b', textTransform: 'uppercase' },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center'
  },
  td: { fontSize: 12 },
  emptyBox: { padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 12, color: '#94a3b8', fontWeight: '600' }
});