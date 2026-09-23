// src/components/DirectorMessage.js
import React from 'react';
import { StyleSheet, Text, View, Image, Platform, Linking, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants/theme';

const DIRECTOR_INFO = {
  name: 'Ajay Tiwari',
  role: 'Founder & Director, Drishtee',
  message: 'Our objective is not just to provide computer education, but to make every student an expert in technical skills and lay the foundation for their bright future. Welcome to Drishtee Computer Centre.',
  location: 'Nichlaul, Maharajganj',
  phone: '9918151032',
};

export default function DirectorMessage() {
  const handleCall = () => Linking.openURL(`tel:${DIRECTOR_INFO.phone}`);

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <View style={styles.titleIndicator} />
          <Text style={styles.sectionTitle}>Director's Message</Text>
        </View>
      </View>

      {/* Modern Editorial Card */}
      <View style={styles.card}>
        {/* Left Accent Strip */}
        <View style={styles.leftAccentBar} />

        <View style={styles.cardInner}>
          {/* Top Row: Image & Info */}
          <View style={styles.contentRow}>
            <View style={styles.imageWrapper}>
              <Image source={require('../../assets/team1.avif')} style={styles.directorImage} resizeMode="cover" />
              <View style={styles.badgeIcon}>
                <MaterialIcons name="verified" size={13} color="#0284c7" />
              </View>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.directorName}>{DIRECTOR_INFO.name}</Text>
              <Text style={styles.directorRole}>{DIRECTOR_INFO.role}</Text>
              
              <View style={styles.quoteIconContainer}>
                <MaterialIcons name="format-quote" size={18} color="#0284c7" style={{ opacity: 0.5 }} />
              </View>
            </View>
          </View>

          {/* Message Text */}
          <Text style={styles.messageText} numberOfLines={4}>
            {DIRECTOR_INFO.message}
          </Text>

          {/* Footer Action Bar */}
          <View style={styles.cardFooter}>
            <View style={styles.footerItem}>
              <MaterialIcons name="location-pin" size={14} color="#64748b" />
              <Text style={styles.footerText} numberOfLines={1}>{DIRECTOR_INFO.location}</Text>
            </View>

            <TouchableOpacity 
              style={styles.callButton} 
              activeOpacity={0.8}
              onPress={handleCall}
            >
              <MaterialIcons name="phone" size={13} color="#ffffff" />
              <Text style={styles.callButtonText}>Call Direct</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    marginBottom: 35,
  },
  sectionHeader: { 
    paddingHorizontal: 16, 
    marginTop: 10, 
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleIndicator: {
    width: 4,
    height: 16,
    backgroundColor: '#0284c7',
    borderRadius: 2,
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: COLORS.primary,
    letterSpacing: 0.3,
  },
  card: {
    marginHorizontal: 16,
    backgroundColor: '#F8FAFC', // Ultra clean modern background tint
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  leftAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: '#0284c7',
  },
  cardInner: {
    padding: 16,
    paddingLeft: 20, // Extra space due to accent bar
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  imageWrapper: {
    position: 'relative',
  },
  directorImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E2E8F0',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  badgeIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 9,
    padding: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textContainer: {
    flex: 1,
  },
  directorName: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  directorRole: {
    fontSize: 11,
    color: '#0284c7',
    fontWeight: '700',
    marginTop: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  messageText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    fontStyle: 'italic',
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
    marginRight: 10,
  },
  footerText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 5,
  },
  callButtonText: {
    fontSize: 11.5,
    color: '#ffffff',
    fontWeight: '700',
  },
});