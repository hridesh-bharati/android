// src/dashboard/student/StudentSidebar.js
import React from "react";
import {
  StyleSheet, Text, View, Modal, TouchableOpacity,
  ScrollView, Dimensions, Platform
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { auth } from "../../services/firebase";

const { width, height } = Dimensions.get("window");

const MENU_ITEMS = [
  { id: "dashboard", route: "Dashboard", icon: "dashboard", label: "Dashboard", color: "#0866ff" },
  { id: "exams", route: "ExamNavigator", icon: "assignment", label: "Main Exams", color: "#f3425f" },
  { id: "practice", route: "PracticeNavigator", icon: "quiz", label: "Practice Test", color: "#2abba7" },
  { id: "profile", route: "Profile", icon: "person", label: "My Profile", color: "#1877f2" },
  { id: "certificate", route: "CertificateNavigator", icon: "card-membership", label: "Certificates", color: "#f7b928" },
  { id: "account", route: "PrivecySecurity", icon: "security", label: "Privacy & Security", color: "#607d8b" },
];

export default function StudentSidebar({ open, setOpen, navigation, activeTab, setActiveTab }) {

  const handleMenuPress = (item) => {
    setOpen(false);
    if (navigation && item.route) {
      navigation.navigate(item.route);
    }
    if (setActiveTab) {
      setActiveTab(item.id);
    }
  };

  const handleLogout = async () => {
    try {
      setOpen(false);
      await auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <Modal
      visible={open}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setOpen(false)}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        />

        <View style={styles.drawerContainer}>
          <View style={styles.drawerHeader}>
            <View style={styles.headerTitleRow}>
              <View style={styles.appIconBox}>
                <MaterialIcons name="school" size={22} color="#0284c7" />
              </View>
              <Text style={styles.drawerTitle}>Student Portal</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setOpen(false)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="close" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.menuScroll}
          >
            <Text style={styles.menuSectionLabel}>Main Menu</Text>
            {MENU_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.menuItem, isActive && styles.activeMenuItem]}
                  onPress={() => handleMenuPress(item)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: `${item.color}15` }
                    ]}
                  >
                    <MaterialIcons name={item.icon} size={20} color={item.color} />
                  </View>
                  <Text style={[styles.menuText, isActive && styles.activeMenuText]}>
                    {item.label}
                  </Text>
                  {isActive && <View style={styles.activeIndicator} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.drawerFooter}>
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <View style={styles.logoutIconBox}>
                <MaterialIcons name="logout" size={18} color="#ef4444" />
              </View>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(15, 23, 42, 0.5)",
  },
  backdrop: {
    flex: 1,
  },
  drawerContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.78,
    backgroundColor: "#ffffff",
    paddingTop: Platform.OS === 'ios' ? 48 : 24,
    elevation: 16,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  appIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: 0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  menuScroll: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  menuSectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginHorizontal: 8,
    marginBottom: 8,
    marginTop: 6,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 4,
    position: "relative",
  },
  activeMenuItem: {
    backgroundColor: "#f0f9ff",
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
  activeMenuText: {
    color: "#0284c7",
    fontWeight: "900",
  },
  activeIndicator: {
    position: "absolute",
    right: 0,
    width: 4,
    height: 20,
    backgroundColor: "#0284c7",
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  drawerFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    backgroundColor: "#ffffff",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fee2e2",
  },
  logoutIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ef4444",
  },
});