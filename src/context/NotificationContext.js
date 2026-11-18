// src/context/NotificationContext.js
import React, { 
  createContext, 
  useState, 
  useEffect, 
  useContext, 
  useCallback,
  useRef,
} from 'react';
import { AppState } from 'react-native';
import { AuthContext } from './AuthContext';
import { 
  fetchAllNotifications, 
  markAsRead, 
  markAllAsRead, 
  isNotificationRead 
} from '../services/notificationService';
import {
  registerForPushNotificationsAsync,
  setupNotificationListeners,
  sendLocalNotification,
  setBadgeCount,
} from '../services/pushNotificationService';

export const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, role } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);
  const [bannerNotification, setBannerNotification] = useState(null);
  const [pushToken, setPushToken] = useState(null);

  const knownNotifIds = useRef(new Set());
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (user?.uid) {
      registerForPushNotificationsAsync(user.uid)
        .then(token => setPushToken(token))
        .catch(err => console.log('Push token error:', err));
    }
  }, [user?.uid]);

  useEffect(() => {
    const cleanup = setupNotificationListeners((notification) => {
      const data = notification?.request?.content?.data;
      if (data) {
        setBannerNotification({
          id: data.id || `push_${Date.now()}`,
          type: data.type || 'general',
          title: notification.request.content.title || 'New Notification',
          message: notification.request.content.body || '',
          route: data.route,
          routeParams: data.routeParams,
          actionable: !!data.route,
        });
      }
    });
    return cleanup;
  }, []);

  const loadNotifications = useCallback(async (showLoader = false) => {
    if (!user) {
      setNotifications([]);
      return;
    }

    if (showLoader) setLoading(true);
    
    try {
      const data = await fetchAllNotifications(user, role);
      const validData = Array.isArray(data) ? data : [];
      
      const enriched = validData.map(n => ({
        ...n,
        read: n.read || isNotificationRead(n.id),
      }));

      const newOnes = enriched.filter(n => !knownNotifIds.current.has(n.id));
      
      if (!isFirstLoad.current && newOnes.length > 0) {
        const latest = newOnes[0];
        setBannerNotification(latest);
        
        await sendLocalNotification(
          latest.title,
          latest.message,
          {
            id: latest.id,
            type: latest.type,
            route: latest.route,
            routeParams: latest.routeParams,
          }
        );
      }

      enriched.forEach(n => knownNotifIds.current.add(n.id));
      isFirstLoad.current = false;
      
      setNotifications(enriched);
      setLastFetched(new Date());

      const unread = enriched.filter(n => !n.read).length;
      setBadgeCount(unread);
    } catch (error) {
      console.log('Notification load error:', error);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [user, role]);

  useEffect(() => {
    loadNotifications(true);

    const interval = setInterval(() => {
      loadNotifications(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [loadNotifications]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && user) {
        loadNotifications(false);
      }
    });
    return () => subscription?.remove();
  }, [user, loadNotifications]);

  const markNotificationRead = useCallback((id) => {
    markAsRead(id);
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      const unreadCountNow = updated.filter(n => !n.read).length;
      setBadgeCount(unreadCountNow);
      return updated;
    });
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    const ids = notifications.map(n => n.id);
    markAllAsRead(ids);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setBadgeCount(0);
  }, [notifications]);

  const dismissBanner = useCallback(() => {
    setBannerNotification(null);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const unreadNotifications = notifications.filter(n => !n.read);

  const value = {
    notifications,
    unreadCount,
    unreadNotifications,
    loading,
    lastFetched,
    bannerNotification,
    pushToken,
    dismissBanner,
    refreshNotifications: () => loadNotifications(true),
    markNotificationRead,
    markAllNotificationsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};