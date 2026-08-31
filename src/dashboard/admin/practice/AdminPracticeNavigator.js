// src/dashboard/admin/practice/AdminPracticeNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AdminPracticeDashboard from './AdminPracticeDashboard';
import AdminPracticeUpload from './AdminPracticeUpload';
import AdminPracticeAssign from './AdminPracticeAssign';
import AdminPracticeQuestionsManage from './AdminPracticeQuestionsManage';
import AdminPracticeLive from './AdminPracticeLive';
import AdminPracticeResults from './AdminPracticeResults';

const Stack = createNativeStackNavigator();

export default function AdminPracticeNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="AdminPracticeDashboard">
      <Stack.Screen name="AdminPracticeDashboard" component={AdminPracticeDashboard} />
      <Stack.Screen name="AdminPracticeUpload" component={AdminPracticeUpload} />
      <Stack.Screen name="AdminPracticeAssign" component={AdminPracticeAssign} />
      <Stack.Screen name="AdminPracticeQuestionsManage" component={AdminPracticeQuestionsManage} />
      <Stack.Screen name="AdminPracticeLive" component={AdminPracticeLive} />
      <Stack.Screen name="AdminPracticeResults" component={AdminPracticeResults} />
    </Stack.Navigator>
  );
}