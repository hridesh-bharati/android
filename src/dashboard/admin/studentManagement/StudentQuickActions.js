// src/dashboard/admin/studentManagement/StudentQuickActions.js
import React, { memo } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { navigate } from "../../../services/NavigationService";

const StudentQuickActions = memo(({ studentData }) => {
  const actions = [
    { 
      label: 'CERTIFICATE', 
      icon: 'verified', 
      color: '#673AB7', 
      bg: '#f3e8ff', 
      screen: 'certificate', 
      disabled: studentData.certificateDisabled 
    },
    { 
      label: 'FEES REPORT', 
      icon: 'currency-exchange', 
      color: '#00C853', 
      bg: '#dcfce7', 
      screen: 'FeePage',
      params: { email: studentData.email }
    },
    { 
      label: 'EXAM DATA', 
      icon: 'medical-services', 
      color: '#f59e0b', 
      bg: '#fef3c7', 
      screen: 'test-records' 
    }
  ];

  const handleNavigate = (action) => {
    if (action.disabled) {
      console.log('Action disabled:', action.label);
      return;
    }
    
    console.log('Navigating to:', action.screen, 'with params:', action.params);
    navigate(action.screen, action.params || { email: studentData.email });
  };

  return (
    <View style={styles.row}>
      {actions.map((action, i) => (
        <View key={i} style={styles.actionWrapper}>
          <TouchableOpacity 
            style={[styles.circleButton, { backgroundColor: action.bg || '#f1f5f9', borderColor: `${action.color}30` }]}
            onPress={() => handleNavigate(action)}
            activeOpacity={0.8}
          >
            <MaterialIcons 
              name={action.disabled ? 'lock' : action.icon} 
              size={22} 
              color={action.disabled ? '#ef4444' : action.color} 
            />
          </TouchableOpacity>
          <Text style={styles.actionText} numberOfLines={1}>{action.label}</Text>
        </View>
      ))}
    </View>
  );
});

export default StudentQuickActions;

const styles = StyleSheet.create({
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginBottom: 16, 
    paddingHorizontal: 10 
  },
  actionWrapper: { 
    alignItems: 'center', 
    flex: 1 
  },
  circleButton: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1, 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionText: { 
    fontSize: 9, 
    fontWeight: '800', 
    color: '#0f172a', 
    marginTop: 6, 
    letterSpacing: 0.3,
    textAlign: 'center'
  }
});