// App.js
import React, { useEffect, useRef } from 'react';
import { StatusBar, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/constants/theme';

/* ============================================================
   NOTIFICATION HANDLER — Ye app ke TOP pe hona chahiye
   Isse foreground me bhi notification popup aayega
   ============================================================ */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    /* ============================================================
       1. ANDROID NOTIFICATION CHANNEL SETUP
       ============================================================ */
    const setupAndroidChannel = async () => {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#0284c7',
          sound: 'default',
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
          bypassDnd: true,
        });
      }
    };
    setupAndroidChannel();

    /* ============================================================
       2. REQUEST PERMISSION (Silently on app start)
       ============================================================ */
    const requestPermissions = async () => {
      try {
        if (Device.isDevice) {
          const { status: existingStatus } =
            await Notifications.getPermissionsAsync();
          let finalStatus = existingStatus;

          if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          }

          console.log('📱 Notification Permission:', finalStatus);
        }
      } catch (err) {
        console.log('Permission error:', err);
      }
    };
    requestPermissions();

    /* ============================================================
       3. NOTIFICATION LISTENERS
       ============================================================ */
    // Jab notification foreground me aaye
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log('📩 Notification received:', notification);
      });

    // Jab user notification pe tap kare
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('👆 Notification tapped:', response);
        const data = response.notification.request.content.data;
        if (data?.route) {
          const { navigate } = require('./src/services/NavigationService');
          setTimeout(() => {
            navigate(data.route, data.routeParams);
          }, 500);
        }
      });

    /* ============================================================
       4. CLEANUP
       ============================================================ */
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(
          responseListener.current
        );
      }
    };
  }, []);

  return (
    <AuthProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <AppNavigator />
      </SafeAreaView>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
});