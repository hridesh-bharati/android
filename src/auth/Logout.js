import React, { useContext } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function Logout() {
  const { logout } = useContext(AuthContext);

  return (
    <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
      <MaterialIcons name="logout" size={18} color="#ef4444" />
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffeeef',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: '700',
    fontSize: 12,
  },
});