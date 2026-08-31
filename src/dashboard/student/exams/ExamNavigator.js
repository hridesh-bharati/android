// src/dashboard/student/exams/ExamNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StudentExamList from './StudentExamList';
import StudentExamPage from './StudentExamPage';
import StudentExamGreet from './StudentExamGreet';

const Stack = createNativeStackNavigator();

export default function ExamNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="StudentExamList">
      <Stack.Screen name="StudentExamList" component={StudentExamList} />
      <Stack.Screen name="StudentExamPage" component={StudentExamPage} />
      <Stack.Screen name="StudentExamGreet" component={StudentExamGreet} />
    </Stack.Navigator>
  );
}