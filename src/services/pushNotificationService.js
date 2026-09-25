// src/services/pushNotificationService.js
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

/* ============================================================
   CONFIGURE FOREGROUND NOTIFICATION HANDLER
   ============================================================ */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/* ============================================================
   REQUEST PERMISSION + GET PUSH TOKEN
   ============================================================ */
export const registerForPushNotificationsAsync = async (userId) => {
  let token = null;

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0284c7',
        sound: 'default',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Push notification permission not granted');
        return null;
      }

      // Get Expo push token
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ||
        Constants?.easConfig?.projectId;

      token = (
        await Notifications.getExpoPushTokenAsync({ projectId })
      ).data;

      console.log('✅ Expo Push Token:', token);

      // Save token to Firestore for this user
      if (userId && token) {
        await setDoc(
          doc(db, 'users', userId),
          {
            expoPushToken: token,
            pushTokenUpdatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
    } else {
      console.log('⚠️ Must use physical device for Push Notifications');
    }
  } catch (error) {
    console.log('❌ Push notification registration error:', error);
  }

  return token;
};

/* ============================================================
   SEND LOCAL PUSH NOTIFICATION (Instantly)
   ============================================================ */
export const sendLocalNotification = async (title, body, data = {}) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
        badge: 1,
      },
      trigger: null, // immediately
    });
  } catch (error) {
    console.log('Local notification error:', error);
  }
};

/* ============================================================
   SET BADGE COUNT (iOS)
   ============================================================ */
export const setBadgeCount = async (count) => {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.log('Badge error:', error);
  }
};

/* ============================================================
   LISTENERS SETUP
   ============================================================ */
export const setupNotificationListeners = (onNotificationReceived) => {
  // Foreground notification received
  const foregroundSub = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('📩 Foreground notification:', notification);
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    }
  );

  // User taps on notification
  const responseSub = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      console.log('👆 Notification tapped:', response);
      const data = response.notification.request.content.data;
      
      if (data?.route) {
        const { navigate } = require('./NavigationService');
        setTimeout(() => {
          navigate(data.route, data.routeParams);
        }, 500);
      }
    }
  );

  return () => {
    foregroundSub.remove();
    responseSub.remove();
  };
};

/* ============================================================
   CANCEL ALL NOTIFICATIONS
   ============================================================ */
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.dismissAllNotificationsAsync();
  } catch (error) {
    console.log('Cancel notifications error:', error);
  }
};