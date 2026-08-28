// src/dashboard/admin/AdminDashboard.js
import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AdminSidebar from './Sidebar';
import AdminDashboardContent from './Dashboard';
import AdminProfileContent from './Profile';
import StudentManagement from './studentManagement/StudentManagement';
import Logout from '../../auth/Logout';

const { width } = Dimensions.get('window');
const isDesktopWeb = width > 768;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(isDesktopWeb);

  const renderContent = () => {
    switch (activeTab) {
      case 'admitted':
        return <StudentManagement viewMode="admitted" />;
      case 'new_adm':
        return <StudentManagement viewMode="new_adm" />;
      case 'profile':
      case 'admin_list':
      case 'admin_profile':
        return <AdminProfileContent />;
      default:
        return <AdminDashboardContent activeTab={activeTab} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Native Android Top Header / App Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            onPress={() => setSidebarOpen(!sidebarOpen)} 
            style={styles.menuToggleBtn} 
            activeOpacity={0.7}
          >
            {/* Conditional Icon: Sidebar khula hone par 'close', band hone par 'menu' */}
            <MaterialIcons 
              name={sidebarOpen && !isDesktopWeb ? "close" : "menu"} 
              size={26} 
              color="#071e3d" 
            />
          </TouchableOpacity>
          <View style={styles.titleRow}>
            <MaterialCommunityIcons name="shield-account" size={22} color="#0284c7" />
            <Text style={styles.headerTitle}>Admin Console</Text>
          </View>
        </View>
        <Logout />
      </View>

      <View style={styles.mainLayout}>
        <AdminSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          isDesktopWeb={isDesktopWeb} 
        />
        <View style={styles.contentArea}>
          {renderContent()}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerBar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuToggleBtn: {
    padding: 4,
    borderRadius: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#071e3d',
    letterSpacing: 0.3,
  },
  mainLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
});