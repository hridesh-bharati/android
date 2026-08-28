import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Dashboard({ activeTab }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.welcomeBanner}>
        <Text style={styles.bannerTitle}>Welcome, Administrator 👋</Text>
        <Text style={styles.bannerSubtitle}>
          Drishtee Computer Centre Management Console — oversee active admissions, student progress, and platform analytics in real-time.
        </Text>
      </View>

      <View style={styles.metricsGrid}>
        <View style={[styles.metricCard, { borderLeftColor: '#7c3aed' }]}>
          <MaterialCommunityIcons name="account-group" size={22} color="#7c3aed" />
          <View>
            <Text style={styles.metricNumber}>138</Text>
            <Text style={styles.metricLabel}>Total Students</Text>
          </View>
        </View>

        <View style={[styles.metricCard, { borderLeftColor: '#0284c7' }]}>
          <MaterialCommunityIcons name="lightning-bolt" size={22} color="#0284c7" />
          <View>
            <Text style={styles.metricNumber}>0</Text>
            <Text style={styles.metricLabel}>New Today</Text>
          </View>
        </View>
      </View>

      {activeTab && activeTab !== 'dashboard' && (
        <View style={styles.activeViewCard}>
          <Text style={styles.activeViewTitle}>Active Module: {activeTab.replace('_', ' ').toUpperCase()}</Text>
          <Text style={styles.activeViewBody}>
            Management view loaded for {activeTab}. Configure and monitor records seamlessly from here.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  welcomeBanner: {
    backgroundColor: '#071e3d',
    borderRadius: 16,
    padding: 22,
    marginBottom: 20,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 6,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  metricNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  activeViewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeViewTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  activeViewBody: {
    fontSize: 13,
    color: '#475569',
  },
});