// src/components/UpgradeSkills.js
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, useWindowDimensions } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS, FONTS } from '../constants/theme';

const SKILLS_DATA = [
  { id: '1', title: 'Live Projects', subtitle: 'Real-time work experience', icon: 'laptop-mac', bgCard: 'rgba(224, 242, 254, 0.85)', accent: COLORS.secondary },
  { id: '2', title: 'Expert Trainers', subtitle: 'Learn from industry veterans', icon: 'supervisor-account', bgCard: 'rgba(204, 251, 241, 0.85)', accent: '#0D9488' },
  { id: '3', title: 'ISO Certificates', subtitle: 'Globally recognized credentials', icon: 'verified', bgCard: 'rgba(255, 228, 230, 0.85)', accent: COLORS.danger },
  { id: '4', title: 'Latest Tech', subtitle: 'Future-ready curriculum', icon: 'settings-suggest', bgCard: 'rgba(254, 243, 199, 0.85)', accent: '#D97706' },
];

export default function UpgradeSkills() {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const cardWidth = width * 0.72;

  const handleScroll = (event) => {
    const slideSize = cardWidth + 12;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setActiveIndex(index);
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        snapToInterval={cardWidth + 12}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {SKILLS_DATA.map((item) => (
          <View
            key={item.id}
            style={[styles.card, { backgroundColor: item.bgCard, width: cardWidth }]}
          >
            {/* ✅ 3-LAYER CUT CIRCLE — Right Top Corner */}
            {/* Layer 1: Outer (biggest, most transparent) */}
            <View
              style={[
                styles.cutCircle,
                styles.circleOuter,
                { backgroundColor: item.accent + '0D' }, // ~5% opacity
              ]}
            />
            {/* Layer 2: Middle */}
            <View
              style={[
                styles.cutCircle,
                styles.circleMiddle,
                { backgroundColor: item.accent + '15' }, // ~8% opacity
              ]}
            />
            {/* Layer 3: Inner (smallest, most visible) */}
            <View
              style={[
                styles.cutCircle,
                styles.circleInner,
                { backgroundColor: item.accent + '22' }, // ~13% opacity
              ]}
            />

            <View style={[styles.iconBox, { backgroundColor: item.accent + '18' }]}>
              <MaterialIcons name={item.icon} size={24} color={item.accent} />
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
              activeIndex === index ? styles.activeWideDot : styles.inactiveWideDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingVertical: 12, backgroundColor: '#F4F7FB' },
  scrollContainer: { paddingHorizontal: 16, gap: 12, paddingBottom: 4 },
  card: {
    height: 150,
    borderRadius: 22,
    padding: 16,
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    overflow: 'hidden',
    position: 'relative',
  },

  // ✅ Base cut circle style (common)
  cutCircle: {
    position: 'absolute',
  },

  // ✅ Layer 1: Outer — biggest, most transparent
  circleOuter: {
    top: -55,
    right: -55,
    width: 130,
    height: 130,
    borderRadius: 65,
  },

  // ✅ Layer 2: Middle
  circleMiddle: {
    top: -42,
    right: -42,
    width: 105,
    height: 105,
    borderRadius: 52.5,
  },

  // ✅ Layer 3: Inner — smallest, most visible
  circleInner: {
    top: -30,
    right: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
  },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '900',
    fontFamily: FONTS.bold,
    color: COLORS.darkGray,
    marginTop: 4,
    zIndex: 1,
  },
  cardSubtitle: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    fontWeight: '600',
    zIndex: 1,
  },
  indicatorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2, zIndex: 1 },
  dotSmall: { width: 6, height: 6, borderRadius: 3 },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  paginationRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 12 },
  wideDot: { height: 4, borderRadius: 2 },
  activeWideDot: { width: 24, backgroundColor: COLORS.secondary },
  inactiveWideDot: { width: 8, backgroundColor: COLORS.gray },
});