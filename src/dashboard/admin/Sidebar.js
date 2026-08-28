// src/dashboard/admin/Sidebar.js
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Logout from '../../auth/Logout';

export default function AdminSidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, isDesktopWeb }) {
  const menuSections = [
    {
      title: 'MANAGEMENT',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'view-dashboard-outline' },
        { id: 'admitted', label: 'Admitted Students', icon: 'account-group-outline' },
        { id: 'new_adm', label: 'New Admissions', icon: 'account-plus-outline' },
        { id: 'queries', label: 'Inbox (Queries)', icon: 'message-processing-outline' },
        { id: 'exams', label: 'Examinations', icon: 'file-document-edit-outline', badge: '10' },
        { id: 'attendance', label: 'Attendance', icon: 'calendar-check-outline' },
        { id: 'tests', label: 'Practice Tests', icon: 'format-list-checks' },
      ]
    },
    {
      title: 'MARKETING',
      items: [
        { id: 'upload_media', label: 'Upload Media', icon: 'cloud-upload-outline' },
        { id: 'gallery', label: 'Gallery', icon: 'image-album' },
        { id: 'create_offers', label: 'Create Offers', icon: 'tag-plus-outline' },
        { id: 'delete_offers', label: 'Delete Offers', icon: 'tag-remove-outline' },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'admin_list', label: 'Admin List', icon: 'shield-account-outline' },
        { id: 'visitor_list', label: 'Visitor List', icon: 'eye-outline' },
        { id: 'admin_profile', label: 'Admin Account', icon: 'account-cog-outline' },
      ]
    }
  ];

  if (!isDesktopWeb && !sidebarOpen) return null;

  return (
    <View style={[styles.sidebar, !isDesktopWeb && styles.floatingSidebar]}>
      <View style={styles.sidebarHeader}>
        <View style={styles.logoRow}>
          <View style={styles.brandIconBox}>
            <MaterialCommunityIcons name="school" size={20} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.sidebarBrand}>DRISHTEE</Text>
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
                  <MaterialCommunityIcons name={item.icon} size={20} color={isActive ? '#0284c7' : '#64748b'} />
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
  },
  floatingSidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 100,
    elevation: 25,
  },
  sidebarHeader: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#071e3d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarBrand: {
    fontSize: 13,
    fontWeight: '900',
    color: '#071e3d',
  },
  sidebarBrandSub: {
    fontSize: 8,
    fontWeight: '700',
    color: '#64748b',
  },
  sidebarScroll: {
    paddingHorizontal: 12,
    paddingBottom: 30,
  },
  menuSection: {
    marginBottom: 16,
  },
  sectionHeaderTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    marginHorizontal: 10,
    marginBottom: 6,
    marginTop: 8,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 12,
    marginVertical: 2,
  },
  activeDrawerItem: {
    backgroundColor: '#f0f9ff',
  },
  drawerItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    flex: 1,
  },
  activeDrawerText: {
    color: '#0284c7',
    fontWeight: '700',
  },
  badgeContainer: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  sidebarFooter: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 14,
  },
  logoutWrapper: {
    alignItems: 'stretch',
  },
});