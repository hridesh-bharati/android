// src/screens/TeamScreen.js
import React from 'react';
import { StyleSheet, SafeAreaView, ScrollView, View, TouchableOpacity, Text, Image, Dimensions } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS } from '../constants/theme';

const { width } = Dimensions.get('window');

const TEAM_DATA = [
  {
    id: '1',
    name: 'Mr. Ajay Tiwari',
    role: 'Director',
    roleIcon: 'star',
    desc: 'Founder & IT Expert with strong leadership & training vision.',
    image: require('../../assets/team1.avif'),
    accent: '#2563eb',
    badgeBg: '#E0F2FE'
  },
  {
    id: '2',
    name: 'Santosh Chauhan',
    role: 'Center Head',
    roleIcon: 'verified',
    desc: 'Managing daily operations & student support activities.',
    image: require('../../assets/team2.avif'),
    accent: '#0D9488',
    badgeBg: '#CCFBF1'
  },
  {
    id: '3',
    name: 'Manjesh Vishwakarma',
    role: 'Accounts Manager',
    roleIcon: 'receipt',
    desc: 'Handles finance management & administrative operations.',
    image: require('../../assets/team3.avif'),
    accent: '#D97706',
    badgeBg: '#FEF3C7'
  },
  {
    id: '4',
    name: 'Hridesh Bharati',
    role: 'MERN Instructor',
    roleIcon: 'code',
    desc: 'Passionate Full Stack Developer & modern web technology trainer.',
    image: require('../../assets/team4.jpg'),
    accent: '#7C3AED',
    badgeBg: '#EDE9FE',
    extraBadge: '38 public repos'
  },
];

export default function TeamScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Top Navigation Bar with Back Button */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={22} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Our Expert Team</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.wrapper}>
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>
              Meet Our <Text style={{ color: COLORS.danger || '#ef4444' }}>Experts</Text>
            </Text>
            <Text style={styles.subtitle}>PASSIONATE PROFESSIONALS COMMITTED TO YOUR SUCCESS</Text>
          </View>

          {/* Team Cards Grid / List */}
          <View style={styles.gridContainer}>
            {TEAM_DATA.map((member) => (
              <View key={member.id} style={styles.card}>
                {/* Top Color Accent Line */}
                <View style={[styles.cardTopAccent, { backgroundColor: member.accent }]} />

                {/* Profile Content */}
                <View style={styles.cardBody}>
                  <View style={[styles.avatarWrapper, { borderColor: member.accent }]}>
                    <Image source={member.image} style={styles.avatar} resizeMode="cover" />
                  </View>

                  <Text style={styles.memberName}>{member.name}</Text>
                  
                  <View style={[styles.roleBadge, { backgroundColor: member.badgeBg }]}>
                    <MaterialIcons name={member.roleIcon} size={12} color={member.accent} />
                    <Text style={[styles.roleBadgeText, { color: member.accent }]}>{member.role}</Text>
                  </View>

                  <Text style={styles.memberDesc} numberOfLines={2}>{member.desc}</Text>

                  {member.extraBadge && (
                    <View style={styles.extraBadgeBox}>
                      <MaterialCommunityIcons name="github" size={12} color="#475569" />
                      <Text style={styles.extraBadgeText}>{member.extraBadge}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.divider} />

                {/* Bottom Action Icons */}
                <View style={styles.socialRow}>
                  <View style={styles.iconButton}>
                    <MaterialIcons name="phone" size={16} color="#2563eb" />
                  </View>
                  <View style={styles.iconButton}>
                    <MaterialCommunityIcons name="whatsapp" size={16} color="#16a34a" />
                  </View>
                  <View style={styles.iconButton}>
                    <MaterialCommunityIcons name="linkedin" size={16} color="#0284c7" />
                  </View>
                  <View style={styles.iconButton}>
                    <MaterialIcons name="email" size={16} color="#dc2626" />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  topBar: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  wrapper: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: '#F4F7FB',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
    textAlign: 'center',
  },
  gridContainer: {
    gap: 14,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    marginBottom: 4,
  },
  cardTopAccent: {
    height: 4,
    width: '100%',
  },
  cardBody: {
    padding: 16,
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    overflow: 'hidden',
    marginBottom: 10,
    backgroundColor: '#E2E8F0',
    elevation: 2,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  memberName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 8,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  memberDesc: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 10,
  },
  extraBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 10,
  },
  extraBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    width: '90%',
    alignSelf: 'center',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});