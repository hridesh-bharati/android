// src/dashboard/admin/AdminDashboard.js
import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AdminSidebar from './Sidebar';
import AdminDashboardContent from './Dashboard';
import AdminProfileContent from './system/Profile';
import StudentManagement from './studentManagement/StudentManagement';
import StudentProfile from './studentManagement/StudentProfile';
import AdmissionProvider from './studentManagement/AdmissionProvider'; 
import AdaptiveAdminQueries from './Queries/AdaptiveAdminQueries'; 
import ExamNavigator from './examManagement/ExamNavigator';
import AdminPracticeNavigator from './practice/AdminPracticeNavigator'; 
import NotesUpload from './notes/NotesUpload';
import GalleryScreen from '../../components/gallery/GalleryScreen'; 
import CreateOffer from './offers/CreateOffer';
import DeleteOffer from './offers/DeleteOffer';

// 🚀 Imported AdminList System Component
import AdminList from './system/AdminList';

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
      case 'queries': 
        return <AdaptiveAdminQueries />;
      case 'exams': 
        return <ExamNavigator />;
      case 'tests':
        return <AdminPracticeNavigator />;
      case 'notes_upload':
        return <NotesUpload />;
      case 'gallery':
        return <GalleryScreen navigation={{ navigate: handleNavigate }} />;
      case 'create_offers':
        return <CreateOffer navigation={{ navigate: setActiveTab }} />;
      case 'delete_offers':
        return <DeleteOffer />;
      case 'admin_list':
        return <AdminList />;  
      case 'profile':
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

  const getHeaderTitle = () => {
    switch(activeTab) {
      case 'StudentProfile': return "Student Profile";
      case 'queries': return "Query Inbox";
      case 'exams': return "Examinations";
      case 'tests': return "Practice Tests";
      case 'notes_upload': return "Upload Notes & PDFs";
      case 'gallery': return "Manage Gallery";
      case 'create_offers': return "Create Live Offer";
      case 'delete_offers': return "Manage Live Offers";
      case 'admin_list': return "System Admins";
      case 'admitted': return "Admitted Students";
      case 'new_adm': return "New Admissions";
      default: return "Admin Console";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.bgGlowOrbTopLeft} />
      <View style={styles.bgGlowOrbBottomRight} />

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
              size={22} 
              color="#0F172A" 
            />
          </TouchableOpacity>
          <View style={styles.titleRow}>
            <View style={styles.headerIconWrapper}>
              <MaterialCommunityIcons name="shield-account" size={18} color="#0EA5E9" />
            </View>
            <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
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
  container: { flex: 1, backgroundColor: '#F0F6FF', position: 'relative', overflow: 'hidden' },
  bgGlowOrbTopLeft: { position: 'absolute', top: -80, left: -60, width: 320, height: 320, borderRadius: 160, backgroundColor: '#38BDF8', opacity: 0.25, transform: [{ scale: 1.5 }] },
  bgGlowOrbBottomRight: { position: 'absolute', bottom: -80, right: -60, width: 340, height: 340, borderRadius: 170, backgroundColor: '#34D399', opacity: 0.2 },
  headerBar: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255, 255, 255, 0.85)', paddingHorizontal: 16, borderBottomWidth: 2, borderBottomColor: '#FFFFFF', elevation: 8, shadowColor: '#0EA5E9', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, zIndex: 10 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuToggleBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIconWrapper: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#E0F2FE', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#BAE6FD' },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#0F172A', letterSpacing: 0.3 },
  mainLayout: { flex: 1, flexDirection: 'row', backgroundColor: 'transparent' },
  contentArea: { flex: 1, backgroundColor: 'transparent' },
});