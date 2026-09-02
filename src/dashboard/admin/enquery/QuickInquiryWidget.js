// src/dashboard/admin/enquery/QuickInquiryWidget.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { db } from '../../../services/firebase';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';

export default function QuickInquiryWidget() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setInquiries(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });
  }, []);

  const updateStatus = async (id, status) => {
    try { await updateDoc(doc(db, 'inquiries', id), { status: status === 'resolved' ? 'pending' : 'resolved' }); } catch (e) { console.error(e); }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#0284c7" /><Text style={styles.loadTxt}>Loading...</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.row}>
          <View style={styles.iconBox}><MaterialIcons name="headset-mic" size={18} color="#0284c7" /></View>
          <Text style={styles.title}>User Inquiries & Callbacks</Text>
        </View>
        <View style={styles.badge}><Text style={styles.badgeTxt}>{inquiries.length}</Text></View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {inquiries.length === 0 ? (
          <View style={[styles.card, styles.center]}><MaterialIcons name="inbox" size={36} color="#64748b" /><Text style={styles.title}>No enquiries found</Text></View>
        ) : (
          inquiries.map((item) => {
            const isResolved = item.status === 'resolved';
            return (
              <View key={item.id} style={[styles.card, isResolved && styles.resolvedCard]}>
                <View style={styles.topRow}>
                  <View style={{flex: 1}}>
                    <Text style={styles.name}>{item.name}</Text>
                    <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.phone}`)} style={styles.phoneTag}>
                      <MaterialIcons name="phone" size={11} color="#0284c7" />
                      <Text style={styles.phoneTxt}>{item.phone}</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity style={[styles.statusTag, isResolved ? styles.resBg : styles.pendBg]} onPress={() => updateStatus(item.id, item.status)}>
                    <Text style={[styles.statusTxt, isResolved ? styles.resTxt : styles.pendTxt]}>{item.status ? item.status.toUpperCase() : 'PENDING'}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.msgBox}>
                  <Text style={styles.msgLbl}>Query / Message:</Text>
                  <Text style={styles.msgTxt}>{item.message}</Text>
                </View>

                <View style={styles.topRow}>
                  <Text style={styles.date}>{item.createdAt?.toDate?.()?.toLocaleString() || 'Just now'}</Text>
                  <TouchableOpacity onPress={() => deleteDoc(doc(db, 'inquiries', item.id))}>
                    <MaterialIcons name="delete-outline" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const glass = {
  backgroundColor: 'rgba(255, 255, 255, 0.85)',
  borderWidth: 1.2,
  borderColor: 'rgba(255, 255, 255, 0.9)',
  borderRadius: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 3,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f6ff', padding: 14 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadTxt: { marginTop: 8, fontSize: 12, fontWeight: '700', color: '#64748b' },
  header: { ...glass, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(2, 132, 199, 0.1)', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 14, fontWeight: '900', color: '#071e3d' },
  badge: { backgroundColor: '#071e3d', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeTxt: { color: '#fff', fontSize: 10, fontWeight: '900' },
  scroll: { gap: 12, paddingBottom: 30 },
  card: { ...glass, padding: 14 },
  resolvedCard: { opacity: 0.7, backgroundColor: 'rgba(248, 250, 252, 0.7)' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  name: { fontSize: 13, fontWeight: '900', color: '#0f172a', marginBottom: 2 },
  phoneTag: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: '#e0f2fe', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  phoneTxt: { fontSize: 11, fontWeight: '800', color: '#0284c7' },
  statusTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  pendBg: { backgroundColor: '#fef3c7' },
  resBg: { backgroundColor: '#d1fae5' },
  statusTxt: { fontSize: 9, fontWeight: '900' },
  pendTxt: { color: '#d97706' },
  resTxt: { color: '#059669' },
  msgBox: { backgroundColor: 'rgba(248, 250, 252, 0.8)', padding: 10, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  msgLbl: { fontSize: 9, fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: 2 },
  msgTxt: { fontSize: 12, fontWeight: '600', color: '#1e293b' },
  date: { fontSize: 9, fontWeight: '700', color: '#94a3b8' },
});