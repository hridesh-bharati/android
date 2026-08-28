// src/dashboard/admin/studentManagement/AdmissionsList.js
import React, { useState, useMemo } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useAdmissions } from "./AdmissionProvider";
import StudentCard, { getActualStatus } from "./StudentCard";

const BRANCH_MAP = { Main: "DIIT124", East: "DIIT125" };
const { width } = Dimensions.get("window");

export default function AdmissionsList({ navigation }) {
  const { admissions, loading, updateAdmission, deleteAdmission } = useAdmissions();
  
  const [branchFilter, setBranchFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { filteredList, stats } = useMemo(() => {
    let counts = { all: 0, main: 0, east: 0 };
    const search = searchTerm.toLowerCase().trim();

    const admittedStudents = admissions.filter(s => {
      const actStat = getActualStatus(s);
      return actStat === "accepted" || actStat === "done";
    });

    counts.all = admittedStudents.length;

    const list = admittedStudents.filter((s) => {
      const bCode = s.branch || s.centerCode;
      if (bCode === BRANCH_MAP.Main) counts.main++;
      if (bCode === BRANCH_MAP.East) counts.east++;

      return (branchFilter === "all" || bCode === BRANCH_MAP[branchFilter]) &&
        (!search ||
          [s.name, s.fullName, s.regNo, s.phone, s.mobile, s.email]
            .some(f => f?.toLowerCase().includes(search))
        );
    });
    return { filteredList: list, stats: counts };
  }, [admissions, branchFilter, searchTerm]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0284c7" />
        <Text style={{ color: "#64748b", marginTop: 8, fontSize: 12 }}>Loading records...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 12, paddingBottom: 40 }}>
      {/* Top Filter Bar */}
      <View style={styles.filterCard}>
        <View style={styles.filterHeaderRow}>
          <Text style={styles.titleText}>Admitted Students ({stats.all})</Text>
        </View>

        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={18} color="#94a3b8" style={{ marginRight: 6 }} />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search students..." 
            placeholderTextColor="#94a3b8"
            value={searchTerm} 
            onChangeText={setSearchTerm} 
          />
        </View>

        <View style={styles.branchTabsRow}>
          {["all", "Main", "East"].map((b) => {
            const isSelected = branchFilter === b;
            const countVal = b === "all" ? stats.all : (b === "Main" ? stats.main : stats.east);
            return (
              <TouchableOpacity
                key={b}
                style={[styles.branchTab, isSelected && styles.activeBranchTab]}
                onPress={() => setBranchFilter(b)}
              >
                <Text style={[styles.branchTabText, isSelected && styles.activeBranchTabText]}>
                  {b.toUpperCase()} ({countVal})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Student Grid / List */}
      <View style={styles.grid}>
        {filteredList.length > 0 ? (
          filteredList.map((s) => (
            <View key={s.id} style={styles.cardWrapper}>
              <StudentCard student={s} onDelete={deleteAdmission} onSave={updateAdmission} navigation={navigation} />
            </View>
          ))
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No records found.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  filterCard: { backgroundColor: "#ffffff", borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  filterHeaderRow: { marginBottom: 8 },
  titleText: { fontSize: 14, fontWeight: "800", color: "#0f172a" },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#f1f5f9", borderRadius: 8, paddingHorizontal: 10, height: 38, marginBottom: 8 },
  searchInput: { flex: 1, fontSize: 12, color: "#0f172a", paddingVertical: 0 },
  branchTabsRow: { flexDirection: "row", gap: 6 },
  branchTab: { flex: 1, paddingVertical: 6, borderRadius: 6, backgroundColor: "#f1f5f9", alignItems: "center" },
  activeBranchTab: { backgroundColor: "#0284c7" },
  branchTabText: { fontSize: 10, fontWeight: "700", color: "#64748b" },
  activeBranchTabText: { color: "#ffffff" },
  grid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4 },
  cardWrapper: { width: width > 768 ? "50%" : "100%", paddingHorizontal: 4 },
  emptyBox: { padding: 40, alignItems: "center", width: "100%" },
  emptyText: { color: "#94a3b8", fontWeight: "600", fontSize: 12 },
});