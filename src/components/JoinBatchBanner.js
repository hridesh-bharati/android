// src/components/JoinBatchBanner.js
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS, FONTS } from '../constants/theme';
import { navigationRef } from '../services/NavigationService';

const { width } = Dimensions.get('window');

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
        
        <View style={styles.contentContainer}>
          <Text style={styles.title}>
            Join New <Text style={{ color: COLORS.danger }}>Batch</Text> Today!
          </Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            Admission open for Tally Prime, ADCA & Professional Web Design.
          </Text>

          <TouchableOpacity 
            style={styles.applyBtn} 
            activeOpacity={0.85}
            onPress={handleApplyNow}
          >
            <Text style={styles.applyBtnText}>Apply Now</Text>
            <MaterialIcons name="arrow-forward" size={16} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { 
    paddingHorizontal: 16,
    paddingVertical: 12, 
    backgroundColor: COLORS.background || '#F4F7FB' 
  },
  bannerCard: { 
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.90)', 
    borderRadius: 24, 
    padding: 20, 
    borderWidth: 1.5, 
    borderColor: '#FFFFFF', 
    overflow: 'hidden',
    elevation: 4, 
    shadowColor: '#0284c7', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 10,
    alignItems: 'center'
  },
  glowBlob: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(2, 132, 199, 0.1)",
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
    zIndex: 1
  },
  title: { 
    fontSize: 18, 
    fontWeight: '900', 
    fontFamily: FONTS.bold,
    color: COLORS.darkGray || '#0F172A', 
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.3
  },
  subtitle: { 
    fontSize: 11.5, 
    fontFamily: FONTS.regular,
    color: COLORS.gray || '#64748B', 
    textAlign: 'center', 
    fontWeight: '600',
    marginBottom: 16,
    paddingHorizontal: 10
  },
  applyBtn: { 
    flexDirection: 'row',
    alignItem: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.secondary || '#0284c7', 
    paddingHorizontal: 28, 
    paddingVertical: 11, 
    borderRadius: 30, 
    elevation: 3, 
    shadowColor: COLORS.secondary || '#0284c7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6
  },
  applyBtnText: { 
    color: COLORS.white, 
    fontSize: 13, 
    fontWeight: '800', 
    fontFamily: FONTS.bold,
    letterSpacing: 0.3
  },
});