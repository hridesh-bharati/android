import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

export default function QuickServices() {
  const navigation = useNavigation();

  const services = [
    { title: 'Online Admission', icon: 'edit-document', color: '#2563eb', route: 'Admission' },
    { title: 'Fee Payment', icon: 'payment', color: '#dc2626', route: 'FeePage' },
    { title: 'Study Material', icon: 'menu-book', color: '#059669', route: 'Notes' },
    { title: 'Test Paper', icon: 'quiz', color: '#7c3aed', route: 'PracticeNavigator' },
    { title: 'Exams', icon: 'event-note', color: '#db2777', route: 'ExamNavigator' },
    { title: 'Results', icon: 'bar-chart', color: '#d97706', route: 'Verification' },
    { title: 'Gallery', icon: 'image', color: '#0284c7', route: 'Gallery' },
    { title: 'Contact Us', icon: 'headset-mic', color: '#0d9488', route: 'ContactUs' },
  ];

  const handlePress = (route) => {
    if (!route) return;
    if (['Home', 'Courses', 'Admission', 'Notes'].includes(route)) {
      navigation.navigate('MainTabs', { screen: route });
    } else {
      navigation.navigate(route);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Quick Services</Text>
      <View style={styles.gridContainer}>
        {services.map((item, idx) => (
          <TouchableOpacity 
            key={idx} 
            style={styles.gridItem} 
            activeOpacity={0.7}
            onPress={() => handlePress(item.route)}
          >
            <View style={styles.glassCard}>
              <MaterialIcons name={item.icon} size={24} color={item.color} style={styles.iconStyle} />
              <Text style={styles.gridText} numberOfLines={2}>
                {item.title}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#071e3d',
    marginBottom: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  gridItem: {
    width: '25%', // Exactly 4 cards per row
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 96,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconStyle: {
    marginBottom: 6,
  },
  gridText: {
    fontSize: 10,
    color: '#071e3d',
    textAlign: 'center',
    fontWeight: '600',
  },
});