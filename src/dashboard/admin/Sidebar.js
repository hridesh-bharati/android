// src/dashboard/admin/Sidebar.js
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Logout from '../../auth/Logout';

export default function AdminSidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, isDesktopWeb }) {
  const menuSections = [
    {
      title: 'MANAGEMENT',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'view-dashboard-outline', color: '#2563eb' },
        { id: 'admitted', label: 'Admitted Students', icon: 'account-group-outline', color: '#059669' },
        { id: 'new_adm', label: 'New Admissions', icon: 'account-plus-outline', color: '#0284c7' },
        { id: 'queries', label: 'Inbox (Queries)', icon: 'message-processing-outline', color: '#7c3aed' },
        { id: 'exams', label: 'Examinations', icon: 'file-document-edit-outline', color: '#db2777' },  
        { id: 'tests', label: 'Practice Tests', icon: 'format-list-checks', color: '#0d9488' }, 
      ]
    },
    {
      title: 'MARKETING & CONTENT',
      items: [
        { id: 'notes_upload', label: 'Upload Notes', icon: 'file-pdf-box', color: '#dc2626' },
        { id: 'gallery', label: 'Gallery', icon: 'image-album', color: '#0284c7' },
        { id: 'create_offers', label: 'Create Offers', icon: 'tag-plus-outline', color: '#059669' },
        { id: 'delete_offers', label: 'Delete Offers', icon: 'tag-remove-outline', color: '#e11d48' },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'admin_list', label: 'Admin List', icon: 'shield-account-outline', color: '#7c3aed' },
        { id: 'admin_profile', label: 'Admin Account', icon: 'account-cog-outline', color: '#475569' },
      ]
    }
  ];

  if (!isDesktopWeb && !sidebarOpen) return null;

  return (
    <View style={[styles.sidebar, !isDesktopWeb && styles.floatingSidebar]}>
      <View style={styles.sidebarHeader}>
        <View style={styles.logoRow}>
          <Image source={require('../../../assets/logo.png')} style={styles.brandLogo} resizeMode="contain" />
          <View style={styles.brandTextContainer}>
            <Text style={styles.sidebarBrand}>
              DRIS<Text style={{ color: '#0284c7' }}>HTEE</Text>
            </Text>
            <Text style={styles.sidebarBrandSub}>COMPUTER CENTRE</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sidebarScroll}>
        {menuSections.map((section, idx) => (
          <View key={idx} style={styles.menuSection}>
            <Text style={styles.sectionHeaderTitle}>{section.title}</Text>
            {section.items.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.drawerItem, isActive && styles.activeDrawerItem]}
                  onPress={() => {
                    setActiveTab(item.id);
                    if (!isDesktopWeb) setSidebarOpen(false);
                  }}
                  activeOpacity={0.75}
                >
                  <View style={[styles.iconWrapper, { backgroundColor: item.color + '18' }]}>
                    <MaterialCommunityIcons name={item.icon} size={20} color={item.color} />
                  </View>
                  <Text style={[styles.drawerItemText, isActive && styles.activeDrawerText]}>{item.label}</Text>
                  {item.badge && (
                    <View style={styles.badgeContainer}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        <View style={styles.sidebarFooter}>
          <View style={styles.logoutWrapper}>
            <Logout />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: { 
    width: 270, 
    backgroundColor: '#ffffff', 
    borderRightWidth: 1, 
    borderRightColor: '#e2e8f0', 
    paddingVertical: 12,
    elevation: 4,
  },
  floatingSidebar: { position: 'absolute', top: 0, bottom: 0, left: 0, zIndex: 100, elevation: 25 },
  sidebarHeader: { 
    paddingHorizontal: 16, 
    paddingBottom: 14, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f5f9', 
    marginBottom: 8 
  },
  logoRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10 
  },
  brandLogo: { 
    width: 38, 
    height: 38, 
    borderRadius: 10 
  },
  sidebarBrand: { 
    fontSize: 14, 
    fontWeight: '900', 
    color: '#071e3d', 
    letterSpacing: 0.5 
  },
  sidebarBrandSub: { 
    fontSize: 9, 
    fontWeight: '800', 
    color: '#0284c7', 
    letterSpacing: 0.8 
  },
  sidebarScroll: { paddingHorizontal: 12, paddingBottom: 30 },
  menuSection: { marginBottom: 16 },
  sectionHeaderTitle: { fontSize: 10, fontWeight: '700', color: '#94a3b8', marginHorizontal: 10, marginBottom: 6, marginTop: 8 },
  
  drawerItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 10, 
    paddingHorizontal: 10, 
    borderRadius: 14, 
    gap: 12, 
    marginVertical: 4,
    backgroundColor: '#f8fafc',
  },
  activeDrawerItem: { 
    backgroundColor: '#f0f9ff', 
    borderWidth: 0,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerItemText: { fontSize: 13, fontWeight: '600', color: '#475569', flex: 1 },
  activeDrawerText: { color: '#0284c7', fontWeight: '900' },
  badgeContainer: { backgroundColor: '#ef4444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  badgeText: { color: '#ffffff', fontSize: 10, fontWeight: '700' },
  sidebarFooter: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 14 },
  logoutWrapper: { alignItems: 'stretch' },
});