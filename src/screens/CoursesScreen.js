// src/screens/CoursesScreen.js
import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Dimensions,
  Platform,
  Animated,
  Modal,
  Pressable,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

const COURSES_DATA = [
  {
    id: '0',
    name: 'ADCA+',
    description: 'Advanced Diploma in Computer Applications+ - An elite 18-month program including Advanced Web Development and Python',
    duration: '18 Months',
    level: 'Diploma',
    icon: 'computer',
    color: '#3b82f6',
    category: 'computer',
  },
  {
    id: '1',
    name: 'ADCA',
    description: 'Advanced Diploma in Computer Applications - Comprehensive 15-month computer course covering essential software and IT skills',
    duration: '15 Months',
    level: 'Diploma',
    icon: 'desktop-windows',
    color: '#8b5cf6',
    category: 'computer',
  },
  {
    id: '2',
    name: 'DCA',
    description: 'Diploma in Computer Applications',
    duration: '12 Months',
    level: 'Diploma',
    icon: 'storage',
    color: '#10b981',
    category: 'diploma',
  },
  {
    id: '3',
    name: 'DCAA',
    description: 'Diploma in Computer Applications & Accountancy',
    duration: '6 Months',
    level: 'Diploma',
    icon: 'calculate',
    color: '#f59e0b',
    category: 'diploma',
  },
  {
    id: '13',
    name: 'DTP',
    description: 'Diploma in Desktop Publishing',
    duration: '6 Months',
    level: 'Diploma',
    icon: 'palette',
    color: '#ef4444',
    category: 'diploma',
  },
  {
    id: '26',
    name: 'CDTP',
    description: 'Certificate in Desktop Publishing',
    duration: '3 Months',
    level: 'Certificate',
    icon: 'brush',
    color: '#06b6d4',
    category: 'certification',
  },
  {
    id: '5',
    name: 'CCA',
    description: 'Certificate in Computer',
    duration: '3 Months',
    level: 'Certificate',
    icon: 'laptop',
    color: '#f97316',
    category: 'certification',
  },
  {
    id: '6',
    name: 'CAC',
    description: 'Certificate in Accounting Course',
    duration: '3 Months',
    level: 'Certificate',
    icon: 'receipt-long',
    color: '#ec4899',
    category: 'certification',
  },
  {
    id: '14',
    name: 'CCC',
    description: 'Course on Computer Concepts',
    duration: '3 Months',
    level: 'Certificate',
    icon: 'verified',
    color: '#14b8a6',
    category: 'nielit',
  },
  {
    id: '15',
    name: 'O LEVEL',
    description: 'NIELIT O Level - IT foundation course equivalent to foundation level',
    duration: '12 Months',
    level: 'Advanced',
    icon: 'school',
    color: '#6366f1',
    category: 'advanced',
  },
  {
    id: '16',
    name: 'DBI',
    description: 'Diploma in Information Technology & Business Intelligence',
    duration: '6 Months',
    level: 'Diploma',
    icon: 'insights',
    color: '#3b82f6',
    category: 'diploma',
  },
  {
    id: '17',
    name: 'C',
    description: 'Certificate in C Programming',
    duration: '2 Months',
    level: 'Certificate',
    icon: 'code',
    color: '#8b5cf6',
    category: 'programming',
  },
  {
    id: '18',
    name: 'C++',
    description: 'Object-Oriented Programming with C++',
    duration: '3 Months',
    level: 'Certificate',
    icon: 'terminal',
    color: '#10b981',
    category: 'programming',
  },
  {
    id: '19',
    name: 'Python',
    description: 'Professional Python Programming',
    duration: '4 Months',
    level: 'Certificate',
    icon: 'data-object',
    color: '#f59e0b',
    category: 'programming',
  },
  {
    id: '20',
    name: 'JavaScript',
    description: 'Modern JavaScript (ES6+)',
    duration: '3 Months',
    level: 'Certificate',
    icon: 'javascript',
    color: '#ef4444',
    category: 'programming',
  },
  {
    id: '21',
    name: 'TypeScript',
    description: 'Mastering TypeScript - Adding Type Safety to JavaScript for large-scale applications',
    duration: '2 Months',
    level: 'Certificate',
    icon: 'code',
    color: '#06b6d4',
    category: 'programming',
  },
];

