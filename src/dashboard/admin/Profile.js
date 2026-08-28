import React, { useContext } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function Profile() {
  const { user } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image source={require('../../../assets/team1.avif')} style={styles.avatar} />
        <Text style={styles.name}>Administrator</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.badge}>
          <MaterialIcons name="admin-panel-settings" size={14} color="#0284c7" />
          <Text style={styles.badgeText}>Authorized Management</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8fafc' },
  card: { backgroundColor: '#ffffff', borderRadius: 20, padding: 24, alignItems: 'center', elevation: 3 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 14, borderWidth: 2, borderColor: '#bae6fd' },
  name: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  email: { fontSize: 12, color: '#64748b', marginTop: 4, marginBottom: 14 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f9ff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, gap: 4 },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#0284c7' },
});