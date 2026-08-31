// src/dashboard/admin/practice/AdminPracticeDashboard.js
import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const COLORS = {
  primary: '#071e3d',
  secondary: '#0284c7',
  accent: '#38bdf8',
  danger: '#ff0000',
  white: '#ffffff',
  lightGray: '#cbd5e1',
  gray: '#94a3b8',
  darkGray: '#1e293b',
};

const FONTS = {
  bold: 'System',
  regular: 'System',
};

export default function AdminPracticeDashboard({ navigation }) {
  const cards = [
    {
      title: "Upload Test & Assign",
      subtitle: "Create papers & manage students",
      screen: "AdminPracticeUpload",
      icon: "cloud-upload",
      bg: "#e0f2fe",
      color: COLORS.secondary,
    },
    {
      title: "Live Monitoring",
      subtitle: "Track active students live",
      screen: "AdminPracticeLive",
      icon: "sensors",
      bg: "#fee2e2",
      color: COLORS.danger,
    },
    {
      title: "Test Results",
      subtitle: "Review scores & analytics",
      screen: "AdminPracticeResults",
      icon: "bar-chart",
      bg: "#d1fae5",
      color: "#059669",
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerBanner}>
        <Text style={styles.headerTitle}>Practice Management</Text>
        <Text style={styles.headerSubtitle}>Control panels and student analytics</Text>
      </View>
      
      <View style={styles.grid}>
        {cards.map((card, i) => (
          <TouchableOpacity
            key={i}
            style={styles.card}
            onPress={() => navigation.navigate(card.screen)}
            activeOpacity={0.75}
          >
            <View style={[styles.iconBox, { backgroundColor: card.bg }]}>
              <MaterialIcons name={card.icon} size={26} color={card.color} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardSub}>{card.subtitle}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={COLORS.gray} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f0f6ff', padding: 16 },
  headerBanner: { backgroundColor: COLORS.white, borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2 },
  headerTitle: { fontSize: 17, fontFamily: FONTS.bold, fontWeight: '900', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 12, fontFamily: FONTS.regular, color: COLORS.gray, fontWeight: '700', marginTop: 2 },
  grid: { gap: 12 },
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', elevation: 3, shadowColor: COLORS.secondary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10 },
  iconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  textContainer: { flex: 1, marginLeft: 14 },
  cardTitle: { fontSize: 14, fontFamily: FONTS.bold, fontWeight: '900', color: COLORS.darkGray },
  cardSub: { fontSize: 11, fontFamily: FONTS.regular, color: COLORS.gray, fontWeight: '700', marginTop: 2 }
});