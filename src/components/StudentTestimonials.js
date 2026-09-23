// src/components/StudentTestimonials.js
import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants/theme';

const CARD_MARGIN = 14;
const AUTO_SCROLL_INTERVAL = 3500;

export default function StudentTestimonials() {
  const { width } = useWindowDimensions();
  const CARD_WIDTH = width * 0.78;
  const TOTAL_CARD_SIZE = CARD_WIDTH + CARD_MARGIN;

  const scrollViewRef = useRef(null);
  const timerRef = useRef(null);
  const isUserInteractingRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      id: '1',
      name: 'The Jungoo',
      course: 'ADCA Graduate',
      placement: 'Placed at Tech Solutions',
      review:
        'Drishtee Computer Centre ki practical training aur faculty ne mujhe IT sector me job dilane me bahut help ki.',
      avatar: require('../../assets/testimonial3.avif'),
      accent: '#0284c7',
    },
    {
      id: '2',
      name: 'Manjesh Vishwakarma',
      course: 'Tally with GST',
      placement: 'Accountant',
      review:
        'Accounting ka practical knowledge yahan bahut shandar tarike se sikhaya jata hai. Highly recommended!',
      avatar: require('../../assets/testimonial2.avif'),
      accent: '#10b981',
    },
    {
      id: '3',
      name: 'Adity Gautam',
      course: 'CCC & Python',
      placement: 'Data Entry Operator',
      review:
        'Best computer institute in Nichlaul! Environment aur lab facilities ekdum professional hain.',
      avatar: require('../../assets/testimonial4.avif'),
      accent: '#f59e0b',
    },
  ];

  // ✅ Start auto-scroll timer
  const startAutoScroll = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      if (isUserInteractingRef.current) return;

      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % testimonials.length;
        scrollViewRef.current?.scrollTo({
          x: nextIndex * (width * 0.78 + CARD_MARGIN),
          animated: true,
        });
        return nextIndex;
      });
    }, AUTO_SCROLL_INTERVAL);
  }, [width, testimonials.length]);

  // ✅ Mount → start, Unmount → cleanup
  useEffect(() => {
    startAutoScroll();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startAutoScroll]);

  // ✅ Pause timer when user drags
  const onScrollBeginDrag = useCallback(() => {
    isUserInteractingRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // ✅ Sync index + resume timer
  const onMomentumScrollEnd = useCallback(
    (event) => {
      const contentOffsetX = event.nativeEvent.contentOffset.x;
      const currentIndex = Math.round(contentOffsetX / TOTAL_CARD_SIZE);
      if (currentIndex >= 0 && currentIndex < testimonials.length) {
        setActiveIndex(currentIndex);
      }
      isUserInteractingRef.current = false;
      startAutoScroll();
    },
    [TOTAL_CARD_SIZE, testimonials.length, startAutoScroll]
  );

  return (
    <View style={styles.container}>
      {/* ===== Header ===== */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Student Success Stories</Text>
          <Text style={styles.sectionSubtitle}>
            Real journeys, real achievements
          </Text>
        </View>
        <TouchableOpacity activeOpacity={0.7} style={styles.viewAllBtn}>
          <Text style={styles.viewAll}>View All</Text>
          <MaterialIcons
            name="arrow-forward-ios"
            size={11}
            color={COLORS.secondary}
          />
        </TouchableOpacity>
      </View>

      {/* ===== Horizontal Scroll ===== */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hScrollContent}
        decelerationRate="fast"
        snapToInterval={TOTAL_CARD_SIZE}
        onScrollBeginDrag={onScrollBeginDrag}
        onMomentumScrollEnd={onMomentumScrollEnd}
        scrollEventThrottle={16}
      >
        {testimonials.map((item) => (
          <View
            key={item.id}
            style={[styles.card, { width: CARD_WIDTH }]}
          >
            {/* ✅ 3-LAYER CUT CIRCLE — Right Top Corner */}
            <View
              style={[
                styles.cutCircle,
                styles.circleOuter,
                { backgroundColor: item.accent + '0D' },
              ]}
            />
            <View
              style={[
                styles.cutCircle,
                styles.circleMiddle,
                { backgroundColor: item.accent + '15' },
              ]}
            />
            <View
              style={[
                styles.cutCircle,
                styles.circleInner,
                { backgroundColor: item.accent + '22' },
              ]}
            />

            {/* Header — Avatar + Name */}
            <View style={styles.cardHeader}>
              <View style={styles.avatarWrapper}>
                <Image source={item.avatar} style={styles.avatar} />
                <View
                  style={[
                    styles.onlineDot,
                    { backgroundColor: item.accent },
                  ]}
                />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text
                  style={[styles.userCourse, { color: item.accent }]}
                  numberOfLines={1}
                >
                  {item.course}
                </Text>
              </View>
            </View>

            {/* Rating */}
            <View style={styles.ratingRow}>
              {[...Array(5)].map((_, i) => (
                <MaterialIcons
                  key={i}
                  name="star"
                  size={13}
                  color="#f59e0b"
                />
              ))}
              <Text style={styles.ratingValue}>5.0</Text>
            </View>

            {/* Review */}
            <Text style={styles.reviewText} numberOfLines={3}>
              "{item.review}"
            </Text>

            {/* Placement Badge */}
            <View
              style={[
                styles.placementBadge,
                { backgroundColor: item.accent + '12' },
              ]}
            >
              <MaterialIcons
                name="verified"
                size={12}
                color={item.accent}
              />
              <Text
                style={[styles.placementText, { color: item.accent }]}
                numberOfLines={1}
              >
                {item.placement}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* ===== Pagination Dots ===== */}
      <View style={styles.paginationContainer}>
        {testimonials.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              activeIndex === index && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },

  // ===== Header =====
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.2,
  },
  sectionSubtitle: {
    fontSize: 10.5,
    color: COLORS.gray,
    fontWeight: '500',
    marginTop: 2,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  viewAll: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '700',
    marginRight: 3,
  },

  // ===== Scroll =====
  hScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },

  // ===== Card =====
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 20,
    padding: 16,
    marginRight: CARD_MARGIN,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    position: 'relative',
    // ✅ No dark shadow — clean subtle border
  },

  // ✅ 3-Layer Cut Circle
  cutCircle: {
    position: 'absolute',
  },
  circleOuter: {
    top: -55,
    right: -55,
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  circleMiddle: {
    top: -42,
    right: -42,
    width: 105,
    height: 105,
    borderRadius: 52.5,
  },
  circleInner: {
    top: -30,
    right: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
  },

  // ===== Header =====
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    zIndex: 1,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.2,
  },
  userCourse: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
    letterSpacing: 0.2,
  },

  // ===== Rating =====
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 2,
    zIndex: 1,
  },
  ratingValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0f172a',
    marginLeft: 4,
  },

  // ===== Review =====
  reviewText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17.5,
    marginBottom: 12,
    fontStyle: 'italic',
    zIndex: 1,
  },

  // ===== Placement Badge =====
  placementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 9,
    alignSelf: 'flex-start',
    gap: 5,
    zIndex: 1,
  },
  placementText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  // ===== Pagination =====
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#cbd5e1',
  },
  paginationDotActive: {
    width: 20,
    backgroundColor: '#0284c7',
    borderRadius: 4,
  },
});