// src/dashboard/admin/Queries/AdaptiveAdminQueries.js
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { db } from "../../../services/firebase";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

const C = {
  primary: "#0284c7",
  dark: "#071e3d",
  bg: "#f0f6ff",
  white: "#ffffff",
  text: "#0f172a",
  gray: "#64748b",
  border: "#ffffff", // 👈 White borders for all cards
  success: "#10b981",
  successBg: "#ecfdf5",
  danger: "#ef4444",
  dangerBg: "#fef2f2",
  warning: "#f59e0b",
  warningBg: "#fffbeb",
};

export default function AdaptiveAdminQueries() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "studentQueries"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const records = snapshot.docs.map((item) => {
          const itemData = item.data();
          return {
            id: item.id,
            ...itemData,
            dt: itemData.timestamp?.toDate ? itemData.timestamp.toDate() : null,
          };
        });
        setData(records);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore Error:", error);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const counts = useMemo(() => {
    const today = new Date();
    let newC = 0, solvedC = 0, todayC = 0;
    
    data.forEach(item => {
      if (item.status === "reviewed") solvedC++;
      else newC++;

      if (item.dt && 
          item.dt.getDate() === today.getDate() &&
          item.dt.getMonth() === today.getMonth() &&
          item.dt.getFullYear() === today.getFullYear()) {
        todayC++;
      }
    });

    return { total: data.length, new: newC, solved: solvedC, today: todayC };
  }, [data]);

  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return data.filter((item) => {
      if (filter === "new" && item.status === "reviewed") return false;
      if (filter === "solved" && item.status !== "reviewed") return false;
      if (filter === "today") {
        if (!item.dt) return false;
        const today = new Date();
        if (
          item.dt.getDate() !== today.getDate() ||
          item.dt.getMonth() !== today.getMonth() ||
          item.dt.getFullYear() !== today.getFullYear()
        ) return false;
      }
      if (!keyword) return true;

      return (
        String(item.fullName || "").toLowerCase().includes(keyword) ||
        String(item.mobile || "").toLowerCase().includes(keyword) ||
        String(item.email || "").toLowerCase().includes(keyword) ||
        String(item.title || "").toLowerCase().includes(keyword) ||
        String(item.query || "").toLowerCase().includes(keyword)
      );
    });
  }, [data, filter, search]);

  const formatDate = (date) => {
    if (!date) return "Just now";
    return date.toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true,
    });
  };

  const handleToggle = async (item) => {
    try {
      await updateDoc(doc(db, "studentQueries", item.id), {
        status: item.status === "reviewed" ? "pending" : "reviewed",
      });
    } catch (error) {
      console.error("Toggle failed:", error);
    }
  };

  const handleRemove = async () => {
    if (!deleteId) return;
    try {
      setActionLoading(true);
      await deleteDoc(doc(db, "studentQueries", deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCall = async (mobile) => {
    if (mobile) Linking.openURL(`tel:${String(mobile).replace(/\s+/g, "")}`);
  };

  const handleWhatsApp = async (mobile) => {
    if (!mobile) return;
    let phone = String(mobile).replace(/\D/g, "");
    if (phone.length === 10) phone = `91${phone}`;
    Linking.openURL(`https://wa.me/${phone}`);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.secondary} />
        <Text style={styles.loadingText}>Syncing Queries...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.waterBlobTop} />
      <View style={styles.waterBlobBottom} />

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>Student Queries</Text>
                <Text style={styles.headerSubtitle}>Manage support requests live</Text>
              </View>
              <View style={styles.headerIcon}>
                <MaterialIcons name="support-agent" size={24} color={C.white} />
              </View>
            </View>

            <View style={styles.searchBox}>
              <MaterialIcons name="search" size={20} color={C.gray} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search name, mobile, email..."
                placeholderTextColor={C.gray}
                style={styles.searchInput}
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch("")}>
                  <MaterialIcons name="close" size={18} color={C.gray} />
                </Pressable>
              )}
            </View>

            <View style={styles.statsGrid}>
              <Pressable style={styles.statBox} onPress={() => setFilter("all")}>
                <Text style={styles.statNumber}>{counts.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </Pressable>
              <Pressable style={styles.statBox} onPress={() => setFilter("new")}>
                <Text style={[styles.statNumber, { color: C.danger }]}>{counts.new}</Text>
                <Text style={styles.statLabel}>New</Text>
              </Pressable>
              <Pressable style={styles.statBox} onPress={() => setFilter("solved")}>
                <Text style={[styles.statNumber, { color: C.success }]}>{counts.solved}</Text>
                <Text style={styles.statLabel}>Solved</Text>
              </Pressable>
              <Pressable style={styles.statBox} onPress={() => setFilter("today")}>
                <Text style={[styles.statNumber, { color: C.warning }]}>{counts.today}</Text>
                <Text style={styles.statLabel}>Today</Text>
              </Pressable>
            </View>

            <View style={styles.tabsRow}>
              {["all", "new", "solved", "today"].map((key) => (
                <Pressable
                  key={key}
                  style={[styles.tabBtn, filter === key && styles.tabBtnActive]}
                  onPress={() => setFilter(key)}
                >
                  <Text style={[styles.tabText, filter === key && styles.tabTextActive]}>
                    {key.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const solved = item.status === "reviewed";
          return (
            <View style={[styles.queryCard, solved ? styles.cardSolved : styles.cardNew]}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName} numberOfLines={1}>{item.fullName || "Anonymous"}</Text>
                  <Text style={styles.timeText}>{formatDate(item.dt)}</Text>
                </View>
                <View style={[styles.badge, solved ? styles.badgeSuccess : styles.badgeDanger]}>
                  <Text style={[styles.badgeText, { color: solved ? C.success : C.danger }]}>
                    {solved ? "SOLVED" : "NEW"}
                  </Text>
                </View>
              </View>

              <View style={styles.contactRow}>
                {item.mobile ? (
                  <Pressable onPress={() => handleCall(item.mobile)} style={styles.contactChip}>
                    <MaterialIcons name="phone" size={14} color={C.secondary} />
                    <Text style={styles.contactText}>{item.mobile}</Text>
                  </Pressable>
                ) : null}
                {item.email ? (
                  <View style={styles.contactChip}>
                    <MaterialIcons name="email" size={14} color={C.gray} />
                    <Text style={[styles.contactText, { color: C.gray }]}>{item.email}</Text>
                  </View>
                ) : null}
              </View>

              <Text style={styles.subjectTitle} numberOfLines={1}>{item.title || "Support Request"}</Text>
              <Text style={styles.messageText} numberOfLines={3}>{item.query || "No message provided."}</Text>

              <View style={styles.actionRow}>
                {item.mobile ? (
                  <Pressable style={styles.whatsappBtn} onPress={() => handleWhatsApp(item.mobile)}>
                    <MaterialIcons name="chat" size={15} color={C.success} />
                    <Text style={styles.whatsappText}>WhatsApp</Text>
                  </Pressable>
                ) : null}

                <Pressable
                  style={[styles.statusBtn, solved ? styles.reopenBtn : styles.markBtn]}
                  onPress={() => handleToggle(item)}
                >
                  <MaterialIcons name={solved ? "replay" : "check-circle"} size={15} color={solved ? C.warning : C.secondary} />
                  <Text style={[styles.statusBtnText, { color: solved ? C.warning : C.secondary }]}>
                    {solved ? "Reopen" : "Mark Solved"}
                  </Text>
                </Pressable>

                <Pressable style={styles.deleteBtn} onPress={() => setDeleteId(item.id)}>
                  <MaterialIcons name="delete-outline" size={18} color={C.danger} />
                </Pressable>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <MaterialIcons name="inbox" size={40} color={C.gray} />
            <Text style={styles.emptyTitle}>No Queries Found</Text>
          </View>
        }
      />

      <Modal visible={!!deleteId} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconBox}>
              <MaterialIcons name="warning" size={26} color={C.danger} />
            </View>
            <Text style={styles.modalTitle}>Delete Query</Text>
            <Text style={styles.modalSub}>Are you sure you want to remove this query record permanently?</Text>

            <View style={styles.modalBtnRow}>
              <Pressable style={styles.cancelBtn} onPress={() => setDeleteId(null)} disabled={actionLoading}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.confirmBtn} onPress={handleRemove} disabled={actionLoading}>
                {actionLoading ? <ActivityIndicator color={C.white} size="small" /> : <Text style={styles.confirmBtnText}>Delete</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, position: 'relative' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },
  loadingText: { marginTop: 10, fontSize: 12, fontWeight: '800', color: C.gray },
  
  waterBlobTop: {
    position: 'absolute', top: -30, right: -40, width: 250, height: 250,
    borderRadius: 125, backgroundColor: '#38bdf8', opacity: 0.16, transform: [{ scale: 1.4 }]
  },
  waterBlobBottom: {
    position: 'absolute', bottom: -30, left: -40, width: 260, height: 260,
    borderRadius: 130, backgroundColor: '#34d399', opacity: 0.14
  },

  listContent: { padding: 14, paddingBottom: 40 },
  
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    backgroundColor: 'rgba(255, 255, 255, 0.85)', padding: 14, borderRadius: 14, 
    borderWidth: 1.5, borderColor: C.border, marginBottom: 10, elevation: 2 
  },
  headerTitle: { fontSize: 16, fontWeight: '900', color: C.dark },
  headerSubtitle: { fontSize: 11, fontWeight: '700', color: C.gray, marginTop: 2 },
  headerIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: C.secondary, justifyContent: 'center', alignItems: 'center' },

  searchBox: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.9)', 
    borderRadius: 12, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 12, height: 42, marginBottom: 12, elevation: 1 
  },
  searchInput: { flex: 1, fontSize: 12, fontWeight: '700', color: C.text, paddingHorizontal: 8 },

  statsGrid: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statBox: { 
    flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.85)', borderRadius: 12, paddingVertical: 10, 
    alignItems: 'center', borderWidth: 1.5, borderColor: C.border, elevation: 1 
  },
  statNumber: { fontSize: 15, fontWeight: '900', color: C.dark },
  statLabel: { fontSize: 9, fontWeight: '800', color: C.gray, textTransform: 'uppercase', marginTop: 2 },

  tabsRow: { 
    flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.9)', 
    borderRadius: 12, padding: 4, borderWidth: 1.5, borderColor: C.border, marginBottom: 14, elevation: 1 
  },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', backgroundColor: 'transparent' },
  tabBtnActive: { backgroundColor: C.dark, elevation: 2 },
  tabText: { fontSize: 10, fontWeight: '800', color: C.gray },
  tabTextActive: { color: C.white, fontWeight: '900' },

  queryCard: { 
    backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 16, padding: 14, 
    borderWidth: 1.5, borderColor: C.border, marginBottom: 10, elevation: 2 
  },
  cardNew: { borderLeftWidth: 4, borderLeftColor: C.danger },
  cardSolved: { borderLeftWidth: 4, borderLeftColor: C.success },

  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  userName: { fontSize: 14, fontWeight: '900', color: C.dark },
  timeText: { fontSize: 10, fontWeight: '700', color: C.gray, marginTop: 2 },
  
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeDanger: { backgroundColor: C.dangerBg },
  badgeSuccess: { backgroundColor: C.successBg },
  badgeText: { fontSize: 9, fontWeight: '900' },

  contactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  contactChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 4 },
  contactText: { fontSize: 10, fontWeight: '800', color: C.secondary },

  subjectTitle: { fontSize: 13, fontWeight: '900', color: C.text, marginBottom: 4 },
  messageText: { fontSize: 11, fontWeight: '600', color: C.gray, lineHeight: 16, marginBottom: 12 },

  actionRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10, gap: 6 },
  whatsappBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.successBg, height: 36, borderRadius: 8, gap: 4, borderWidth: 1, borderColor: '#a7f3d0' },
  whatsappText: { fontSize: 10, fontWeight: '900', color: C.success },
  statusBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', height: 36, borderRadius: 8, gap: 4, borderWidth: 1, borderColor: '#cbd5e1' },
  statusBtnText: { fontSize: 10, fontWeight: '900' },
  deleteBtn: { width: 36, height: 36, backgroundColor: C.dangerBg, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#fecaca' },

  emptyBox: { padding: 40, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 16, borderWidth: 1.5, borderColor: C.border, marginTop: 10 },
  emptyTitle: { fontSize: 13, fontWeight: '900', color: C.dark, marginTop: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(7, 30, 61, 0.7)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalCard: { width: '100%', maxWidth: 300, backgroundColor: C.white, borderRadius: 18, padding: 20, alignItems: 'center', elevation: 10 },
  modalIconBox: { width: 46, height: 46, borderRadius: 23, backgroundColor: C.dangerBg, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  modalTitle: { fontSize: 15, fontWeight: '900', color: C.dark, marginBottom: 4 },
  modalSub: { fontSize: 11, color: C.gray, textAlign: 'center', fontWeight: '600', marginBottom: 20, lineHeight: 16 },
  modalBtnRow: { flexDirection: 'row', gap: 10, width: '100%' },
  cancelBtn: { flex: 1, backgroundColor: '#f1f5f9', height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e1' },
  cancelBtnText: { color: C.dark, fontSize: 11, fontWeight: '900' },
  confirmBtn: { flex: 1, backgroundColor: C.danger, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  confirmBtnText: { color: C.white, fontSize: 11, fontWeight: '900' },
});