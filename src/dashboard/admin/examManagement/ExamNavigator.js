// src/dashboard/admin/examManagement/ExamNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ExamProvider } from './context/ExamProvider';

import AdminExamDashboard from './admin/pages/AdminExamDashboard';
import AdminCreateExam from './admin/pages/AdminCreateExam';
import AdminAddQuestions from './admin/pages/AdminAddQuestions';
import AdminAssignExam from './admin/pages/AdminAssignExam';
import AdminCompletedExams from './admin/pages/AdminCompletedExams';
import AdminExamResultView from './admin/pages/AdminExamResultView';
import AdminLiveTracking from './admin/pages/AdminLiveTracking';

const Stack = createNativeStackNavigator();

export default function ExamNavigator() {
  return (
    <ExamProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="AdminExamDashboard">
        <Stack.Screen name="AdminExamDashboard" component={AdminExamDashboard} />
        <Stack.Screen name="AdminCreateExam" component={AdminCreateExam} />
        <Stack.Screen name="AdminAddQuestions" component={AdminAddQuestions} />
        <Stack.Screen name="AdminAssignExam" component={AdminAssignExam} />
        <Stack.Screen name="AdminCompletedExams" component={AdminCompletedExams} />
        <Stack.Screen name="AdminExamResultView" component={AdminExamResultView} />
        <Stack.Screen name="AdminLiveTracking" component={AdminLiveTracking} />
      </Stack.Navigator>
    </ExamProvider>
  );
}