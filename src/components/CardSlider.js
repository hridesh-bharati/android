// src/components/CardSlider.js
import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Image, Dimensions } from 'react-native';
import { COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');

const SLIDES_DATA = [
  { id: 2, file: require('../../assets/ehack.avif') },
  { id: 3, file: require('../../assets/cpp.avif') },
  { id: 4, file: require('../../assets/office.avif') },
  { id: 5, file: require('../../assets/js.avif') },
  { id: 6, file: require('../../assets/coding.avif') },
  { id: 7, file: require('../../assets/ai.avif') },
  { id: 8, file: require('../../assets/tail.avif') },
  { id: 9, file: require('../../assets/ppt.avif') },
  { id: 10, file: require('../../assets/python.avif') },
  { id: 11, file: require('../../assets/ai1.avif') },
  { id: 12, file: require('../../assets/ps1.avif') }
];

const SLIDE_WIDTH = 195;

export default function CardSlider() {
  const sliderRef = useRef(null);
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    let scrollPosition = 0;
    const autoScrollTimer = setInterval(() => {
      if (!sliderRef.current) return;
      
      scrollPosition += SLIDE_WIDTH;
      const maxScroll = SLIDES_DATA.length * SLIDE_WIDTH;

      if (scrollPosition >= maxScroll) {
        scrollPosition = 0;
        sliderRef.current.scrollTo({ x: 0, animated: false });
      } else {
        sliderRef.current.scrollTo({ x: scrollPosition, animated: true });
      }
    }, 2800);

    return () => clearInterval(autoScrollTimer);
  }, []);

  const handleScrollTracking = (e) => {
    const rawIndex = Math.round(e.nativeEvent.contentOffset.x / SLIDE_WIDTH);
    const indexBound = rawIndex % SLIDES_DATA.length;
    if (activeDot !== indexBound) {
      setActiveDot(indexBound);
    }
  };

  return (
    <View style={styles.sectionContainer}>
      <ScrollView
        ref={sliderRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={handleScrollTracking}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContainer}
        decelerationRate="fast"
      >
        {[...SLIDES_DATA, ...SLIDES_DATA].map((slide, index) => (
          <View key={`${slide.id}-${index}`} style={styles.cardFrame}>
            <Image
              source={slide.file}
              style={styles.cardImage}
              resizeMode="cover"
            />
          </View>
        ))}
      </ScrollView>

      <View style={styles.dotPaginationRow}>
        {SLIDES_DATA.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.dotPill,
              idx === activeDot ? styles.dotActive : styles.dotInactive
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    paddingVertical: 10,
    backgroundColor: 'transparent',
    width: '100%',
    paddingHorizontal: 4, 
  },
  scrollContainer: {
    paddingHorizontal: 16,
    gap: 15,
  },
  cardFrame: {
    width: 180,
    height: 110,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderWidth: 2,                     
    borderColor: '#FFFFFF',             
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  dotPaginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  dotPill: {
    height: 5,
    borderRadius: 3,
  },
  dotInactive: {
    width: 8,
    backgroundColor: COLORS.lightGray || '#cbd5e1',
  },
  dotActive: {
    width: 22,
    backgroundColor: COLORS.secondary,
  },
});