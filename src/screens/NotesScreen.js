import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/theme';

export default function NotesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Notes Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
});