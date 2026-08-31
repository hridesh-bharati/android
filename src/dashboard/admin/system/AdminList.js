// src/dashboard/admin/system/AdminList.js
import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, 
  ActivityIndicator, Image, RefreshControl, Linking, Platform
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { db } from "../../../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const C = {
  primary: "#0284c7",
  primaryLight: "#e0f2fe",
  dark: "#071e3d",
  success: "#10b981",
  white: "#ffffff",
  border: "rgba(255, 255, 255, 0.8)",
  gray: "#64748b",
  bg: "#f0f6ff",
  lightBg: "rgba(255, 255, 255, 0.85)",
};

export default function AdminList() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAdmins = async () => {
    try {
      const q = query(collection(db, "users"), where("role", "==", "admin"));
      const snapshot = await getDocs(q);
      const adminsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAdmins(adminsList);
    } catch (err) {
      console.error("Error fetching admins:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAdmins();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={styles.loadingText}>Loading admins...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.waterBlobTop} />
      <View style={styles.waterBlobBottom} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>System Admins</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{admins.length}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.refreshBtn} onPress={fetchAdmins} activeOpacity={0.8}>
            <MaterialIcons name="refresh" size={16} color={C.dark} />
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {admins.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialIcons name="shield-outlined" size={40} color={C.gray} />
            <Text style={styles.emptyText}>No admins found</Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {admins.map((admin) => {
              const avatarUri = admin.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.name || "Admin")}&background=random`;

              return (
                <View key={admin.id} style={styles.adminCard}>
                  <View style={styles.cardInner}>
                    <Image source={{ uri: avatarUri }} style={styles.avatar} />

                    <View style={styles.infoContainer}>
                      <Text style={styles.adminName} numberOfLines={1}>{admin.name || "Admin"}</Text>
                      <Text style={styles.adminEmail} numberOfLines={1}>{admin.email}</Text>
                      
                      {admin.phone ? (
                        <TouchableOpacity 
                          onPress={() => Linking.openURL(`tel:${String(admin.phone).replace(/\s+/g, "")}`)}
                          style={styles.phoneRow}
                          activeOpacity={0.7}
                        >
                          <MaterialIcons name="phone" size={12} color={C.primary} />
                          <Text style={styles.phoneText}>{admin.phone}</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>

                    <View style={styles.statusWrapper}>
                      <View style={styles.successDot} />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, position: 'relative' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },
  loadingText: { marginTop: 8, fontSize: 12, fontWeight: '800', color: C.gray },

  waterBlobTop: { position: 'absolute', top: -30, right: -40, width: 250, height: 250, borderRadius: 125, backgroundColor: '#38bdf8', opacity: 0.16 },
  waterBlobBottom: { position: 'absolute', bottom: -30, left: -40, width: 260, height: 260, borderRadius: 130, backgroundColor: '#34d399', opacity: 0.14 },

  scrollContent: { padding: 14, paddingBottom: 80 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  titleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 16, fontWeight: '900', color: C.dark, textTransform: 'uppercase' },
  countBadge: { backgroundColor: C.dark, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  countText: { color: C.white, fontSize: 10, fontWeight: '900' },

  refreshBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, gap: 4, elevation: 1 },
  refreshText: { fontSize: 11, fontWeight: '900', color: C.dark },

  gridContainer: { gap: 10 },
  adminCard: {
    backgroundColor: C.lightBg,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    elevation: 2,
  },
  cardInner: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#e2e8f0' },
  infoContainer: { flex: 1, marginHorizontal: 12 },
  adminName: { fontSize: 13, fontWeight: '900', color: '#0f172a', marginBottom: 2 },
  adminEmail: { fontSize: 11, fontWeight: '600', color: C.gray, marginBottom: 4 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: C.primaryLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#bae6fd' },
  phoneText: { fontSize: 10, fontWeight: '800', color: C.primary },
  
  statusWrapper: { paddingLeft: 8, justifyContent: 'center', alignItems: 'center' },
  successDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.success },

  emptyCard: { padding: 40, alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 16, borderWidth: 1.5, borderColor: C.border, marginTop: 10 },
  emptyText: { fontSize: 13, fontWeight: '900', color: C.dark, marginTop: 8 }
});