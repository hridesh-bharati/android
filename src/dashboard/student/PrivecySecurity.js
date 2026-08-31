// src\dashboard\student\PrivecySecurity.js
import React, { useState, useContext } from "react";
import { 
  StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Platform 
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { auth, db } from "../../services/firebase"; // Aapke project ka firebase path
import { sendPasswordResetEmail, signOut } from "firebase/auth";
import { AuthContext } from "../../context/AuthContext";
import { CommonActions } from "@react-navigation/native";

// DRY Component for Settings Rows
const SettingItem = ({ icon, title, subtitle, onPress, variant = "#0284c7", isDanger = false, loading = false }) => (
  <TouchableOpacity
    style={styles.settingButton}
    onPress={onPress}
    activeOpacity={0.7}
    disabled={loading}
  >
    <View style={[styles.iconContainer, isDanger ? styles.dangerBg : styles.lightBg]}>
      {loading ? (
        <ActivityIndicator size="small" color={isDanger ? "#ef4444" : variant} />
      ) : (
        <MaterialIcons 
          name={icon} 
          size={22} 
          color={isDanger ? "#ef4444" : variant} 
        />
      )}
    </View>
    <View style={styles.textContainer}>
      <Text style={[styles.settingTitle, isDanger && styles.dangerText]}>{title}</Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </View>
    <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
  </TouchableOpacity>
);

export default function PrivecySecurity({ navigation }) {
  const { logout } = useContext(AuthContext);
  const user = auth.currentUser;
  const [resetLoading, setResetLoading] = useState(false);

  const handleAction = async (actionType) => {
    try {
      if (actionType === 'reset') {
        if (!user?.email) {
          Alert.alert("Error", "No user email found.");
          return;
        }
        setResetLoading(true);
        await sendPasswordResetEmail(auth, user.email);
        Alert.alert("Success", "Password reset link has been sent to your email!");
      } else if (actionType === 'logout') {
        Alert.alert(
          "Logout",
          "Are you sure you want to sign out?",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Logout", 
              style: "destructive",
              onPress: async () => {
                if (logout) {
                  await logout();
                } else {
                  await signOut(auth);
                }
                // Reset navigation stack to Login screen
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  })
                );
              }
            }
          ]
        );
      }
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Security & Help</Text>
        
        <View style={styles.emailRow}>
          <Text style={styles.emailLabel}>Email ID:</Text>
          <Text style={styles.emailVal} numberOfLines={1}>{user?.email || "Not Available"}</Text>
        </View>

        <SettingItem
          icon="lock-outline" 
          title="Password Reset" 
          subtitle="Send password reset link to email"
          onPress={() => handleAction('reset')}
          loading={resetLoading}
        />

        <SettingItem
          icon="headset-mic"
          title="Support & Contact"
          subtitle="Get help from our support team"
          variant="#0284c7"
          onPress={() => navigation.navigate('ContactUs')}
        />

        <Text style={[styles.sectionHeader, { marginTop: 20 }]}>Account Management</Text>

        <SettingItem
          icon="logout" 
          title="Logout" 
          subtitle="Safe sign out from device" 
          isDanger
          onPress={() => handleAction('logout')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#F8FAFC",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "900",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  emailLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0369A1",
    marginRight: 6,
  },
  emailVal: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
  },
  settingButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    elevation: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  lightBg: {
    backgroundColor: "#F0F9FF",
  },
  dangerBg: {
    backgroundColor: "#FEF2F2",
  },
  textContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  dangerText: {
    color: "#EF4444",
  },
  settingSubtitle: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
    marginTop: 2,
  },
});