// src/components/WhyChooseDrishtee.js
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS, FONTS } from '../constants/theme';

export default function WhyChooseDrishtee() {
  const features = [
    { title: 'ISO Certified', sub: 'ISO 9001:2015 Certified Institute', icon: 'verified', color: '#2563eb' },
    { title: 'Experienced Faculty', sub: 'Highly Qualified & Experienced', icon: 'co-present', color: '#7c3aed' },
    { title: '100% Placement', sub: 'Practical Oriented Training', icon: 'group', color: '#059669' },
    { title: 'Student Support', sub: 'Always Here to Help You', icon: 'support-agent', color: '#d97706' },
  ];

  return (
    <View style={styles.outerContainer}>
      {/* Heading & Tagline moved here */}
      <View style={styles.headerContainer}>
        <Text style={styles.tagline}>
          WHY CHOOSE <Text style={{ color: COLORS.danger }}>DRISHTEE</Text>
        </Text>
        <Text style={styles.title}>
          Upgrade Your <Text style={{ color: COLORS.secondary }}>Skills</Text>
        </Text>
      </View>

      <View style={styles.whyBox}>
        {features.map((item, idx) => (
          <React.Fragment key={idx}>
            <View style={styles.whyItem}>
              <View style={[styles.whyCircle, { backgroundColor: `${item.color}15` }]}>
                <MaterialIcons name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={styles.whyTitle}>{item.title}</Text>
              <Text style={styles.whySub} numberOfLines={2}>{item.sub}</Text>
            </View>
            {idx < features.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 20, // <-- Yahan bottom margin add kar diya hai
  },
  headerContainer: {
    marginBottom: 12,
  },
  tagline: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    color: COLORS.darkGray,
    letterSpacing: 1,
    marginBottom: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: FONTS.bold,
    color: COLORS.darkGray,
  },
  whyBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  whyItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  whyCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  whyTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    color: '#071e3d',
    textAlign: 'center',
    marginBottom: 3,
    minHeight: 28,
  },
  whySub: {
    fontSize: 8.5,
    fontFamily: FONTS.regular,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 11,
  },
  divider: {
    width: 1,
    height: '65%',
    backgroundColor: '#e2e8f0',
    marginHorizontal: 2,
  },
});