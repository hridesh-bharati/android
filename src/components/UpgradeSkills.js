// src/components/UpgradeSkills.js
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS, FONTS } from '../constants/theme';

const { width } = Dimensions.get('window');

const SKILLS_DATA = [
  {
    id: '1',
    title: 'Live Projects',
    subtitle: 'Real-time work experience',
    icon: 'laptop-mac',
    bgCard: 'rgba(224, 242, 254, 0.85)',
    accent: COLORS.secondary,
  },
  {
    id: '2',
    title: 'Expert Trainers',
    subtitle: 'Learn from industry veterans',
    icon: 'supervisor-account',
    bgCard: 'rgba(204, 251, 241, 0.85)',
    accent: '#0D9488',
  },
  {
    id: '3',
    title: 'ISO Certificates',
    subtitle: 'Globally recognized credentials',
    icon: 'verified',
    bgCard: 'rgba(255, 228, 230, 0.85)',
    accent: COLORS.danger,
  },
  {
    id: '4',
    title: 'Latest Tech',
    subtitle: 'Future-ready curriculum',
    icon: 'settings-suggest',
    bgCard: 'rgba(254, 243, 199, 0.85)',
    accent: '#D97706',
  },
];

export default function UpgradeSkills() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event) => {
    const slideSize = width * 0.72 + 12;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setActiveIndex(index);
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        snapToInterval={width * 0.72 + 12}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {SKILLS_DATA.map((item) => (
          <View key={item.id} style={[styles.card, { backgroundColor: item.bgCard }]}>
            <View style={[styles.iconBox, { backgroundColor: COLORS.white, shadowColor: item.accent }]}>
              <MaterialIcons name={item.icon} size={26} color={item.accent} />
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            
            <View style={styles.indicatorRow}>
              <View style={[styles.dotSmall, { backgroundColor: item.accent }]} />
              <Text style={[styles.statusText, { color: item.accent }]}>Active Batch</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.paginationRow}>
        {SKILLS_DATA.map((_, index) => (
          <View 
            key={index} 
            style={[
              styles.wideDot, 
              activeIndex === index ? styles.activeWideDot : styles.inactiveWideDot
            ]} 
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { 
    paddingVertical: 12, 
    backgroundColor: '#F4F7FB' 
  },
  scrollContainer: { 
    paddingHorizontal: 16, 
    gap: 12,
    paddingBottom: 4 
  },
  card: { 
    width: width * 0.72, 
    height: 150, 
    borderRadius: 22, 
    padding: 16, 
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: COLORS.white,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  iconBox: { 
    width: 42, 
    height: 42, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 2,
  },
  cardTitle: { 
    fontSize: 15, 
    fontWeight: '900', 
    fontFamily: FONTS.bold,
    color: COLORS.darkGray,
    marginTop: 4
  },
  cardSubtitle: { 
    fontSize: 12, 
    fontFamily: FONTS.regular,
    color: COLORS.gray, 
    fontWeight: '600' 
  },
  indicatorRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    marginTop: 2 
  },
  dotSmall: { 
    width: 6, 
    height: 6, 
    borderRadius: 3 
  },
  statusText: { 
    fontSize: 10, 
    fontWeight: '800', 
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  wideDot: {
    height: 4,
    borderRadius: 2,
  },
  activeWideDot: {
    width: 24,
    backgroundColor: COLORS.secondary,
  },
  inactiveWideDot: {
    width: 8,
    backgroundColor: COLORS.gray,
  },
});