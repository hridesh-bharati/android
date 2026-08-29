// src/components/RecentStudents.js
import React, { useEffect, useState, useContext } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import { AuthContext } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { navigationRef } from "../services/NavigationService";

const COLORS = {
  primary: "#0284c7",
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
};

export default function RecentStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, role } = useContext(AuthContext);
  const navigation = useNavigation();

  const isAdmin = role === 'admin' || user?.email?.toLowerCase() === 'hridesh027@gmail.com';

  const getOptimizedImg = (url) => {
    if (!url) return "https://ui-avatars.com/api/?name=Student&background=0284c7&color=fff";
    return url;
  };

  useEffect(() => {
    const q = query(collection(db, "admissions"), orderBy("createdAt", "desc"), limit(8));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      console.error("Recent Students Sync Error:", err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading || students.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      {/* Header Section */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>
            <Text style={{ color: COLORS.red }}>Our </Text>New Members
          </Text>
          <Text style={styles.headerSub}>Recently joined Drishtee family</Text>
        </View>
        <TouchableOpacity 
          style={styles.admissionBtn} 
          activeOpacity={0.8}
          onPress={() => {
            if (navigationRef.isReady()) {
              navigationRef.navigate("Admission");
            } else {
              navigation.navigate("Admission");
            }
          }}
        >
          <Text style={styles.admissionBtnText}>+ New Admission</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Scroll Area */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContainer}
      >
        {students.map((s) => {
          const studentName = s.name || s.fullName || "Unnamed Student";
          const isMainBranch = s.branch === "DIIT124" || s.branch === "Main";

          return (
            <View key={s.id || s.email} style={styles.card}>
              {/* Student Image & Branch Badge */}
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: getOptimizedImg(s.photoUrl) }}
                  style={styles.studentImg}
                  resizeMode="cover"
                />
                <View style={[styles.branchBadge, { backgroundColor: isMainBranch ? COLORS.primary : '#F59E0B' }]}>
                  <Text style={styles.branchBadgeText}>
                    {isMainBranch ? "Main" : (s.branch || "Branch")}
                  </Text>
                </View>
              </View>

              {/* Card Body */}
              <View style={styles.cardBody}>
                <View style={styles.nameRow}>
                  <MaterialIcons name="verified" size={12} color={COLORS.primary} />
                  <Text style={styles.studentName} numberOfLines={1}>{studentName}</Text>
                </View>

                <View style={styles.courseBadge}>
                  <Text style={styles.courseBadgeText} numberOfLines={1}>
                    {s.course || "General Course"}
                  </Text>
                </View>

                {isAdmin ? (
                  <TouchableOpacity
                    style={styles.profileBtn}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (s.email) {
                        if (navigationRef.isReady()) {
                          navigationRef.navigate("StudentProfile", { email: s.email });
                        } else {
                          navigation.navigate("StudentProfile", { email: s.email });
                        }
                      } else {
                        console.warn("Student email missing for profile route");
                      }
                    }}
                  >
                    <Text style={styles.profileBtnText}>View Profile</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.verifiedBox}>
                    <MaterialCommunityIcons name="shield-check" size={11} color={COLORS.green} />
                    <Text style={styles.verifiedText}>Verified</Text>
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
    backgroundColor: COLORS.background 
  },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    marginBottom: 12 
  },
  titleContainer: { 
    flex: 1, 
    paddingRight: 8 
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '900', 
    color: COLORS.navy 
  },
  headerSub: { 
    fontSize: 11, 
    color: COLORS.textMuted, 
    fontWeight: '600', 
    marginTop: 2 
  },
  admissionBtn: { 
    backgroundColor: COLORS.primary, 
    paddingHorizontal: 12, 
    paddingVertical: 7, 
    borderRadius: 12, 
    elevation: 2 
  },
  admissionBtnText: { 
    color: COLORS.white, 
    fontSize: 11, 
    fontWeight: '800' 
  },
  scrollContainer: { 
    paddingHorizontal: 16, 
    gap: 10 
  },
  card: { 
    width: 145, 
    backgroundColor: COLORS.white, 
    borderRadius: 18, 
    overflow: 'hidden', 
    borderWidth: 2, 
    borderColor: '#FFFFFF', 
    elevation: 3 
  },
  imageWrapper: { 
    height: 130, 
    backgroundColor: COLORS.border 
  },
  studentImg: { 
    width: '100%', 
    height: '100%' 
  },
  branchBadge: { 
    position: 'absolute', 
    top: 6, 
    right: 6, 
    paddingHorizontal: 6, 
    paddingVertical: 2, 
    borderRadius: 6, 
    backgroundColor: COLORS.primary 
  },
  branchBadgeText: { 
    fontSize: 8, 
    fontWeight: '800', 
    color: COLORS.white 
  },
  cardBody: { 
    padding: 8, 
    alignItems: 'center' 
  },
  nameRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 3, 
    marginBottom: 4 
  },
  studentName: { 
    fontSize: 11, 
    fontWeight: '800', 
    color: COLORS.textDark 
  },
  courseBadge: { 
    backgroundColor: COLORS.blueLight, 
    paddingHorizontal: 6, 
    paddingVertical: 2, 
    borderRadius: 6, 
    marginBottom: 6 
  },
  courseBadgeText: { 
    fontSize: 9, 
    fontWeight: '700', 
    color: COLORS.primary 
  },
  profileBtn: { 
    width: '100%', 
    backgroundColor: COLORS.primary, 
    paddingVertical: 5, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  profileBtnText: { 
    fontSize: 10, 
    fontWeight: '800', 
    color: COLORS.white 
  },
  verifiedBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 3, 
    backgroundColor: COLORS.greenLight, 
    paddingHorizontal: 6, 
    paddingVertical: 3, 
    borderRadius: 6 
  },
  verifiedText: { 
    fontSize: 9, 
    fontWeight: '800', 
    color: COLORS.green 
  },
});