const CATEGORIES_DATA = [
  { id: 'all', label: 'All Courses', icon: 'apps', color: '#3b82f6' },
  { id: 'computer', label: 'Computer (ADCA/+)', icon: 'computer', color: '#8b5cf6' },
  { id: 'diploma', label: 'Diploma', icon: 'school', color: '#10b981' },
  { id: 'certification', label: 'Certificate', icon: 'verified', color: '#f59e0b' },
  { id: 'nielit', label: 'NIELIT', icon: 'domain', color: '#ef4444' },
  { id: 'programming', label: 'Programming', icon: 'code', color: '#06b6d4' },
  { id: 'advanced', label: 'Advanced', icon: 'stars', color: '#6366f1' },
];

export default function CoursesScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);

  const searchAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;

  const toggleSearch = () => {
    if (isSearchVisible) {
      Animated.timing(searchAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start(() => setIsSearchVisible(false));
    } else {
      setIsSearchVisible(true);
      Animated.timing(searchAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
    }
  };

  const openBottomSheet = () => {
    setBottomSheetVisible(true);
    Animated.spring(slideAnim, { toValue: 0, damping: 22, stiffness: 180, useNativeDriver: true }).start();
  };

  const closeBottomSheet = () => {
    Animated.timing(slideAnim, { toValue: height, duration: 250, useNativeDriver: true }).start(() => setBottomSheetVisible(false));
  };

  const filteredCourses = COURSES_DATA.filter(course => {
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryCount = (categoryId) => {
    if (categoryId === 'all') return COURSES_DATA.length;
    return COURSES_DATA.filter(c => c.category === categoryId).length;
  };

  const handleEnrollPress = (course) => {
    navigation.navigate('Admission', { courseName: course.name, courseId: course.id });
  };

  const CourseCard = ({ course }) => (
    <View style={styles.courseCard}>
      <View style={styles.cardLeft}>
        <View style={[styles.iconContainer, { backgroundColor: `${course.color}15` }]}>
          <MaterialIcons name={course.icon} size={26} color={course.color} />
        </View>
      </View>
      <View style={styles.flex1}>
        <View style={styles.rowBetween}>
          <Text numberOfLines={1} style={styles.courseName}>{course.name}</Text>
          <View style={styles.durationBadge}>
            <MaterialIcons name="schedule" size={12} color="#0284c7" />
            <Text style={styles.durationText}>{course.duration}</Text>
          </View>
        </View>
        
        <Text numberOfLines={2} style={styles.courseDescription}>
          {course.description}
        </Text>
        
        <View style={styles.rowBetween}>
          <View style={[styles.levelBadge, { backgroundColor: `${course.color}15` }]}>
            <Text style={[styles.levelText, { color: course.color }]}>{course.level}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.enrollBtn, { backgroundColor: course.color }]} 
            onPress={() => handleEnrollPress(course)}
            activeOpacity={0.85}
          >
            <Text style={styles.enrollBtnText}>Enroll Now</Text>
            <MaterialIcons name="arrow-forward" size={14} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Background Water Ambient Blobs for Glassmorphism Design */}
      <View style={styles.waterBlobTop} />
      <View style={styles.waterBlobBottom} />

      {/* Modern Glassmorphic Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <View style={styles.brandIconWrapper}>
            <MaterialIcons name="school" size={20} color="#0284c7" />
          </View>
          <View>
            <Text style={styles.topBarTitle}>All Computer Courses</Text>
            <Text style={styles.topBarSubtitle}>Drishtee Computer Centre</Text>
          </View>
        </View>
        <View style={styles.topBarActions}>
          <TouchableOpacity activeOpacity={0.7} onPress={toggleSearch} style={styles.topBarIconBtn}>
            <MaterialIcons name={isSearchVisible ? "close" : "search"} size={20} color="#0f172a" />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} onPress={openBottomSheet} style={styles.topBarFilterBtn}>
            <MaterialIcons name="tune" size={20} color="#0284c7" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Expandable Search Input Drawer */}
      {isSearchVisible && (
        <Animated.View 
          style={[
            styles.searchContainer, 
            {
              opacity: searchAnim,
              maxHeight: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 65] }),
            }
          ]}
        >
          <View style={styles.searchGlassContainer}>
            <MaterialIcons name="search" size={18} color="#64748b" />
            <TextInput 
              autoFocus={true} 
              onChangeText={setSearchQuery} 
              placeholder="Search by course name or keyword..." 
              placeholderTextColor="#94a3b8" 
              style={styles.searchInput} 
              value={searchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialIcons name="cancel" size={18} color="#64748b" />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      )}

      {/* Course List */}
      <FlatList 
        data={filteredCourses} 
        renderItem={({ item }) => <CourseCard course={item} />}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.coursesList}
        ListHeaderComponent={
          <View style={styles.categoryLabelContainer}>
            <View style={styles.activeCategoryPill}>
              <Text style={styles.categoryLabel}>
                {CATEGORIES_DATA.find(c => c.id === selectedCategory)?.label || 'All Courses'}
              </Text>
            </View>
            <Text style={styles.categoryCount}>{filteredCourses.length} results found</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="search-off" size={64} color="#94a3b8" />
            <Text style={styles.emptyTitle}>No Courses Found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search query or category filter</Text>
          </View>
        }
      />

      {/* Bottom Sheet Offcanvas Modal */}
      <Modal animationType="fade" onRequestClose={closeBottomSheet} transparent={true} visible={bottomSheetVisible} statusBarTranslucent>
        <Pressable onPress={closeBottomSheet} style={styles.sheetOverlay}>
          <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]}>
            <Pressable onPress={(e) => e.stopPropagation()} style={styles.flex1}>
              <View style={styles.dragHandleContainer}>
                <View style={styles.dragHandle} />
              </View>

              <View style={styles.sheetHeader}>
                <Text style={styles.sheetMainTitle}>Select Course Category</Text>
                <TouchableOpacity activeOpacity={0.7} onPress={closeBottomSheet} style={styles.sheetCloseBtn}>
                  <MaterialIcons name="close" size={18} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.sheetBody} showsVerticalScrollIndicator={false}>
                {CATEGORIES_DATA.map((category) => {
                  const count = getCategoryCount(category.id);
                  const isActive = selectedCategory === category.id;

                  return (
                    <TouchableOpacity 
                      key={category.id} 
                      onPress={() => {
                        setSelectedCategory(category.id);
                        closeBottomSheet();
                      }} 
                      style={[styles.sheetItem, isActive && styles.sheetItemActive]}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.iconContainerSm, { backgroundColor: isActive ? '#0284c7' : `${category.color}15` }]}>
                        <MaterialIcons name={category.icon} size={20} color={isActive ? '#ffffff' : category.color} />
                      </View>
                      <View style={styles.flex1}>
                        <Text style={[styles.sheetItemLabel, isActive && styles.sheetItemLabelActive]}>
                          {category.label}
                        </Text>
                        <Text style={styles.sheetItemCount}>{count} Courses Available</Text>
                      </View>
                      {isActive && <MaterialIcons name="check-circle" size={20} color="#0284c7" />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.sheetFooter}>
                <Text style={styles.footerText}>Drishtee Computer Centre • Explore & Excel</Text>
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f6ff',
    position: 'relative',
  },
  waterBlobTop: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#38bdf8',
    opacity: 0.16,
    transform: [{ scale: 1.4 }],
  },
  waterBlobBottom: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#34d399',
    opacity: 0.14,
  },
  flex1: {
    flex: 1,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerSm: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 44 : 12,
    paddingBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderBottomWidth: 1.5,
    borderBottomColor: '#ffffff',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    zIndex: 10,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  brandIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(240, 249, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: 0.2,
  },
  topBarSubtitle: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '700',
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topBarIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(241, 245, 249, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  topBarFilterBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(240, 249, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  searchContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.8)',
    zIndex: 9,
  },
  searchGlassContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(241, 245, 249, 0.9)',
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
    paddingVertical: 0,
    paddingHorizontal: 8,
    fontWeight: '600',
  },
  categoryLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  activeCategoryPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0284c7',
  },
  categoryCount: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '800',
  },
  coursesList: {
    paddingHorizontal: 16,
    paddingBottom: 110,
    paddingTop: 12,
  },
  courseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#ffffff',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 3,
  },
  cardLeft: {
    justifyContent: 'center',
    marginRight: 14,
  },
  courseName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
    flex: 1,
    marginRight: 6,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bae6fd',
    gap: 4,
  },
  durationText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0284c7',
  },
  courseDescription: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  levelText: {
    fontSize: 9.5,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  enrollBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  enrollBtnText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '900',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '700',
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 30, 61, 0.65)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: height * 0.75,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(241, 245, 249, 0.8)',
  },
  sheetMainTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetBody: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 6,
    backgroundColor: 'transparent',
  },
  sheetItemActive: {
    backgroundColor: 'rgba(240, 249, 255, 0.9)',
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  sheetItemLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  sheetItemLabelActive: {
    color: '#0284c7',
    fontWeight: '900',
  },
  sheetItemCount: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 1,
    fontWeight: '700',
  },
  sheetFooter: {
    paddingTop: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(241, 245, 249, 0.8)',
    marginHorizontal: 20,
  },
  footerText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '700',
  },
});