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

// Student Profile
import StudentProfile from '../dashboard/admin/studentManagement/StudentProfile';

// Queries / Contact Us Form Component
import QueriesForm from '../components/QueriesForm';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabNavigator() {
  const { user, role } = useContext(AuthContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          height: 75,
          borderTopWidth: 0,
          paddingBottom: 12,
          paddingTop: 4,
          paddingHorizontal: 4,
          elevation: 10,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          shadowColor: '#64748b',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        },
        tabBarItemStyle: {
          margin: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: 2,
        },
        tabBarIcon: ({ color, focused }) => {
          let iconColor = focused ? color : '#94a3b8';

          if (route.name === 'Home') {
            return <MaterialIcons name="home" size={24} color={focused ? '#ef4444' : iconColor} />;
          }
          if (route.name === 'Courses') {
            return <MaterialIcons name="menu-book" size={24} color={focused ? '#8b5cf6' : iconColor} />;
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
            return <MaterialIcons name="note-alt" size={24} color={focused ? '#10b981' : iconColor} />;
          }
          if (route.name === 'DashboardTab') {
            return <MaterialIcons name="dashboard" size={24} color={focused ? '#f59e0b' : iconColor} />;
          }
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarActiveTintColor: '#ef4444' }} />
      <Tab.Screen name="Courses" component={CoursesScreen} options={{ tabBarActiveTintColor: '#8b5cf6' }} />
      <Tab.Screen name="Admission" component={AdmissionScreen} options={{ tabBarLabel: 'Admission' }} />
      <Tab.Screen name="Notes" component={NotesScreen} options={{ tabBarActiveTintColor: '#10b981' }} />
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
        <Stack.Screen name="StudentProfile" component={StudentProfile} />
        {/* Registered Contact Us / Queries Form Route */}
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