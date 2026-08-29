// src/dashboard/admin/AdminDashboard.js
import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AdminSidebar from './Sidebar';
import AdminDashboardContent from './Dashboard';
import AdminProfileContent from './Profile';
import StudentManagement from './studentManagement/StudentManagement';
import StudentProfile from './studentManagement/StudentProfile';
import AdmissionProvider from './studentManagement/AdmissionProvider'; 
import AdaptiveAdminQueries from './Queries/AdaptiveAdminQueries'; 
import Logout from '../../auth/Logout';

const { width } = Dimensions.get('window');
const isDesktopWeb = width > 768;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(isDesktopWeb);
  const [studentRouteParams, setStudentRouteParams] = useState(null);

  const handleNavigate = (screenName, params) => {
    if (screenName === 'StudentProfile') {
      setStudentRouteParams(params);
      setActiveTab('StudentProfile');
    } else {
      setStudentRouteParams(null);
      setActiveTab(screenName);
    }
  };

  const renderContent = () => {
    if (activeTab === 'StudentProfile') {
      return (
        <AdmissionProvider>
          <StudentProfile 
            route={{ params: studentRouteParams }} 
            navigation={{ goBack: () => setActiveTab('dashboard') }} 
          />
        </AdmissionProvider>
      );
    }

    switch (activeTab) {
      case 'admitted':
        return (
          <AdmissionProvider>
            <StudentManagement viewMode="admitted" />
          </AdmissionProvider>
        );
      case 'new_adm':
        return (
          <AdmissionProvider>
            <StudentManagement viewMode="new_adm" />
          </AdmissionProvider>
        );
      case 'queries': // 👈 Admin Inbox Queries Case Added
        return <AdaptiveAdminQueries />;
      case 'profile':
      case 'admin_list':
      case 'admin_profile':
        return <AdminProfileContent />;
      default:
        return (
          <AdmissionProvider>
            <AdminDashboardContent activeTab={activeTab} onNavigate={handleNavigate} />
          </AdmissionProvider>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            onPress={() => {
              if (activeTab === 'StudentProfile') {
                setActiveTab('dashboard');
              } else {
                setSidebarOpen(!sidebarOpen);
              }
            }} 
            style={styles.menuToggleBtn} 
            activeOpacity={0.7}
          >
            <MaterialIcons 
              name={activeTab === 'StudentProfile' ? "arrow-back" : (sidebarOpen && !isDesktopWeb ? "close" : "menu")} 
              size={24} 
              color="#0f172a" 
            />
          </TouchableOpacity>
          <View style={styles.titleRow}>
            <View style={styles.headerIconWrapper}>
              <MaterialCommunityIcons name="shield-account" size={18} color="#0284c7" />
            </View>
            <Text style={styles.headerTitle}>
              {activeTab === 'StudentProfile' ? "Student Profile" : activeTab === 'queries' ? "Query Inbox" : "Admin Console"}
            </Text>
          </View>
        </View>
        <Logout />
      </View>

      <View style={styles.mainLayout}>
        <AdminSidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setStudentRouteParams(null);
            setActiveTab(tab);
          }} 
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
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuToggleBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
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