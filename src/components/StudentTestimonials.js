import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, Platform, Dimensions } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.78; // Pehle jaisa wide aur thoda compact taaki agla card bhi dikhe
const CARD_MARGIN = 14;
const TOTAL_CARD_SIZE = CARD_WIDTH + CARD_MARGIN;

export default function StudentTestimonials() {
  const scrollViewRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      id: '1',
      name: 'The Jungoo',
      course: 'ADCA Graduate',
      placement: 'Placed at Tech Solutions',
      review: 'Drishtee Computer Centre ki practical training aur faculty ne mujhe IT sector me job dilane me bahut help ki.',
      avatar: require('../../assets/testimonial3.avif'), 
    },
    {
      id: '2',
      name: 'Manjesh Vishwakarma',
      course: 'Tally with GST',
      placement: 'Accountant',
      review: 'Accounting ka practical knowledge yahan bahut shandar tarike se sikhaya jata hai. Highly recommended!',
      avatar: require('../../assets/testimonial2.avif'),
    },
    {
      id: '3',
      name: 'Adity Gautam',
      course: 'CCC & Python',
      placement: 'Data Entry Operator',
      review: 'Best computer institute in Nichlaul! Environment aur lab facilities ekdum professional hain.',
      avatar: require('../../assets/testimonial4.avif'),
    },
  ];

  // Infinite Auto-scroll Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % testimonials.length;
        scrollViewRef.current?.scrollTo({
          x: nextIndex * TOTAL_CARD_SIZE,
          animated: true,
        });
        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / TOTAL_CARD_SIZE);
    setActiveIndex(currentIndex);
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Student Success Stories</Text>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.hScrollContent}
        decelerationRate="fast"
        snapToInterval={TOTAL_CARD_SIZE}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {testimonials.map((item) => (
          <View key={item.id} style={[styles.card, { width: CARD_WIDTH }]}>
            <View style={styles.cardHeader}>
              <Image source={item.avatar} style={styles.avatar} />
              <View style={styles.userInfo}>
                <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.userCourse}>{item.course}</Text>
              </View>
            </View>

            <View style={styles.ratingRow}>
              {[...Array(5)].map((_, i) => (
                <MaterialIcons key={i} name="star" size={14} color="#f59e0b" />
              ))}
            </View>

            <Text style={styles.reviewText} numberOfLines={3}>
              "{item.review}"
            </Text>

            <View style={styles.placementBadge}>
              <MaterialIcons name="verified" size={12} color="#059669" />
              <Text style={styles.placementText} numberOfLines={1}>{item.placement}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
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
  sectionHeader: { 
    paddingHorizontal: 16, 
    marginTop: 14, 
    marginBottom: 10,
  },
  sectionTitle: { 
    fontSize: 15, 
    fontWeight: '800', 
    color: COLORS.primary,
    letterSpacing: 0.3,
  },
  hScrollContent: { 
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  card: { 
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    padding: 16,
    marginRight: 14,
    borderWidth: 1.5,
    borderColor: '#ffffff',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0284c7',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: '#bae6fd',
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  userCourse: {
    fontSize: 11.5,
    color: '#0284c7',
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    marginBottom: 6,
    gap: 2,
  },
  reviewText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  placementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 5,
  },
  placementText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#059669',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#cbd5e1',
  },
  paginationDotActive: {
    width: 18,
    backgroundColor: '#0284c7',
  },
});