// src/dashboard/student/StudentDashboard.js
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator, Platform } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { collection, query, orderBy, onSnapshot, doc } from "firebase/firestore";
import { db, auth } from "../../services/firebase";
import { printSingleReceipt, getFeeLogic } from "../admin/studentManagement/fees/FeeServices";
import AttendanceCard from "./AttendanceCard";
import Profile from "./Profile";
import CoursesScreen from "../../screens/CoursesScreen";
import StudentSidebar from "./StudentSidebar";
import { COLORS, FONTS } from "../../constants/theme";

export default function StudentDashboard({ navigation }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubStudent = () => {};
    let unsubPay = () => {};

    const user = auth.currentUser;
    const email = user?.email || "";

    if (!email) {
      setLoading(false);
      return;
    }

    const emailId = email.toLowerCase().trim();

    // Student Admission Profile Listener
    const studentDocRef = doc(db, "admissions", emailId);
    unsubStudent = onSnapshot(studentDocRef, (snap) => {
      if (snap.exists()) {
        setData({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    }, (err) => {
      console.error("Student Data Error:", err);
      setLoading(false);
    });

    // Payments Listener
    const payQ = query(
      collection(db, "admissions", emailId, "payments"),
      orderBy("date", "desc")
    );

    unsubPay = onSnapshot(payQ, (pSnap) => {
      const payList = pSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPayments(payList);
    }, (err) => {
      console.error("Payments Listen Error:", err);
    });

    return () => {
      unsubStudent();
      unsubPay();
    };
  }, []);

  const totalPaid = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const summary = getFeeLogic(data?.course, payments) || { balance: 0, netFee: 0 };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Water Glassmorphism Top App Header */}
      <View style={styles.appHeader}>
        <TouchableOpacity 
          style={styles.menuIconBtn} 
          onPress={() => setSidebarOpen(true)}
          activeOpacity={0.7}
        >
          <MaterialIcons name="menu" size={22} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.appHeaderTitle}>
          {activeTab === 'dashboard' ? 'Student Dashboard' : activeTab === 'profile' ? 'My Profile' : 'Courses'}
        </Text>
        <View style={styles.headerRightBadge}>
          <MaterialIcons name="verified" size={18} color={COLORS.secondary} />
        </View>
      </View>

      {/* Sliding Drawer Sidebar Component */}
      <StudentSidebar 
        open={sidebarOpen} 
        setOpen={setSidebarOpen} 
        navigation={navigation} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {activeTab === 'profile' ? (
          <Profile />
        ) : activeTab === 'courses' ? (
          <CoursesScreen navigation={navigation} />
        ) : (
          <ScrollView contentContainerStyle={styles.homeScroll} showsVerticalScrollIndicator={false}>
            {/* Water Glassmorphism Blue Header Section */}
            <View style={styles.blueHeader}>
              <View style={styles.waterGlassWave1} />
              <View style={styles.waterGlassWave2} />
              <View style={styles.waterGlassBlob} />

              <View style={styles.headerProfileRow}>
                <View style={styles.avatarBox}>
                  <Image
                    source={{ uri: data?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(data?.name || 'User')}&background=071e3d&color=fff&bold=true` }}
                    style={styles.headerAvatar}
                  />
                  <View style={styles.onlineDot} />
                </View>
                <View style={styles.headerNameCol}>
                  <Text style={styles.headerName}>{data?.name || "Student"}</Text>
                  <Text style={styles.headerReg}>{data?.regNo || "drishteeindia.com"}</Text>
                </View>
                <TouchableOpacity style={styles.notifBtn} activeOpacity={0.8}>
                  <MaterialIcons name="notifications-none" size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>

              <View style={styles.installmentCard}>
                <View>
                  <Text style={styles.installLabel}>Next Installment</Text>
                  <Text style={styles.installVal}>
                    ₹{summary?.balance > 0 ? (data?.monthlyFee || summary?.monthly || 0) : "0"}
                  </Text>
                </View>
                <TouchableOpacity style={styles.payBtn} onPress={() => alert("Online payment coming soon!")} activeOpacity={0.8}>
                  <Text style={styles.payBtnText}>Pay Now</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Attendance Matrix Widget */}
            <View style={{ paddingHorizontal: 16 }}>
              <AttendanceCard />

              {/* Stats Section */}
              <View style={styles.statsRow}>
                <View style={[styles.statCardBox, { borderLeftColor: COLORS.secondary }]}>
                  <Text style={styles.statCardLabel}>Total Fee</Text>
                  <Text style={styles.statCardVal}>₹{summary?.netFee || 0}</Text>
                </View>
                <View style={[styles.statCardBox, { borderLeftColor: '#10b981' }]}>
                  <Text style={styles.statCardLabel}>Paid</Text>
                  <Text style={[styles.statCardVal, { color: '#10b981' }]}>₹{totalPaid}</Text>
                </View>
                <View style={[styles.statCardBox, { borderLeftColor: COLORS.danger }]}>
                  <Text style={styles.statCardLabel}>Dues</Text>
                  <Text style={[styles.statCardVal, { color: COLORS.danger }]}>₹{summary?.balance || 0}</Text>
                </View>
              </View>

              {/* Recent Transactions Section */}
              <View style={styles.txHeaderRow}>
                <Text style={styles.txTitle}>Recent Transactions</Text>
                <View style={styles.txBadge}><Text style={styles.txBadgeText}>{payments.length} Records</Text></View>
              </View>

              <View style={styles.txCard}>
                {payments.length > 0 ? (
                  payments.map((p) => (
                    <View key={p.id} style={styles.txItem}>
                      <View style={styles.txIconWrap}>
                        <MaterialIcons name="receipt" size={20} color={COLORS.secondary} />
                      </View>
                      <View style={{ flex: 1, marginHorizontal: 10 }}>
                        <Text style={styles.txNote} numberOfLines={1}>{p.note || "Tuition Fee"}</Text>
                        <Text style={styles.txSub}>{p.date} • <Text style={{ textTransform: 'uppercase' }}>{p.method || 'Cash'}</Text></Text>
                      </View>
                      <View style={styles.txRight}>
                        <Text style={styles.txAmount}>₹{p.amount}</Text>
                        <TouchableOpacity style={styles.printBtn} onPress={() => printSingleReceipt(data, p, summary)} activeOpacity={0.7}>
                          <MaterialIcons name="print" size={14} color={COLORS.darkGray} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyBox}>
                    <MaterialIcons name="inbox" size={40} color={COLORS.lightGray} style={{ marginBottom: 6 }} />
                    <Text style={styles.emptyText}>No payment history found.</Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'column', backgroundColor: '#f0f4f8' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f8' },
  loadingText: { marginTop: 8, fontSize: 12, fontWeight: '700', color: COLORS.gray, fontFamily: FONTS.regular },
  
  appHeader: {
    height: 58,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.95)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  menuIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(240, 249, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(2, 132, 199, 0.2)',
  },
  appHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.4,
    fontFamily: FONTS.bold,
  },
  headerRightBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(2, 132, 199, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(2, 132, 199, 0.15)',
  },

  mainContent: { flex: 1 },
  homeScroll: { paddingBottom: 40 },

  blueHeader: { 
    backgroundColor: COLORS.primary, 
    padding: 20, 
    borderBottomLeftRadius: 28, 
    borderBottomRightRadius: 28, 
    marginBottom: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  waterGlassWave1: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  waterGlassWave2: {
    position: 'absolute',
    bottom: -20,
    left: 40,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(2, 132, 199, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  waterGlassBlob: {
    position: 'absolute',
    top: 15,
    right: 90,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  headerProfileRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, zIndex: 2 },
  avatarBox: { position: 'relative' },
  headerAvatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 3, borderColor: 'rgba(255, 255, 255, 0.9)' },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: '#057642', borderWidth: 2, borderColor: '#fff' },
  headerNameCol: { flex: 1, marginLeft: 12 },
  headerName: { fontSize: 17, fontWeight: '800', color: COLORS.white, fontFamily: FONTS.bold },
  headerReg: { fontSize: 11.5, color: COLORS.accent, fontWeight: '600', marginTop: 1, fontFamily: FONTS.regular },
  notifBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255, 255, 255, 0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.25)' },

  installmentCard: { backgroundColor: 'rgba(255, 255, 255, 0.12)', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.22)', zIndex: 2 },
  installLabel: { fontSize: 9.5, fontWeight: '800', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', fontFamily: FONTS.bold },
  installVal: { fontSize: 18, fontWeight: '900', color: '#fbbf24', marginTop: 2, fontFamily: FONTS.bold },
  payBtn: { backgroundColor: '#fbbf24', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, elevation: 3 },
  payBtnText: { fontSize: 12, fontWeight: '900', color: COLORS.primary, fontFamily: FONTS.bold },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statCardBox: { flex: 1, backgroundColor: '#ffffff', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderLeftWidth: 4, elevation: 2 },
  statCardLabel: { fontSize: 10, fontWeight: '800', color: COLORS.gray, textTransform: 'uppercase', marginBottom: 2, fontFamily: FONTS.bold },
  statCardVal: { fontSize: 14, fontWeight: '900', color: COLORS.darkGray, fontFamily: FONTS.bold },

  txHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingHorizontal: 4 },
  txTitle: { fontSize: 14, fontWeight: '900', color: COLORS.darkGray, fontFamily: FONTS.bold },
  txBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  txBadgeText: { fontSize: 10, fontWeight: '800', color: COLORS.gray, fontFamily: FONTS.bold },

  txCard: { backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0', elevation: 2 },
  txItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  txIconWrap: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#f0f9ff', justifyContent: 'center', alignItems: 'center' },
  txNote: { fontSize: 12, fontWeight: '800', color: COLORS.darkGray, fontFamily: FONTS.bold },
  txSub: { fontSize: 10, color: COLORS.gray, fontWeight: '600', marginTop: 1, fontFamily: FONTS.regular },
  txRight: { alignItems: 'flex-end', gap: 4 },
  txAmount: { fontSize: 13, fontWeight: '900', color: '#10b981', fontFamily: FONTS.bold },
  printBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },

  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 12, fontWeight: '700', color: COLORS.lightGray, fontFamily: FONTS.bold }
});