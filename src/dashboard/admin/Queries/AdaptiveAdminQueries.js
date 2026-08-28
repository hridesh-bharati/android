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

const COLORS = {
  primary: "#0788CF",
  primaryDark: "#056FA9",
  navy: "#092B52",
  background: "#F4F7FB",
  white: "#FFFFFF",
  text: "#12233F",
  textDark: "#0B1F3A",
  textMuted: "#71819A",
  border: "#E5ECF4",
  blueLight: "#EAF6FF",
  blueBorder: "#BFE5FA",
  green: "#13A66A",
  greenLight: "#E9FAF2",
  greenBorder: "#BCEED6",
  red: "#EF4444",
  redLight: "#FFF0F0",
  redBorder: "#FFD0D0",
  orange: "#F59E0B",
  orangeLight: "#FFF6E5",
  purple: "#7C4DFF",
  purpleLight: "#F1ECFF",
  cyan: "#0099CC",
  cyanLight: "#E8F8FF",
};

export default function AdaptiveAdminQueries() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [modalItem, setModalItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const queriesRef = collection(db, "studentQueries");
    const q = query(queriesRef, orderBy("timestamp", "desc"));

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
        console.error("Firestore Sync Error:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const totalCount = data.length;
  const newCount = data.filter((item) => item.status !== "reviewed").length;
  const solvedCount = data.filter((item) => item.status === "reviewed").length;

  const todayCount = useMemo(() => {
    const today = new Date();
    return data.filter((item) => {
      if (!item.dt) return false;
      return (
        item.dt.getDate() === today.getDate() &&
        item.dt.getMonth() === today.getMonth() &&
        item.dt.getFullYear() === today.getFullYear()
      );
    }).length;
  }, [data]);

  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return data.filter((item) => {
      let matchesFilter = true;
      if (filter === "new") matchesFilter = item.status !== "reviewed";
      if (filter === "solved") matchesFilter = item.status === "reviewed";
      if (filter === "today") {
        if (!item.dt) {
          matchesFilter = false;
        } else {
          const today = new Date();
          matchesFilter =
            item.dt.getDate() === today.getDate() &&
            item.dt.getMonth() === today.getMonth() &&
            item.dt.getFullYear() === today.getFullYear();
        }
      }
      if (!matchesFilter) return false;
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
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
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
    if (!modalItem) return;
    try {
      setActionLoading(true);
      await deleteDoc(doc(db, "studentQueries", modalItem.id));
      setModalItem(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCall = async (mobile) => {
    if (!mobile) return;
    try {
      await Linking.openURL(`tel:${String(mobile).replace(/\s+/g, "")}`);
    } catch (error) {
      console.error("Call failed:", error);
    }
  };

  const handleWhatsApp = async (mobile) => {
    if (!mobile) return;
    let phone = String(mobile).replace(/\D/g, "");
    if (phone.length === 10) phone = `91${phone}`;
    try {
      await Linking.openURL(`https://wa.me/${phone}`);
    } catch (error) {
      console.error("WhatsApp failed:", error);
    }
  };

  const StatCard = ({ icon, count, label, background, iconBackground, iconColor, onPress }) => (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "#E2E8F0" }}
      style={({ pressed }) => [styles.statCard, { backgroundColor: background }, pressed && styles.pressed]}
    >
      <View style={[styles.statIcon, { backgroundColor: iconBackground }]}>
        <MaterialIcons name={icon} size={25} color={iconColor} />
      </View>
      <Text style={styles.statNumber}>{count}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Pressable>
  );

  const FilterTab = ({ filterKey, label, count }) => {
    const active = filter === filterKey;
    return (
      <Pressable
        onPress={() => setFilter(filterKey)}
        style={[styles.filterTab, active && styles.filterTabActive]}
      >
        <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>{label}</Text>
        <View style={[styles.filterCount, active && styles.filterCountActive]}>
          <Text style={[styles.filterCountText, active && styles.filterCountTextActive]}>{count}</Text>
        </View>
      </Pressable>
    );
  };

  const renderQuery = ({ item }) => {
    const solved = item.status === "reviewed";

    return (
      <View style={[styles.queryCard, solved ? styles.queryCardSolved : styles.queryCardNew]}>
        <View style={styles.queryTop}>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>{item.fullName || "Anonymous Student"}</Text>
            <View style={styles.infoLine}>
              <MaterialIcons name="access-time" size={13} color={COLORS.textMuted} />
              <Text style={styles.timeText}>{formatDate(item.dt)}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, solved ? styles.solvedBadge : styles.newBadge]}>
            <View style={[styles.statusDot, { backgroundColor: solved ? COLORS.green : COLORS.red }]} />
            <Text style={[styles.statusText, { color: solved ? COLORS.green : COLORS.red }]}>
              {solved ? "SOLVED" : "NEW"}
            </Text>
          </View>
        </View>

        <View style={styles.contactSection}>
          {item.mobile ? (
            <Pressable onPress={() => handleCall(item.mobile)} style={styles.contactItem}>
              <MaterialIcons name="phone" size={16} color={COLORS.primary} />
              <Text style={styles.contactText} numberOfLines={1}>{item.mobile}</Text>
            </Pressable>
          ) : null}
          {item.email ? (
            <View style={styles.contactItem}>
              <MaterialIcons name="email" size={16} color={COLORS.textMuted} />
              <Text style={[styles.contactText, { color: COLORS.textMuted }]} numberOfLines={1}>{item.email}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.subjectRow}>
          <View style={styles.subjectIcon}>
            <MaterialIcons name="chat" size={16} color={COLORS.primary} />
          </View>
          <Text style={styles.subject} numberOfLines={1}>{item.title || "Support Request"}</Text>
        </View>

        <View style={styles.messageBox}>
          <Text style={styles.message} numberOfLines={3}>{item.query || "No message provided."}</Text>
        </View>

        <View style={styles.actionRow}>
          {item.mobile ? (
            <Pressable
              onPress={() => handleWhatsApp(item.mobile)}
              android_ripple={{ color: "#CDEEDC" }}
              style={({ pressed }) => [styles.whatsappButton, pressed && styles.pressed]}
            >
              <MaterialIcons name="chat" size={17} color={COLORS.green} />
              <Text style={styles.whatsappText}>WhatsApp</Text>
            </Pressable>
          ) : null}

          <Pressable
            onPress={() => handleToggle(item)}
            android_ripple={{ color: "#CBE8FA" }}
            style={({ pressed }) => [styles.solveButton, solved ? styles.reopenButton : styles.markButton, pressed && styles.pressed]}
          >
            <MaterialIcons name={solved ? "replay" : "check-circle"} size={17} color={solved ? COLORS.orange : COLORS.primary} />
            <Text style={[styles.solveText, { color: solved ? COLORS.orange : COLORS.primary }]}>
              {solved ? "Reopen" : "Mark Solved"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setModalItem(item)}
            android_ripple={{ color: "#FFD5D5" }}
            style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
          >
            <MaterialIcons name="delete-outline" size={20} color={COLORS.red} />
          </Pressable>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingIcon}>
          <MaterialIcons name="forum" size={30} color={COLORS.primary} />
        </View>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingTitle}>Loading Queries</Text>
        <Text style={styles.loadingSubtitle}>Syncing with Firestore...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderQuery}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View>
                  <Text style={styles.headerTitle}>Student Queries</Text>
                  <Text style={styles.headerSubtitle}>Manage student contact requests</Text>
                </View>
                <View style={styles.headerIcon}>
                  <MaterialIcons name="support-agent" size={26} color={COLORS.white} />
                </View>
              </View>
              <View style={styles.searchBox}>
                <MaterialIcons name="search" size={21} color="#89A0B9" />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search name, mobile, email..."
                  placeholderTextColor="#91A0B5"
                  style={styles.searchInput}
                  returnKeyType="search"
                />
                {search.length > 0 ? (
                  <Pressable onPress={() => setSearch("")}>
                    <MaterialIcons name="close" size={20} color="#8194AA" />
                  </Pressable>
                ) : null}
              </View>
            </View>

            <View style={styles.statsGrid}>
              <StatCard icon="forum" count={totalCount} label="Total Queries" background="#EEF8FF" iconBackground="#D5EEFF" iconColor={COLORS.primary} onPress={() => setFilter("all")} />
              <StatCard icon="schedule" count={newCount} label="New Queries" background="#FFF8EB" iconBackground="#FFEBC5" iconColor={COLORS.orange} onPress={() => setFilter("new")} />
              <StatCard icon="check-circle" count={solvedCount} label="Solved" background="#EDFBF4" iconBackground="#D5F5E4" iconColor={COLORS.green} onPress={() => setFilter("solved")} />
              <StatCard icon="today" count={todayCount} label="Today" background="#F4EEFF" iconBackground="#E7DCFF" iconColor={COLORS.purple} onPress={() => setFilter("today")} />
            </View>

            <View style={styles.tabsContainer}>
              <FilterTab filterKey="all" label="All" count={totalCount} />
              <FilterTab filterKey="new" label="New" count={newCount} />
              <FilterTab filterKey="solved" label="Solved" count={solvedCount} />
              <FilterTab filterKey="today" label="Today" count={todayCount} />
            </View>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Recent Queries</Text>
                <Text style={styles.sectionSubtitle}>{filteredData.length} request{filteredData.length !== 1 ? "s" : ""} found</Text>
              </View>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <MaterialIcons name="inbox" size={42} color="#AAB8C8" />
            </View>
            <Text style={styles.emptyTitle}>No Queries Found</Text>
            <Text style={styles.emptySubtitle}>There are no student queries in this section.</Text>
            {search.length > 0 ? (
              <Pressable onPress={() => setSearch("")} style={styles.clearSearchButton}>
                <Text style={styles.clearSearchText}>Clear Search</Text>
              </Pressable>
            ) : null}
          </View>
        }
        ListFooterComponent={filteredData.length > 0 ? <View style={styles.footerSpace} /> : null}
      />

      <Modal
        transparent
        visible={Boolean(modalItem)}
        animationType="fade"
        onRequestClose={() => {
          if (!actionLoading) setModalItem(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.warningIcon}>
              <MaterialIcons name="delete-outline" size={30} color={COLORS.red} />
            </View>
            <Text style={styles.modalTitle}>Delete Query?</Text>
            <Text style={styles.modalDescription}>Are you sure you want to delete this query from the database?</Text>

            {modalItem ? (
              <View style={styles.modalUserBox}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalUserName} numberOfLines={1}>{modalItem.fullName || "Anonymous Student"}</Text>
                  <Text style={styles.modalUserSubject} numberOfLines={1}>{modalItem.title || "Support Request"}</Text>
                </View>
              </View>
            ) : null}

            <View style={styles.modalButtons}>
              <Pressable disabled={actionLoading} onPress={() => setModalItem(null)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable disabled={actionLoading} onPress={handleRemove} style={styles.confirmDeleteButton}>
                {actionLoading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <>
                    <MaterialIcons name="delete" size={18} color={COLORS.white} />
                    <Text style={styles.confirmDeleteText}>Delete</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  listContent: { paddingBottom: 30 },
  pressed: { opacity: 0.78 },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 22,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    elevation: 5,
    shadowColor: "#0879B7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
  },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  headerTitle: { color: COLORS.white, fontSize: 25, fontWeight: "900", letterSpacing: -0.4 },
  headerSubtitle: { color: "#DDF3FF", fontSize: 13, fontWeight: "500", marginTop: 3 },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  searchBox: {
    height: 50,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    elevation: 3,
  },
  searchInput: { flex: 1, fontSize: 13, fontWeight: "600", color: COLORS.text, paddingHorizontal: 10, paddingVertical: 0 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 14, paddingTop: 16, justifyContent: "space-between" },
  statCard: {
    width: "48.2%",
    minHeight: 142,
    borderRadius: 20,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    elevation: 2,
    shadowColor: "#71819A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  statIcon: { width: 43, height: 43, borderRadius: 14, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  statNumber: { fontSize: 25, fontWeight: "900", color: COLORS.textDark },
  statLabel: { fontSize: 11, fontWeight: "700", color: COLORS.textMuted, marginTop: 2 },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    marginHorizontal: 14,
    marginTop: 4,
    borderRadius: 17,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 1,
  },
  filterTab: { flex: 1, minHeight: 48, borderRadius: 13, justifyContent: "center", alignItems: "center", flexDirection: "row", gap: 5 },
  filterTabActive: { backgroundColor: COLORS.primary, elevation: 2 },
  filterTabText: { fontSize: 12, fontWeight: "800", color: COLORS.textMuted },
  filterTabTextActive: { color: COLORS.white },
  filterCount: { minWidth: 19, height: 19, borderRadius: 10, backgroundColor: "#EDF2F7", justifyContent: "center", alignItems: "center", paddingHorizontal: 4 },
  filterCountActive: { backgroundColor: "rgba(255,255,255,0.22)" },
  filterCountText: { fontSize: 9, fontWeight: "900", color: COLORS.textMuted },
  filterCountTextActive: { color: COLORS.white },
  sectionHeader: { paddingHorizontal: 18, paddingTop: 22, paddingBottom: 11, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "900", color: COLORS.textDark },
  sectionSubtitle: { fontSize: 11, color: COLORS.textMuted, fontWeight: "600", marginTop: 2 },
  liveBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 9, paddingVertical: 6, borderRadius: 10, backgroundColor: COLORS.greenLight },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.green, marginRight: 5 },
  liveText: { fontSize: 9, fontWeight: "900", color: COLORS.green },
  queryCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 14,
    marginBottom: 12,
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
    shadowColor: "#5F7690",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    overflow: "hidden",
  },
  queryCardNew: { borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  queryCardSolved: { borderLeftWidth: 4, borderLeftColor: COLORS.green },
  queryTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: "900", color: COLORS.textDark },
  infoLine: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  timeText: { fontSize: 10, fontWeight: "600", color: COLORS.textMuted, marginLeft: 4 },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 9, paddingVertical: 6, borderRadius: 10 },
  newBadge: { backgroundColor: COLORS.redLight },
  solvedBadge: { backgroundColor: COLORS.greenLight },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  statusText: { fontSize: 9, fontWeight: "900" },
  contactSection: { flexDirection: "row", flexWrap: "wrap", marginTop: 13, marginBottom: 11, gap: 7 },
  contactItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#F5F8FC", borderRadius: 9, paddingHorizontal: 9, paddingVertical: 7, maxWidth: "100%" },
  contactText: { fontSize: 10, fontWeight: "700", color: COLORS.primary, marginLeft: 5, maxWidth: 185 },
  subjectRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  subjectIcon: { width: 29, height: 29, borderRadius: 9, backgroundColor: COLORS.blueLight, justifyContent: "center", alignItems: "center", marginRight: 8 },
  subject: { flex: 1, fontSize: 14, fontWeight: "900", color: COLORS.primary },
  messageBox: { backgroundColor: "#F7F9FC", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: "#EDF1F6", marginBottom: 13 },
  message: { fontSize: 12, lineHeight: 18, color: "#596B82", fontWeight: "500" },
  actionRow: { flexDirection: "row", alignItems: "center", paddingTop: 11, borderTopWidth: 1, borderTopColor: "#EEF2F6", gap: 7 },
  whatsappButton: { flex: 1, minHeight: 40, flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: COLORS.greenLight, borderWidth: 1, borderColor: COLORS.greenBorder, borderRadius: 11 },
  whatsappText: { fontSize: 10, fontWeight: "900", color: COLORS.green, marginLeft: 5 },
  solveButton: { flex: 1, minHeight: 40, flexDirection: "row", justifyContent: "center", alignItems: "center", borderRadius: 11, borderWidth: 1 },
  markButton: { backgroundColor: COLORS.blueLight, borderColor: COLORS.blueBorder },
  reopenButton: { backgroundColor: COLORS.orangeLight, borderColor: "#FAD99A" },
  solveText: { fontSize: 10, fontWeight: "900", marginLeft: 5 },
  deleteButton: { width: 42, height: 40, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.redLight, borderWidth: 1, borderColor: COLORS.redBorder, borderRadius: 11 },
  loadingContainer: { flex: 1, backgroundColor: COLORS.background, justifyContent: "center", alignItems: "center", padding: 30 },
  loadingIcon: { width: 65, height: 65, borderRadius: 22, backgroundColor: COLORS.blueLight, justifyContent: "center", alignItems: "center", marginBottom: 15 },
  loadingTitle: { fontSize: 16, fontWeight: "900", color: COLORS.textDark, marginTop: 12 },
  loadingSubtitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  emptyContainer: { backgroundColor: COLORS.white, marginHorizontal: 14, marginTop: 5, paddingVertical: 55, paddingHorizontal: 25, borderRadius: 20, alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
  emptyIcon: { width: 76, height: 76, borderRadius: 25, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center", marginBottom: 15 },
  emptyTitle: { fontSize: 17, fontWeight: "900", color: COLORS.textDark },
  emptySubtitle: { textAlign: "center", fontSize: 12, lineHeight: 18, color: COLORS.textMuted, marginTop: 5 },
  clearSearchButton: { backgroundColor: COLORS.blueLight, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 11, marginTop: 16 },
  clearSearchText: { fontSize: 11, fontWeight: "900", color: COLORS.primary },
  footerSpace: { height: 20 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(5, 25, 48, 0.62)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalCard: { width: "100%", backgroundColor: COLORS.white, borderRadius: 25, padding: 22, elevation: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15 },
  warningIcon: { width: 58, height: 58, borderRadius: 19, backgroundColor: COLORS.redLight, justifyContent: "center", alignItems: "center", alignSelf: "center", marginBottom: 13 },
  modalTitle: { textAlign: "center", fontSize: 19, fontWeight: "900", color: COLORS.textDark },
  modalDescription: { textAlign: "center", fontSize: 12, lineHeight: 18, color: COLORS.textMuted, marginTop: 6, marginBottom: 17 },
  modalUserBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#F7F9FC", borderRadius: 15, padding: 11, marginBottom: 19, borderWidth: 1, borderColor: COLORS.border },
  modalUserName: { fontSize: 13, fontWeight: "900", color: COLORS.textDark },
  modalUserSubject: { fontSize: 10, fontWeight: "600", color: COLORS.textMuted, marginTop: 3 },
  modalButtons: { flexDirection: "row", gap: 10 },
  cancelButton: { flex: 1, height: 46, borderRadius: "13", borderRadius: 13, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center" },
  cancelText: { fontSize: 12, fontWeight: "900", color: "#526276" },
  confirmDeleteButton: { flex: 1, height: 46, borderRadius: 13, backgroundColor: COLORS.red, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 5 },
  confirmDeleteText: { fontSize: 12, fontWeight: "900", color: COLORS.white },
});