// src/dashboard/student/exams/StudentExamGreet.js
import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

export default function StudentExamGreet({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <MaterialIcons name="done-all" size={38} color="#10b981" />
        </View>

        <Text style={styles.title}>Examination Submitted!</Text>
        <Text style={styles.subtitle}>Your exam has been successfully submitted. You can now check your certificate status.</Text>

        <TouchableOpacity 
          style={styles.primaryBtn} 
          onPress={() => navigation.replace("CertificateNavigator")}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryBtnText}>CHECK CERTIFICATE STATUS</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryBtn} 
          onPress={() => navigation.navigate("StudentExamList")}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryBtnText}>BACK TO EXAM LIST</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: '#f8fafc' },
  card: { width: '100%', maxWidth: 380, backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', elevation: 3 },
  iconWrap: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#ecfdf5', justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#a7f3d0' },
  title: { fontSize: 18, fontWeight: '900', color: '#0f172a', marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 12, color: '#64748b', textAlign: 'center', fontWeight: '600', marginBottom: 24, lineHeight: 18 },
  primaryBtn: { width: '100%', height: 46, backgroundColor: '#0f172a', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10, elevation: 2 },
  primaryBtnText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  secondaryBtn: { width: '100%', height: 46, backgroundColor: '#fff', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e1' },
  secondaryBtnText: { color: '#334155', fontSize: 12, fontWeight: '900' }
});