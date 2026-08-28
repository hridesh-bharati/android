import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Logout from '../../auth/Logout';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'home', label: 'Dashboard', icon: 'dashboard' },
    { id: 'profile', label: 'My Profile', icon: 'person' },
  ];

  return (
    <View style={styles.sidebar}>
      <View style={styles.topSection}>
        <Text style={styles.brand}>Drishtee Student</Text>
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, isActive && styles.activeItem]}
              onPress={() => setActiveTab(item.id)}
            >
              <MaterialIcons name={item.icon} size={20} color={isActive ? '#0284c7' : '#64748b'} />
              <Text style={[styles.menuText, isActive && styles.activeText]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.bottomSection}>
        <Logout />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: { width: 220, backgroundColor: '#ffffff', paddingVertical: 24, paddingHorizontal: 16, justifyContent: 'space-between', borderRightWidth: 1, borderRightColor: '#e2e8f0' },
  topSection: { gap: 8 },
  brand: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 20, paddingHorizontal: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 10, gap: 10 },
  activeItem: { backgroundColor: '#f0f9ff' },
  menuText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  activeText: { color: '#0284c7', fontWeight: '700' },
  bottomSection: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16 },
});