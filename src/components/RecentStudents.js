// src/components/RecentStudents.js
import React, { useEffect, useState, useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { AuthContext } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { navigationRef } from "../services/NavigationService";

const COLORS = {
  primary: "#0284c7",
  primaryDark: "#0369a1",
  navy: "#0F172A",
  background: "#F4F7FB",
  white: "#FFFFFF",
  textDark: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
  blueLight: "#E0F2FE",
  green: "#10B981",
  greenLight: "#ECFDF5",
  red: "#EF4444",
  amber: "#F59E0B",
};

export default function RecentStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, role } = useContext(AuthContext);
  const navigation = useNavigation();

  const isAdmin =
    role === "admin" ||
    user?.email?.toLowerCase() === "hridesh027@gmail.com";

  const getOptimizedImg = (url) => {
    if (!url)
      return "https://ui-avatars.com/api/?name=Student&background=0284c7&color=fff";
    return url;
  };

  useEffect(() => {
    const q = query(
      collection(db, "admissions"),
      orderBy("createdAt", "desc"),
      limit(8)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setStudents(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Recent Students Sync Error:", err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  if (loading || students.length === 0) return null;

  const handleAdmission = () => {
    if (navigationRef.isReady()) {
      navigationRef.navigate("Admission");
    } else {
      navigation.navigate("Admission");
    }
  };

  const handleProfile = (email) => {
    if (!email) {
      console.warn("Student email missing for profile route");
      return;
    }
    if (navigationRef.isReady()) {
      navigationRef.navigate("StudentProfile", { email });
    } else {
      navigation.navigate("StudentProfile", { email });
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* ===== Header ===== */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>
            <Text style={styles.headerTitleAccent}>Our </Text>New Members
          </Text>
          <Text style={styles.headerSub}>Recently joined Drishtee family</Text>
        </View>

        <TouchableOpacity
          style={styles.admissionBtn}
          activeOpacity={0.85}
          onPress={handleAdmission}
        >
          <MaterialIcons name="add" size={13} color={COLORS.white} />
          <Text style={styles.admissionBtnText}>New Admission</Text>
        </TouchableOpacity>
      </View>

      {/* ===== Horizontal Scroll ===== */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {students.map((s) => {
          const studentName = s.name || s.fullName || "Unnamed Student";
          const isMainBranch = s.branch === "DIIT124" || s.branch === "Main";
          const branchLabel = isMainBranch ? "Main" : s.branch || "Branch";
          const branchColor = isMainBranch ? COLORS.primary : COLORS.amber;

          return (
            <View key={s.id || s.email} style={styles.card}>
              {/* ===== Image + Badge ===== */}
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: getOptimizedImg(s.photoUrl) }}
                  style={styles.studentImg}
                  resizeMode="cover"
                />

                {/* Gradient-like overlay at bottom for better badge contrast */}
                <View style={styles.imageOverlay} />

                <View
                  style={[
                    styles.branchBadge,
                    { backgroundColor: branchColor },
                  ]}
                >
                  <Text style={styles.branchBadgeText}>{branchLabel}</Text>
                </View>
              </View>

              {/* ===== Card Body ===== */}
              <View style={styles.cardBody}>
                {/* Name with verified icon */}
                <View style={styles.nameRow}>
                  <MaterialIcons
                    name="verified"
                    size={12}
                    color={COLORS.primary}
                  />
                  <Text
                    style={styles.studentName}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {studentName}
                  </Text>
                </View>

                {/* Course badge */}
                <View style={styles.courseBadge}>
                  <Text style={styles.courseBadgeText} numberOfLines={1}>
                    {s.course || "General Course"}
                  </Text>
                </View>

                {/* Action — admin sees button, others see verified */}
                {isAdmin ? (
                  <TouchableOpacity
                    style={styles.profileBtn}
                    activeOpacity={0.85}
                    onPress={() => handleProfile(s.email)}
                  >
                    <Text style={styles.profileBtnText}>View Profile</Text>
                    <MaterialIcons
                      name="arrow-forward"
                      size={11}
                      color={COLORS.white}
                    />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.verifiedBox}>
                    <MaterialCommunityIcons
                      name="shield-check"
                      size={11}
                      color={COLORS.green}
                    />
                    <Text style={styles.verifiedText}>Verified Student</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 14,
    backgroundColor: COLORS.background,
  },

  // ===== Header =====
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  titleContainer: {
    flex: 1,
    paddingRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.navy,
    letterSpacing: 0.2,
  },
  headerTitleAccent: {
    color: COLORS.red,
  },
  headerSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "600",
    marginTop: 2,
  },
  admissionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 11,
    gap: 3,
  },
  admissionBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  // ===== Scroll =====
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 4,
    gap: 12,
  },

  // ===== Card =====
  card: {
    width: 150,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)", // ✅ subtle, no dark shadow
  },

  // ===== Image =====
  imageWrapper: {
    height: 140,
    backgroundColor: COLORS.border,
    position: "relative",
  },
  studentImg: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: "rgba(0, 0, 0, 0.08)",
  },
  branchBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
  },
  branchBadgeText: {
    fontSize: 8.5,
    fontWeight: "900",
    color: COLORS.white,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },

  // ===== Card Body =====
  cardBody: {
    padding: 10,
    alignItems: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 5,
  },
  studentName: {
    fontSize: 11.5,
    fontWeight: "800",
    color: COLORS.textDark,
    flexShrink: 1,
  },
  courseBadge: {
    backgroundColor: COLORS.blueLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
    marginBottom: 8,
    maxWidth: "100%",
  },
  courseBadgeText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 0.2,
  },

  // ===== Profile Button =====
  profileBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    borderRadius: 9,
    gap: 4,
  },
  profileBtnText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: COLORS.white,
    letterSpacing: 0.2,
  },

  // ===== Verified Box =====
  verifiedBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: COLORS.greenLight,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
    width: "100%",
  },
  verifiedText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: COLORS.green,
    letterSpacing: 0.2,
  },
});