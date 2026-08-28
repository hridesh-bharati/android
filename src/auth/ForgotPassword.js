// src/auth/ForgotPassword.js
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { resetPassword } from '../firebase/auth';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your registered email address');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email.trim());
      Alert.alert('Success', 'Password reset instructions have been sent to your email.');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <MaterialIcons name="lock-reset" size={48} color="#0284c7" />
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Enter your email to receive recovery link</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleReset} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send Reset Link</Text>}
        </TouchableOpacity>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Remembered your password? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.switchLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center', paddingHorizontal: 20 },
  headerContainer: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginTop: 10 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4, textAlign: 'center' },
  form: { backgroundColor: '#ffffff', padding: 20, borderRadius: 20, elevation: 3, gap: 14 },
  inputGroup: { gap: 6 },
  label: { fontSize: 12, fontWeight: '600', color: '#334155' },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: '#0f172a' },
  btn: { backgroundColor: '#0284c7', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 4 },
  switchText: { fontSize: 12, color: '#64748b' },
  switchLink: { fontSize: 12, color: '#0284c7', fontWeight: '700' },
});