// src/components/JoinBatchBanner.js
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Image } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS, FONTS } from '../constants/theme';
import { navigationRef } from '../services/NavigationService';

export default function JoinBatchBanner() {
  const handleApplyNow = () => {
    if (navigationRef.isReady()) {
      navigationRef.navigate("Admission");
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.bannerCard}>
        <View style={styles.glowBlob} />

        {/* Left Content Container */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>
            New Batch Starts <Text style={{ color: COLORS.primary || '#0d6efd' }}>Every Month</Text>
          </Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            Join Now & Shape Your Future
          </Text>

          <TouchableOpacity
            style={styles.applyBtn}
            activeOpacity={0.85}
            onPress={handleApplyNow}
          >
            <Text style={styles.applyBtnText}>Enroll Now</Text>
            <MaterialIcons name="arrow-forward" size={16} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Right Image Container */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/education.png')}
            style={styles.bannerImage}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: COLORS.background || '#F4F7FB',
  },
  bannerCard: {
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    paddingTop: 16,
    paddingLeft: 18,
    paddingRight: 0,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  glowBlob: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(2, 132, 199, 0.08)',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'flex-start',
    zIndex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: FONTS.bold,
    color: '#0f172a',
    textAlign: 'left',
    marginBottom: 4,
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 11.5,
    fontFamily: FONTS.regular,
    color: COLORS.gray || '#64748B',
    textAlign: 'left',
    fontWeight: '600',
    marginBottom: 12, // Subtitle aur button ke beech ka gap thoda compact kiya gaya hai
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fd7e14',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#fd7e14',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    marginBottom:10,
  },
  applyBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    letterSpacing: 0.3,
  },
  imageContainer: {
    width: 150,
    height: 130,
    justifyContent: 'center',
    alignItems: 'flex-end',
    zIndex: 1,
  },
  bannerImage: {
    width:200,
    height: 120,
  },
});