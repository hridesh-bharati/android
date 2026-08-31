// src/components/Header.js
import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, Image, TouchableOpacity, Modal, ScrollView, Dimensions, Platform } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { COLORS } from '../constants/theme';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const shadowStyle = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6 },
  android: { elevation: 3 }
});

export default function Header() {
  const navigation = useNavigation();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { user, logout } = useContext(AuthContext);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const navigateTo = (screenName, params) => {
    toggleSidebar();
    const parentNav = navigation.getParent();
    if (parentNav) {
      parentNav.navigate(screenName, params);
    } else {
      navigation.navigate(screenName, params);
    }
  };

  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
      }
      toggleSidebar();
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'MainTabs', state: { routes: [{ name: 'Home' }] } }],
        })
      );
    } catch (error) {
      console.log('Logout error:', error);
    }
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

        {/* Middle: Search Box */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={16} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            placeholder="Search..."
            placeholderTextColor="#94a3b8"
            style={styles.searchInput}
          />
        </View>

        {/* Right: Bell Icon, Chat Icon & Menu Button */}
        <View style={styles.headerRight}>
          <View style={styles.bellContainer}>
            <MaterialIcons name="notifications-none" size={20} color="#ffffff" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </View>

          {/* 🚀 Chat Icon Added Right After Bell Icon */}
          <TouchableOpacity 
            onPress={() => {
              const parentNav = navigation.getParent();
              if (parentNav) {
                parentNav.navigate('ChatScreen');
              } else {
                navigation.navigate('ChatScreen');
              }
            }} 
            style={styles.chatTouch} 
            activeOpacity={0.8}
          >
            <MaterialIcons name="chat" size={19} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleSidebar} style={styles.menuTouch} activeOpacity={0.8}>
            <MaterialIcons name="menu" size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sidebar Drawer */}
      <Modal
        visible={sidebarVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={toggleSidebar}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.backdropTouch} activeOpacity={1} onPress={toggleSidebar} />

          <View style={styles.sidebarContainer}>
            <View style={styles.profileHeader}>
              <TouchableOpacity onPress={toggleSidebar} style={styles.closeTouch} activeOpacity={0.7}>
                <MaterialIcons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
              <View style={styles.profileInfoRow}>
                <View style={styles.profileTextContainer}>
                  <Text style={styles.userName}>{user?.name || user?.displayName || 'Welcome User'}</Text>
                  <Text style={styles.userSubText}>{user?.email || 'Guest Account'}</Text>
                </View>
                <Image source={require('../../assets/logo.png')} style={styles.userAvatar} />
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sidebarScroll}>
              <Text style={styles.sectionHeaderLabel}>Main Navigation</Text>
              <SidebarItem icon="home" label="Home" onPress={() => navigateTo('MainTabs', { screen: 'Home' })} />
              <SidebarItem icon="menu-book" label="Courses" onPress={() => navigateTo('MainTabs', { screen: 'Courses' })} />
              <SidebarItem icon="file-document-edit" label="Admission" iconType="community" onPress={() => navigateTo('MainTabs', { screen: 'Admission' })} />

              <Text style={styles.sectionHeaderLabel}>Student Zone & Updates</Text>
              <SidebarItem icon="chat" label="Live Chat" onPress={() => navigateTo('ChatScreen')} />
              <SidebarItem icon="notifications-none" label="Notices" />
              <SidebarItem icon="event" label="Events" />
              <SidebarItem icon="bar-chart" label="Results" />
              <SidebarItem icon="book-open-page-variant" label="Study Material" iconType="community" />
              <SidebarItem icon="perm-media" label="Gallery" onPress={() => navigateTo('Gallery')} />

              <Text style={styles.sectionHeaderLabel}>Verification Center</Text>
              <SidebarItem icon="verified" label="Certificate Verification" onPress={() => navigateTo('Verification')} />

              <Text style={styles.sectionHeaderLabel}>Our Team</Text>
              <SidebarItem icon="account-group" iconType="community" label="Our Team" onPress={() => navigateTo('TeamScreen')} />

              <Text style={styles.sectionHeaderLabel}>Services & Support</Text>
              <SidebarItem icon="payment" label="Fee Payment" onPress={() => navigateTo('FeePage')} />
              <SidebarItem icon="file-document-edit-outline" label="Online Admission" iconType="community" onPress={() => navigateTo('MainTabs', { screen: 'Admission' })} />
              <SidebarItem icon="headset-mic" label="Contact Us" onPress={() => navigateTo('ContactUs')} />
              <SidebarItem icon="help-outline" label="Help & Support" onPress={() => navigateTo('ContactUs')} />
              
              {user ? (
                <SidebarItem icon="logout" label="Logout" color="#ef4444" onPress={handleLogout} />
              ) : (
                <SidebarItem icon="login" label="Login" color="#0284c7" onPress={() => navigateTo('Login')} />
              )}

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

function SidebarItem({ icon, label, iconType, color = '#1e293b', onPress }) {
  return (
    <TouchableOpacity style={styles.sidebarItem} activeOpacity={0.7} onPress={onPress}>
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
    ...shadowStyle,
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
    gap: 6,
  },
  bellContainer: {
    position: 'relative',
    padding: 2,
  },
  chatTouch: {
    padding: 4,
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