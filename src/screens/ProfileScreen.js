import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Login from '../auth/Login';
import StudentDashboard from '../dashboard/student/StudentDashboard';

export default function ProfileScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Login />;
  }

  return <StudentDashboard navigation={navigation} />;
}