import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants/theme';

export default function LetestNotice() {
  return (
    <View style={styles.container}>
      <View style={[styles.sectionHeader, { marginHorizontal: 16, marginTop: 18 }]}>
        <Text style={styles.sectionTitle}>Latest Notices</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.noticeCard} activeOpacity={0.9}>
        {/* Glassmorphic Multi-Color Glow Blob */}
        <View style={styles.cardGlowBlob} />

        <View style={styles.noticeTop}>
          <View style={styles.newBadge}>
            <Text style={styles.newText}>New</Text>
          </View>
          <Text style={styles.noticeHeading} numberOfLines={1}>
            New Batch Started for CCC Course
          </Text>
          <View style={styles.dateRow}>
            <MaterialIcons name="event" size={11} color={COLORS.secondary} />
            <Text style={styles.dateText}>25 May, 2024</Text>
          </View>
        </View>

        <Text style={styles.noticeSub}>Admissions are open. Hurry up!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 10,
  },
  sectionTitle: { 
    fontSize: 15, 
    fontWeight: '800', 
    color: COLORS.primary,
    letterSpacing: 0.3,
  },
  viewAll: { 
    fontSize: 12, 
    color: COLORS.secondary, 
    fontWeight: '700', 
  },
  noticeCard: { 
    backgroundColor: '#f0f9ff', // Light blue glass tint
    marginHorizontal: 16, 
    borderRadius: 20, 
    padding: 16, 
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardGlowBlob: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.secondary,
    opacity: 0.15,
  },
  noticeTop: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
  },
  newBadge: { 
    backgroundColor: '#dfee7a', 
    backgroundColor: 'rgba(2, 132, 199, 0.12)',
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(2, 132, 199, 0.2)',
  },
  newText: { 
    color: COLORS.secondary, 
    fontSize: 10, 
    fontWeight: '800', 
  },
  noticeHeading: { 
    fontSize: 13, 
    fontWeight: '800', 
    color: COLORS.primary, 
    flex: 1, 
    marginLeft: 10, 
  },
  dateRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  dateText: { 
    fontSize: 10, 
    color: COLORS.secondary,
    fontWeight: '700',
    marginLeft: 4,
  },
  noticeSub: { 
    fontSize: 11, 
    color: COLORS.gray, 
    marginTop: 8,
    fontWeight: '500',
  },
});