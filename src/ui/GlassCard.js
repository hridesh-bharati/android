// src/components/ui/GlassCard.js
import React from 'react';
import { View, StyleSheet } from 'react-native';

export function GlassCard({ children, style }) {
  return (
    <View style={[styles.glassCard, style]}>
      {children}
    </View>
  );
}

export function SkeletonLoader({ count = 3 }) {
  return (
    <View style={styles.skeletonContainer}>
      {[...Array(count)].map((_, i) => (
        <View key={i} style={styles.skeletonCard}>
          <View style={styles.skeletonLineLong} />
          <View style={styles.skeletonLineShort} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    padding: 14,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 10,
  },
  skeletonContainer: {
    gap: 10,
    width: '100%',
    padding: 4,
  },
  skeletonCard: {
    height: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 14,
    padding: 14,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
  },
  skeletonLineLong: {
    width: '70%',
    height: 14,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
  },
  skeletonLineShort: {
    width: '40%',
    height: 10,
    backgroundColor: '#cbd5e1',
    borderRadius: 4,
  }
});