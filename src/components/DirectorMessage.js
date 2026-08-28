import React from 'react';
import { StyleSheet, Text, View, Image, Platform, Linking, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants/theme';

const DIRECTOR_INFO = {
  name: 'Ajay Tiwari',
  role: 'Founder & Director, Drishtee',
  message: 'Our objective is not just to provide computer education, but to make every student an expert in technical skills and lay the foundation for their bright future. Welcome to Drishtee Computer Centre.',
  location: 'Nichlaul, Maharajganj',
  phone: '9918151032',
};

export default function DirectorMessage() {
  const handleCall = () => Linking.openURL(`tel:${DIRECTOR_INFO.phone}`);

  const renderFooterItem = (icon, text, onPress, isPhone = false) => {
    const Component = onPress ? TouchableOpacity : View;
    return (
      <Component style={styles.footerItem} activeOpacity={0.7} onPress={onPress}>
        <MaterialIcons name={icon} size={13} color={isPhone ? '#0284c7' : '#0284c7'} />
        <Text style={[styles.footerText, isPhone && styles.phoneText]}>{text}</Text>
      </Component>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Director's Message</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.glowBlob} />

        <View style={styles.contentRow}>
          <View style={styles.imageWrapper}>
            <Image source={require('../../assets/team1.avif')} style={styles.directorImage} resizeMode="cover" />
            <View style={styles.badgeIcon}>
              <MaterialIcons name="verified" size={14} color="#0284c7" />
            </View>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.directorName}>{DIRECTOR_INFO.name}</Text>
            <Text style={styles.directorRole}>{DIRECTOR_INFO.role}</Text>
            <Text style={styles.messageText} numberOfLines={4}>"{DIRECTOR_INFO.message}"</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          {renderFooterItem('location-pin', DIRECTOR_INFO.location)}
          {renderFooterItem('phone', DIRECTOR_INFO.phone, handleCall, true)}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    marginBottom: 30,
  },
  sectionHeader: { 
    paddingHorizontal: 16, 
    marginTop: 14, 
    marginBottom: 10,
  },
  sectionTitle: { 
    fontSize: 15, 
    fontWeight: '800', 
    color: COLORS.primary,
    letterSpacing: 0.3,
  },
  card: {
    marginHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#ffffff',
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#0284c7',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  glowBlob: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#0284c7',
    opacity: 0.15,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  imageWrapper: {
    position: 'relative',
  },
  directorImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: '#bae6fd',
  },
  badgeIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 2,
    elevation: 2,
  },
  textContainer: {
    flex: 1,
  },
  directorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  directorRole: {
    fontSize: 11,
    color: '#0284c7',
    fontWeight: '600',
    marginBottom: 6,
  },
  messageText: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.6)',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  phoneText: {
    color: '#0284c7',
  },
});