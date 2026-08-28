import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Sidebar from './Sidebar';
import Profile from './Profile';
import CoursesScreen from '../../screens/CoursesScreen';

export default function StudentDashboard({ navigation }) {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <View style={styles.container}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <View style={styles.mainContent}>
        {activeTab === 'home' && <CoursesScreen navigation={navigation} />}
        {activeTab === 'profile' && <Profile />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: '#f8fafc' },
  mainContent: { flex: 1 },
});