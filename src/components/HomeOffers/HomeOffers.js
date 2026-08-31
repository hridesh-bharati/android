// src/components/HomeOffers.js
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Image } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { db } from "../../services/firebase"
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";

const C = {
  primary: "#0284c7",
  primaryLight: "#e0f2fe",
  dark: "#071e3d",
  white: "#ffffff",
  border: "rgba(255, 255, 255, 0.8)",
  gray: "#64748b",
  bg: "#f0f6ff",
  lightBg: "rgba(255, 255, 255, 0.85)",
};

const shadowStyle = Platform => Platform.select({
  ios: { shadowColor: "#0ea5e9", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  android: { elevation: 3 },
  web: { boxShadow: '0px 4px 16px rgba(14, 165, 233, 0.06)' },
});

export default function HomeOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "offers"), orderBy("createdAt", "desc"), limit(5));
    return onSnapshot(q, s => {
      setOffers(s.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
  }, []);

  if (loading || !offers.length) {
    return loading ? (
      <View style={styles.center}>
        <ActivityIndicator size="small" color={C.primary} />
      </View>
    ) : null;
  }

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return "";
    try {
      return timestamp.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    } catch {
      return "";
    }
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <MaterialIcons name="campaign" size={18} color={C.primary} />
        <Text style={styles.sectionTitle}>Updates & Announcements</Text>
      </View>

      {/* Offers Cards List */}
      <View style={styles.listContainer}>
        {offers.map(({ id, caption, details, adminPhoto, adminName, createdAt }) => {
          const avatarUri = adminPhoto?.replace("/upload/", "/upload/w_40,f_auto,q_auto/") || `https://ui-avatars.com/api/?name=${encodeURIComponent(adminName || "Drishtee")}`;
          
          return (
            <View key={id} style={styles.offerCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>OFFER</Text>
                </View>
                <MaterialIcons name="auto-awesome" size={16} color={C.primary} style={{ opacity: 0.5 }} />
              </View>

              <Text style={styles.captionText} numberOfLines={2}>{caption}</Text>
              
              {details ? (
                <Text style={styles.detailsText} numberOfLines={3}>{details}</Text>
              ) : null}

              <View style={styles.footerRow}>
                <View style={styles.authorRow}>
                  <Image source={{ uri: avatarUri }} style={styles.avatar} />
                  <Text style={styles.authorText} numberOfLines={1}>{adminName || "Drishtee"}</Text>
                </View>
                <Text style={styles.dateText}>{formatDate(createdAt)}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    paddingHorizontal: 12,
    width: "100%",
  },
  center: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0f172a",
    textTransform: "uppercase",
  },
  listContainer: {
    gap: 10,
  },
  offerCard: {
    backgroundColor: C.lightBg,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    borderLeftWidth: 4,
    borderLeftColor: C.primary,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  badge: {
    backgroundColor: C.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: C.primary,
  },
  captionText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 4,
    lineHeight: 18,
  },
  detailsText: {
    fontSize: 11,
    fontWeight: "600",
    color: C.gray,
    lineHeight: 16,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  authorText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0f172a",
  },
  dateText: {
    fontSize: 10,
    fontWeight: "700",
    color: C.gray,
  },
});