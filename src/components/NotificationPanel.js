// src/components/NotificationPanel.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/theme';
import { useNotifications } from '../context/NotificationContext';
import { 
  formatRelativeTime, 
  NOTIFICATION_TYPES 
} from '../services/notificationService';

/* ============ Icon + Color per notification type ============ */
const getNotificationMeta = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.ADMISSION_PENDING:
      return { icon: 'assignment', color: '#f59e0b', bg: '#fef3c7' };
    case NOTIFICATION_TYPES.ADMISSION_APPROVED:
      return { icon: 'check-circle', color: '#10b981', bg: '#d1fae5' };
    case NOTIFICATION_TYPES.FEE_DUE:
      return { icon: 'warning', color: '#ef4444', bg: '#fee2e2' };
    case NOTIFICATION_TYPES.FEE_PAID:
      return { icon: 'payments', color: '#10b981', bg: '#d1fae5' };
    case NOTIFICATION_TYPES.EXAM_SCHEDULED:
      return { icon: 'event', color: '#8b5cf6', bg: '#ede9fe' };
    case NOTIFICATION_TYPES.EXAM_RESULT:
      return { icon: 'bar-chart', color: '#3b82f6', bg: '#dbeafe' };
    case NOTIFICATION_TYPES.NEW_QUERY:
      return { icon: 'help', color: '#ec4899', bg: '#fce7f3' };
    case NOTIFICATION_TYPES.NEW_MESSAGE:
      return { icon: 'chat', color: '#0ea5e9', bg: '#e0f2fe' };
    case NOTIFICATION_TYPES.CERTIFICATE_READY:
      return { icon: 'workspace-premium', color: '#f59e0b', bg: '#fef3c7' };
    case NOTIFICATION_TYPES.NEW_STUDENT:
      return { icon: 'person-add', color: '#0284c7', bg: '#e0f2fe' };
    case NOTIFICATION_TYPES.BIRTHDAY:
      return { icon: 'cake', color: '#ec4899', bg: '#fce7f3' };
    default:
      return { icon: 'notifications', color: '#64748b', bg: '#f1f5f9' };
  }
};

export default function NotificationPanel({ visible, onClose }) {
  const navigation = useNavigation();
  const { 
    notifications, 
    unreadCount,
    loading, 
    markNotificationRead,
    markAllNotificationsRead,
    refreshNotifications,
  } = useNotifications();

  const handleNotificationPress = (notification) => {
    markNotificationRead(notification.id);
    onClose();
    
    if (notification.actionable && notification.route) {
      setTimeout(() => {
        try {
          const parentNav = navigation.getParent();
          const nav = parentNav || navigation;
          nav.navigate(notification.route, notification.routeParams);
        } catch (err) {
          console.log('Navigation error:', err);
        }
      }, 200);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose} 
        />

        <View style={styles.panel}>
          {/* Header */}
          <View style={styles.panelHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.panelTitle}>Notifications</Text>
              {unreadCount > 0 && (
                <View style={styles.unreadPill}>
                  <Text style={styles.unreadPillText}>{unreadCount} new</Text>
                </View>
              )}
            </View>
            <View style={styles.headerActions}>
              {unreadCount > 0 && (
                <TouchableOpacity 
                  onPress={markAllNotificationsRead} 
                  style={styles.actionBtn}
                >
                  <MaterialIcons name="done-all" size={18} color={COLORS.primary} />
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                onPress={() => refreshNotifications()} 
                style={styles.actionBtn}
              >
                <MaterialIcons name="refresh" size={18} color="#64748b" />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <MaterialIcons name="close" size={18} color="#64748b" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Body */}
          <ScrollView 
            style={styles.listScroll}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {loading && notifications.length === 0 ? (
              <View style={styles.emptyState}>
                <ActivityIndicator color={COLORS.primary} />
                <Text style={styles.emptyText}>Loading notifications...</Text>
              </View>
            ) : notifications.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrapper}>
                  <MaterialIcons name="notifications-off" size={36} color="#cbd5e1" />
                </View>
                <Text style={styles.emptyTitle}>All Caught Up!</Text>
                <Text style={styles.emptyText}>
                  You have no new notifications right now.
                </Text>
              </View>
            ) : (
              notifications.map((item, index) => {
                const meta = getNotificationMeta(item.type);
                return (
                  <TouchableOpacity
                    key={item.id || index}
                    style={[
                      styles.notifItem,
                      !item.read && styles.notifItemUnread,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => handleNotificationPress(item)}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: meta.bg }]}>
                      <MaterialIcons name={meta.icon} size={20} color={meta.color} />
                    </View>

                    <View style={styles.notifContent}>
                      <View style={styles.notifTopRow}>
                        <Text 
                          style={styles.notifTitle}
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        {!item.read && <View style={styles.unreadDot} />}
                      </View>
                      <Text 
                        style={styles.notifMessage}
                        numberOfLines={2}
                      >
                        {item.message}
                      </Text>
                      <Text style={styles.notifTime}>
                        {formatRelativeTime(item.timestamp)}
                      </Text>
                    </View>

                    {item.actionable && (
                      <MaterialIcons 
                        name="chevron-right" 
                        size={18} 
                        color="#cbd5e1" 
                      />
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          {/* Footer */}
          {notifications.length > 0 && (
            <View style={styles.panelFooter}>
              <Text style={styles.footerText}>
                Showing {notifications.length} recent notification{notifications.length > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    paddingRight: 12,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  panel: {
    width: '92%',
    maxWidth: 380,
    maxHeight: '78%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    elevation: 20,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    overflow: 'hidden',
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.2,
  },
  unreadPill: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadPillText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    marginLeft: 2,
  },
  listScroll: {
    maxHeight: 460,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
    gap: 12,
  },
  notifItemUnread: {
    backgroundColor: '#f0f9ff',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifContent: {
    flex: 1,
    gap: 2,
  },
  notifTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  notifMessage: {
    fontSize: 11.5,
    color: '#64748b',
    lineHeight: 16,
  },
  notifTime: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
    gap: 8,
  },
  emptyIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#334155',
  },
  emptyText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
  },
  panelFooter: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#fafafa',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10.5,
    color: '#94a3b8',
    fontWeight: '600',
  },
});