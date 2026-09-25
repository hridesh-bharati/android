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

  // Track known notification IDs to detect NEW ones
  const knownNotifIds = useRef(new Set());
  const isFirstLoad = useRef(true);

  /* ========== REGISTER PUSH TOKEN ON LOGIN ========== */
  useEffect(() => {
    if (user?.uid) {
      registerForPushNotificationsAsync(user.uid)
        .then(token => setPushToken(token))
        .catch(err => console.log('Push token error:', err));
    }
  }, [user?.uid]);

  /* ========== SETUP NOTIFICATION LISTENERS ========== */
  useEffect(() => {
    const cleanup = setupNotificationListeners((notification) => {
      // When a push notification arrives in foreground
      const data = notification.request.content.data;
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

  /* ========== FETCH NOTIFICATIONS ========== */
  const loadNotifications = useCallback(async (showLoader = false) => {
    if (!user) {
      setNotifications([]);
      return;
    }

    if (showLoader) setLoading(true);
    
    try {
      const data = await fetchAllNotifications(user, role);
      
      const enriched = data.map(n => ({
        ...n,
        read: n.read || isNotificationRead(n.id),
      }));

      // ⚡ Detect NEW notifications
      const newOnes = enriched.filter(n => !knownNotifIds.current.has(n.id));
      
      // Show banner only AFTER first load (not for initial batch)
      if (!isFirstLoad.current && newOnes.length > 0) {
        const latest = newOnes[0];
        
        // 1. In-app banner
        setBannerNotification(latest);
        
        // 2. Push notification (system tray) — works even if app minimized
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

      // Track IDs
      enriched.forEach(n => knownNotifIds.current.add(n.id));
      isFirstLoad.current = false;
      
      setNotifications(enriched);
      setLastFetched(new Date());

      // Update app badge
      const unread = enriched.filter(n => !n.read).length;
      setBadgeCount(unread);
    } catch (error) {
      console.log('Notification load error:', error);
    } finally {
      setLoading(false);
    }
  }, [user, role]);

  /* ========== INITIAL LOAD + POLLING ========== */
  useEffect(() => {
    loadNotifications(true);

    // Poll every 30 seconds
    const interval = setInterval(() => {
      loadNotifications(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [loadNotifications]);

  /* ========== FOREGROUND REFRESH ========== */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && user) {
        loadNotifications(false);
      }
    });
    return () => subscription?.remove();
  }, [user, loadNotifications]);

  /* ========== MARK AS READ ========== */
  const markNotificationRead = useCallback((id) => {
    markAsRead(id);
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setBadgeCount(notifications.filter(n => !n.read && n.id !== id).length);
  }, [notifications]);

  /* ========== MARK ALL AS READ ========== */
  const markAllNotificationsRead = useCallback(() => {
    const ids = notifications.map(n => n.id);
    markAllAsRead(ids);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setBadgeCount(0);
  }, [notifications]);

  /* ========== BANNER DISMISS ========== */
  const dismissBanner = useCallback(() => {
    setBannerNotification(null);
  }, []);

  /* ========== COMPUTED ========== */
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