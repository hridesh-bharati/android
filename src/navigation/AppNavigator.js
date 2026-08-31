// src/navigation/AppNavigator.js
import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { AuthContext } from '../context/AuthContext';
import { navigationRef } from '../services/NavigationService';

// Auth Screens
import Login from '../auth/Login';
import Signup from '../auth/Signup';
import ForgotPassword from '../auth/ForgotPassword';

// Main Screens
import HomeScreen from '../screens/HomeScreen';
import CoursesScreen from '../screens/CoursesScreen';
import AdmissionScreen from '../screens/AdmissionScreen';
import NotesScreen from '../screens/NotesScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Dashboards
import AdminDashboard from '../dashboard/admin/AdminDashboard';
import StudentDashboard from '../dashboard/student/StudentDashboard';

// Fee Management Screen
import FeePage from '../dashboard/admin/studentManagement/fees/FeePage';

// Student Profile & Provider & Privacy Security
import StudentProfile from '../dashboard/admin/studentManagement/StudentProfile';
import AdmissionProvider from '../dashboard/admin/studentManagement/AdmissionProvider';
import PrivecySecurity from "../dashboard/student/PrivecySecurity";

// Exam & Practice Navigators (Student Side)
import ExamNavigator from '../dashboard/student/exams/ExamNavigator';
import PracticeNavigator from '../dashboard/student/practice/PracticeNavigator';

// Notes Download Component (Student Notes View)
import NotesDownload from '../components/notes/NotesDownload';

// Queries / Contact Us Form Component
import QueriesForm from '../components/QueriesForm';
import TeamScreen from '../screens/TeamScreen';
import Verification from '../screens/VerificationScreen';
import GalleryScreen from '../components/gallery/GalleryScreen';
import ChatScreen from '../components/ChatScreen'; // 👈 Imported Chat Screen

import AdminExamNavigator from '../dashboard/admin/examManagement/ExamNavigator';
import CertificateNavigator from '../dashboard/student/Certificate/CertificateNavigator';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabNavigator() {
  const { user, role } = useContext(AuthContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          height: 82,
          borderTopWidth: 0,
          paddingBottom: 10,
          paddingTop: 8,
          paddingHorizontal: 8,
          elevation: 15,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          shadowColor: '#0f172a',
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        tabBarItemStyle: {
          marginVertical: 2,
          marginHorizontal: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIcon: ({ color, focused }) => {
          let iconColor = focused ? color : '#64748b';

          if (route.name === 'Home') {
            return (
              <View style={[styles.iconContainer, focused && styles.homeActiveBg]}>
                <MaterialIcons name="home" size={22} color={focused ? '#ef4444' : iconColor} />
              </View>
            );
          }
          if (route.name === 'Courses') {
            return (
              <View style={[styles.iconContainer, focused && styles.coursesActiveBg]}>
                <MaterialIcons name="menu-book" size={22} color={focused ? '#8b5cf6' : iconColor} />
              </View>
            );
          }
          if (route.name === 'Admission') {
            return (
              <View style={styles.centerButtonWrapper}>
                <View style={styles.centerButton}>
                  <MaterialCommunityIcons name="school" size={26} color="#ffffff" />
                </View>
              </View>
            );
          }
          if (route.name === 'Notes') {
            return (
              <View style={[styles.iconContainer, focused && styles.notesActiveBg]}>
                <MaterialIcons name="note-alt" size={22} color={focused ? '#10b981' : iconColor} />
              </View>
            );
          }
          if (route.name === 'DashboardTab') {
            return (
              <View style={[styles.iconContainer, focused && styles.dashboardActiveBg]}>
                <MaterialIcons name="dashboard" size={22} color={focused ? '#f59e0b' : iconColor} />
              </View>
            );
          }
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarActiveTintColor: '#ef4444' }} />
      <Tab.Screen name="Courses" component={CoursesScreen} options={{ tabBarActiveTintColor: '#8b5cf6' }} />
      <Tab.Screen name="Admission" component={AdmissionScreen} options={{ tabBarLabel: 'Admission' }} />
      <Tab.Screen name="Notes" component={NotesDownload} options={{ tabBarActiveTintColor: '#10b981', tabBarLabel: 'Notes' }} />
      <Tab.Screen
        name="DashboardTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Dashboard', tabBarActiveTintColor: '#f59e0b' }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            if (!user) {
              navigation.navigate('Login');
            } else if (role === 'admin' || user.email?.toLowerCase() === 'hridesh027@gmail.com') {
              navigation.navigate('AdminPanel');
            } else {
              navigation.navigate('StudentPanel');
            }
          },
        })}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={styles.center}>
        <View style={styles.spinnerWrapper}>
          <MaterialIcons name="school" size={36} color="#0284c7" />
        </View>
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="MainTabs">
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="AdminPanel" component={AdminDashboard} />
        <Stack.Screen name="StudentPanel" component={StudentDashboard} />
        <Stack.Screen name="FeePage" component={FeePage} />
        <Stack.Screen name="TeamScreen" component={TeamScreen} />
        <Stack.Screen name="Verification" component={Verification} />
        <Stack.Screen name="Gallery" component={GalleryScreen} /> 
        <Stack.Screen name="ChatScreen" component={ChatScreen} /> 
        <Stack.Screen name="PrivecySecurity" component={PrivecySecurity} />

        {/* Exam Modules */}
        <Stack.Screen name="ExamModule" component={AdminExamNavigator} />
        <Stack.Screen name="ExamNavigator" component={ExamNavigator} />
        <Stack.Screen name="PracticeNavigator" component={PracticeNavigator} />
        <Stack.Screen name="CertificateNavigator" component={CertificateNavigator} />
        <Stack.Screen name="StudentProfile">
          {props => (
            <AdmissionProvider>
              <StudentProfile {...props} />
            </AdmissionProvider>
          )}
        </Stack.Screen>

        <Stack.Screen name="ContactUs" component={QueriesForm} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  spinnerWrapper: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeActiveBg: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  coursesActiveBg: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  notesActiveBg: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  dashboardActiveBg: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  centerButtonWrapper: {
    position: 'absolute',
    top: -26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    borderWidth: 4,
    borderColor: '#ffffff',
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});