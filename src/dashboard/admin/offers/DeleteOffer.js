// src/dashboard/admin/offers/DeleteOffer.js
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { db } from "../../../services/firebase"; // Adjust your firebase import path
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";

const C = {
  primary: "#0284c7",
  dark: "#071e3d",
  bg: "#f0f6ff",
  white: "#ffffff",
  text: "#0f172a",
  gray: "#64748b",
  border: "#ffffff",
  danger: "#ef4444",
  dangerBg: "#fef2f2",
};

export default function DeleteOffer() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "offers"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setOffers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error("Fetch error:", err);
      setLoading(false);
    });
  }, []);

  const handleDelete = (id) => {
    Alert.alert("Delete Offer", "Are you sure you want to delete this live offer?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          setDeletingId(id);
          try {
            await deleteDoc(doc(db, "offers", id));
          } catch (err) {
            console.error("Delete failed:", err);
            alert("Delete failed!");
          } finally {
            setDeletingId(null);
          }
        } 
      }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={styles.loadingText}>Loading Offers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Blobs */}
      <View style={styles.waterBlobTop} />
      <View style={styles.waterBlobBottom} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Manage Live Offers</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{offers.length}</Text>
          </View>
        </View>

        {offers.length === 0 ? (
          <View style={styles.emptyBox}>
            <MaterialIcons name="inbox" size={40} color={C.gray} />
            <Text style={styles.emptyTitle}>No offers live right now.</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {offers.map((o, idx) => (
              <View key={o.id} style={styles.offerCard}>
                <View style={styles.cardLeft}>
                  <View style={styles.indexBox}>
                    <Text style={styles.indexText}>{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={styles.offerTitle} numberOfLines={1}>{o.caption}</Text>
                    {o.details ? <Text style={styles.offerSub} numberOfLines={2}>{o.details}</Text> : null}
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.deleteBtn} 
                  onPress={() => handleDelete(o.id)}
                  disabled={deletingId === o.id}
                  activeOpacity={0.7}
                >
                  {deletingId === o.id ? (
                    <ActivityIndicator size="small" color={C.danger} />
                  ) : (
                    <MaterialIcons name="delete-outline" size={18} color={C.danger} />
                  )}
                </TouchableOpacity>
              </View>
            ))}
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

  scrollContent: { padding: 14, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  headerTitle: { fontSize: 15, fontWeight: '900', color: C.dark, textTransform: 'uppercase' },
  countBadge: { backgroundColor: C.dark, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  countText: { color: C.white, fontSize: 11, fontWeight: '900' },

  listContainer: { gap: 10 },
  offerCard: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 14, padding: 12, 
    borderWidth: 1.5, borderColor: C.border, elevation: 2 
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  indexBox: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center' },
  indexText: { color: C.white, fontSize: 11, fontWeight: '900' },
  offerTitle: { fontSize: 13, fontWeight: '900', color: C.text },
  offerSub: { fontSize: 11, fontWeight: '600', color: C.gray, marginTop: 2 },

  deleteBtn: { width: 38, height: 38, backgroundColor: C.dangerBg, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#fecaca' },

  emptyBox: { padding: 40, alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 16, borderWidth: 1.5, borderColor: C.border, marginTop: 10 },
  emptyTitle: { fontSize: 13, fontWeight: '900', color: C.dark, marginTop: 8 }
});