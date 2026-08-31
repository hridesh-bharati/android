// src/dashboard/student/practice/PracticeNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PracticeTestList from './PracticeTestList';
import PracticeAttemptPage from './PracticeAttemptPage';
import PracticeMyResults from './PracticeMyResults';

const Stack = createNativeStackNavigator();

export default function PracticeNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="PracticeTestList">
      <Stack.Screen name="PracticeTestList" component={PracticeTestList} />
      <Stack.Screen name="PracticeAttemptPage" component={PracticeAttemptPage} />
      <Stack.Screen name="PracticeMyResults" component={PracticeMyResults} />
    </Stack.Navigator>
  );
}