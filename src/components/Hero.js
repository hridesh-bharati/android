import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    titleLine1: 'Build Your',
    titleLine1Highlight: 'Skills',
    titleLine2: 'Build Your',
    titleLine2Highlight: 'Future',
    subtitle: 'Quality Education for\nBetter Tomorrow',
    image: require('../../assets/slider1.png'),
  },
  {
    id: '2',
    titleLine1: 'Learn Real',
    titleLine1Highlight: 'Skills',
    titleLine2: 'Master Your',
    titleLine2Highlight: 'Career',
    subtitle: 'Practical Oriented\nTraining Modules',
    image: require('../../assets/slider2.png'),
  },
  {
    id: '3',
    titleLine1: 'Achieve Your',
    titleLine1Highlight: 'Goals',
    titleLine2: 'Secure Your',
    titleLine2Highlight: 'Future',
    subtitle: '100% Placement\nAssistance Guaranteed',
    image: require('../../assets/slider3.png'),
  },
];

export default function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = prevIndex === slides.length - 1 ? 0 : prevIndex + 1;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.slideContainer}>
      <View style={styles.heroCard}>
        {/* Full Card Background Image */}
        <Image
          source={item.image}
          style={styles.backgroundImage}
          resizeMode="cover"
        />

        {/* Content Overlay */}
        <View style={styles.heroLeft}>
          <Text style={styles.heroTitle}>
            {item.titleLine1}{' '}
            <Text style={styles.highlight}>{item.titleLine1Highlight}</Text>
          </Text>
          <Text style={styles.heroTitle}>
            {item.titleLine2}{' '}
            <Text style={styles.highlight}>{item.titleLine2Highlight}</Text>
          </Text>
          <Text style={styles.heroSubText}>{item.subtitle}</Text>
          <TouchableOpacity style={styles.exploreBtn} activeOpacity={0.85}>
            <Text style={styles.exploreBtnText}>Explore Courses</Text>
            <MaterialIcons
              name="arrow-forward"
              size={15}
              color={COLORS.white}
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const onScroll = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(slideIndex);
  };

  return (
    <View style={styles.wrapper}>
      {/* Curved Dark Navy Background Header */}
      <View style={styles.navyBackdrop} />

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      {/* Pagination Dots */}
      <View style={styles.dotsRow}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, activeIndex === index && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  navyBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  slideContainer: {
    width,
    paddingTop: 10,
  },
  heroCard: {
    height: 185,
    marginHorizontal: 16,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    position: 'relative',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '62%',
    paddingVertical: 18,
    paddingLeft: 18,
    justifyContent: 'center',
    zIndex: 2,
  },
  heroTitle: {
    color: COLORS.darkGray,
    fontSize: 19,
    fontWeight: '800',
    lineHeight: 25,
  },
  highlight: {
    color: COLORS.secondary,
  },
  heroSubText: {
    color: COLORS.gray,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
    marginBottom: 12,
  },
  exploreBtn: {
    backgroundColor: COLORS.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    elevation: 3,
  },
  exploreBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 3.5,
  },
  activeDot: {
    backgroundColor: COLORS.secondary,
    width: 20,
    borderRadius: 4,
  },
});