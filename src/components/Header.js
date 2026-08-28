import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Image, TouchableOpacity, Modal, ScrollView, Dimensions, Platform } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function Header() {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <>
      <View style={styles.header}>
        {/* Left: Logo & Title with Subtitle */}
        <View style={styles.headerLeft}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logo} 
            resizeMode="contain" 
          />
          <View style={styles.titleContainer}>
            <Text style={styles.brandTitle}>DRISHTEE</Text>
            <Text style={styles.subBrandTitle}>Computer center</Text>
          </View>
        </View>

        {/* Middle: Clean Single Bounded Search Box */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={16} color="#94a3b8" style={styles.searchIcon} />
          <TextInput 
            placeholder="Search..." 
            placeholderTextColor="#94a3b8" 
            style={styles.searchInput} 
          />
        </View>

        {/* Right: Bell Icon & Menu Button */}
        <View style={styles.headerRight}>
          <View style={styles.bellContainer}>
            <MaterialIcons name="notifications-none" size={20} color="#ffffff" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </View>
          <TouchableOpacity onPress={toggleSidebar} style={styles.menuTouch} activeOpacity={0.8}>
            <MaterialIcons name="menu" size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Lighter Glassmorphic Sidebar Drawer */}
      <Modal
        visible={sidebarVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={toggleSidebar}
      >
        <View style={styles.modalOverlay}>
          {/* Backdrop click to close */}
          <TouchableOpacity style={styles.backdropTouch} activeOpacity={1} onPress={toggleSidebar} />

          <View style={styles.sidebarContainer}>
            
            {/* User Profile Banner at Top */}
            <View style={styles.profileHeader}>
              <TouchableOpacity onPress={toggleSidebar} style={styles.closeTouch} activeOpacity={0.7}>
                <MaterialIcons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
              <View style={styles.profileInfoRow}>
                <View style={styles.profileTextContainer}>
                  <Text style={styles.userName}>Rohit Sharma</Text>
                  <Text style={styles.userSubText}>Student ID: DR12345</Text>
                </View>
                <Image source={require('../../assets/logo.png')} style={styles.userAvatar} />
              </View>
            </View>

            {/* Scrollable Navigation List with Sections */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sidebarScroll}>
              
              <Text style={styles.sectionHeaderLabel}>Main Navigation</Text>
              <SidebarItem icon="home" label="Home" />
              <SidebarItem icon="menu-book" label="Courses" />
              <SidebarItem icon="file-document-edit" label="Admission" iconType="community" />

              <Text style={styles.sectionHeaderLabel}>Student Zone & Updates</Text>
              <SidebarItem icon="notifications-none" label="Notices" />
              <SidebarItem icon="event" label="Events" />
              <SidebarItem icon="bar-chart" label="Results" />
              <SidebarItem icon="book-open-page-variant" label="Study Material" iconType="community" />
              <SidebarItem icon="perm-media" label="Gallery" />

              <Text style={styles.sectionHeaderLabel}>Services & Support</Text>
              <SidebarItem icon="payment" label="Fee Payment" />
              <SidebarItem icon="file-document-edit-outline" label="Online Admission" iconType="community" />
              <SidebarItem icon="headset-mic" label="Contact Us" />
              <SidebarItem icon="settings" label="Settings" />
              <SidebarItem icon="help-outline" label="Help & Support" />
              <SidebarItem icon="logout" label="Logout" color="#ef4444" />

              <View style={styles.sidebarFooter}>
                <Text style={styles.footerText}>Version 1.0.0</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

function SidebarItem({ icon, label, iconType, color = '#1e293b' }) {
  return (
    <TouchableOpacity style={styles.sidebarItem} activeOpacity={0.7}>
      {iconType === 'community' ? (
        <MaterialCommunityIcons name={icon} size={22} color={color} style={styles.sidebarIcon} />
      ) : (
        <MaterialIcons name={icon} size={22} color={color} style={styles.sidebarIcon} />
      )}
      <Text style={[styles.sidebarItemText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 6,
  },
  titleContainer: {
    justifyContent: 'center',
  },
  brandTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    lineHeight: 15,
  },
  subBrandTitle: {
    color: '#bae6fd',
    fontSize: 8.5,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#071e3d',
    borderRadius: 18,
    paddingHorizontal: 10,
    height: 36,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#1e3a8a',
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: '#ffffff',
    fontSize: 12,
    paddingVertical: 0,
    paddingHorizontal: 0,
    margin: 0,
    ...Platform.select({
      ios: { paddingTop: 0 },
      android: { textAlignVertical: 'center', includeFontPadding: false },
    }),
  },
  headerRight: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  bellContainer: { 
    position: 'relative', 
    marginRight: 10,
    padding: 2,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.secondary,
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { 
    color: '#fff', 
    fontSize: 7, 
    fontWeight: 'bold',
  },
  menuTouch: {
    padding: 2,
  },
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  sidebarContainer: {
    width: width * 0.78,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    height: '100%',
    paddingTop: Platform.OS === 'ios' ? 44 : 25,
    zIndex: 10,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: -5, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(226, 232, 240, 0.8)',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.6)',
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginLeft: 10,
    backgroundColor: '#e2e8f0',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  profileTextContainer: {
    alignItems: 'flex-end',
  },
  userName: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: 'bold',
  },
  userSubText: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 1,
  },
  closeTouch: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sidebarScroll: {
    paddingVertical: 6,
    paddingBottom: 40,
  },
  sectionHeaderLabel: {
    color: '#0284c7',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 18,
    marginBottom: 6,
    paddingHorizontal: 18,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 18,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  sidebarIcon: {
    marginRight: 16,
    color: '#334155',
  },
  sidebarItemText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sidebarFooter: {
    marginTop: 25,
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 11,
  },
  backdropTouch: {
    flex: 1,
  },
});