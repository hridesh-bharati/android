import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/theme';

export default function PopularCourses() {
  const navigation = useNavigation();

  const courses = [
    { title: 'CCC', desc: 'Course', time: '3 Months', icon: 'desktop-windows', accent: '#ef4444', bgTint: '#fef2f2' },
    { title: 'ADCA+', desc: 'Course', time: '18 Months', icon: 'badge', accent: '#8b5cf6', bgTint: '#f5f3ff' },
    { title: 'DCA', desc: 'Course', time: '12 Months', icon: 'computer', accent: '#0284c7', bgTint: '#f0f9ff' },
    { title: 'Tally Prime', desc: 'Course', time: '3 Months', icon: 'calculate', accent: '#10b981', bgTint: '#ecfdf5' },
  ];

  const handlePress = () => {
    // Agar aapka bottom tab 'Courses' hai
    navigation.navigate('Courses');
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Popular Courses</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={handlePress}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScrollContent}>
        {courses.map((item, idx) => (
          <TouchableOpacity 
            key={idx} 
            style={[styles.courseCard, { backgroundColor: item.bgTint }]} 
            activeOpacity={0.85}
            onPress={handlePress}
          >
            <View style={[styles.cardGlowBlob, { backgroundColor: item.accent }]} />

            <View style={[styles.courseIconBox, { borderColor: item.accent + '30' }]}>
              <MaterialIcons name={item.icon} size={26} color={item.accent} />
            </View>

            <Text style={styles.courseTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.courseDesc}>{item.desc}</Text>

            <View style={[styles.timeBadge, { borderColor: item.accent + '30' }]}>
              <MaterialIcons name="schedule" size={10} color={item.accent} />
              <Text style={[styles.timeText, { color: item.accent }]}>{item.time}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
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
  viewAll: { 
    fontSize: 12, 
    color: COLORS.secondary, 
    fontWeight: '700', 
  },
  hScrollContent: { 
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  courseCard: { 
    width: 122,
    paddingVertical: 16, 
    paddingHorizontal: 10, 
    borderRadius: 20, 
    marginRight: 14, 
    alignItems: 'center', 
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardGlowBlob: {
    position: 'absolute',
    top: -25,
    right: -25,
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.2,
  },
  courseIconBox: { 
    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
    width: 52, 
    height: 52, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 10,
    borderWidth: 1,
    elevation: 1,
  },
  courseTitle: { 
    fontSize: 14, 
    fontWeight: '800', 
    color: COLORS.primary,
    textAlign: 'center',
  },
  courseDesc: { 
    fontSize: 10, 
    color: COLORS.gray, 
    marginBottom: 10,
    fontWeight: '500',
  },
  timeBadge: {
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  timeText: { 
    fontSize: 9, 
    fontWeight: '700',
    marginLeft: 3, 
  },
});