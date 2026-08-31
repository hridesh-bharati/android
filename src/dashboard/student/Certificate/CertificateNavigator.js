// src/dashboard/student/certificate/CertificateNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CertificateScreen from './CertificateScreen';

const Stack = createNativeStackNavigator();

export default function CertificateNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="CertificateScreen">
      <Stack.Screen name="CertificateScreen" component={CertificateScreen} />
    </Stack.Navigator>
  );
}