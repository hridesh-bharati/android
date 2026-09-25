// src/components/NotificationBanner.js
import React, { useEffect, useRef } from 'react';
import { 
  Animated, StyleSheet, Text, View, TouchableOpacity, 
  Platform, Dimensions 
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { navigate } from '../services/NavigationService';

const { width } = Dimensions.get('window');

export default function NotificationBanner({ notification, onDismiss }) {
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (notification) {
      // Slide in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 5 sec
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -200,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };

  const handleTap = () => {
    const notif = notification;
    handleDismiss();
    if (notif?.route) {
      setTimeout(() => {
        navigate(notif.route, notif.routeParams);
      }, 300);
    }
  };

  if (!notification) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.inner}
        activeOpacity={0.95}
        onPress={handleTap}
      >
        {/* Left accent bar */}
        <View style={styles.accentBar} />

        {/* Icon */}
        <View style={styles.iconCircle}>
          <MaterialIcons name="notifications-active" size={22} color="#ffffff" />
        </View>

        {/* Text */}
        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.appName}>DRISHTEE</Text>
            <Text style={styles.timeText}>now</Text>
          </View>
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {notification.message}
          </Text>
        </View>

        {/* Close */}
        <TouchableOpacity 
          onPress={handleDismiss} 
          style={styles.closeBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="close" size={16} color="#94a3b8" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 24,
    left: 10,
    right: 10,
    zIndex: 99999,
    elevation: 99999,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    paddingLeft: 16,
    gap: 10,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#0284c7',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  textContainer: {
    flex: 1,
    gap: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 1,
  },
  appName: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#0284c7',
    letterSpacing: 1,
  },
  timeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#94a3b8',
  },
  title: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.1,
  },
  message: {
    fontSize: 11.5,
    color: '#64748b',
    lineHeight: 15,
    fontWeight: '500',
  },
  closeBtn: {
    padding: 4,
    marginRight: -2,
  },
});