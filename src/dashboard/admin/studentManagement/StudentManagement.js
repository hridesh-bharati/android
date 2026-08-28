// src/dashboard/admin/studentManagement/StudentManagement.js
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import AdmissionProvider from './AdmissionProvider';
import AdmissionsList from './AdmissionsList';
import NewAdmissions from './NewAdmissions';
import StudentProfile from './StudentProfile';

export default function StudentManagement({ viewMode = 'admitted' }) {
  const [currentScreen, setCurrentScreen] = useState('list');
  const [selectedEmail, setSelectedEmail] = useState(null);

  const navigationMock = {
    navigate: (screenName, params) => {
      if (screenName === 'StudentProfile' && params?.email) {
        setSelectedEmail(params.email);
        setCurrentScreen('profile');
      }
    },
    goBack: () => {
      setCurrentScreen('list');
      setSelectedEmail(null);
    }
  };

  return (
    <AdmissionProvider>
      <View style={styles.container}>
        {currentScreen === 'list' && (
          viewMode === 'new_adm' ? <NewAdmissions navigation={navigationMock} /> : <AdmissionsList navigation={navigationMock} />
        )}
        {currentScreen === 'profile' && <StudentProfile route={{ params: { email: selectedEmail } }} navigation={navigationMock} />}
      </View>
    </AdmissionProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
});