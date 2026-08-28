// src/auth/Signup.js
import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

export default function Signup({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useContext(AuthContext);

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await signup(email.trim(), password, 'student');
      Alert.alert('Success', 'Account created successfully!');
    } catch (error) {
      Alert.alert('Signup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = (provider) => {
    Alert.alert('Coming Soon', `${provider} registration integration will be available shortly.`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <MaterialIcons name="person-add" size={48} color="#0284c7" />
        <Text style={styles.title}>Student Registration</Text>
        <Text style={styles.subtitle}>Create a new account</Text>
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

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Create a password"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleSignup} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign Up</Text>}
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR SIGN UP WITH</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialRow}>
          <TouchableOpacity 
            style={[styles.socialBtn, { borderColor: '#db4437' }]} 
            onPress={() => handleSocialSignup('Google')}
          >
            <FontAwesome name="google" size={18} color="#db4437" />
            <Text style={[styles.socialBtnText, { color: '#db4437' }]}>Google</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.socialBtn, { borderColor: '#333333' }]} 
            onPress={() => handleSocialSignup('GitHub')}
          >
            <FontAwesome name="github" size={18} color="#333333" />
            <Text style={[styles.socialBtnText, { color: '#333333' }]}>GitHub</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Already have an account? </Text>
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
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  form: { backgroundColor: '#ffffff', padding: 20, borderRadius: 20, elevation: 3, gap: 14 },
  inputGroup: { gap: 6 },
  label: { fontSize: 12, fontWeight: '600', color: '#334155' },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: '#0f172a' },
  btn: { backgroundColor: '#0284c7', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  dividerText: { fontSize: 10, color: '#94a3b8', fontWeight: '600', marginHorizontal: 8 },
  socialRow: { flexDirection: 'row', gap: 10 },
  socialBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, paddingVertical: 10, borderRadius: 10, gap: 8, backgroundColor: '#f8fafc' },
  socialBtnText: { fontSize: 13, fontWeight: '600' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 4 },
  switchText: { fontSize: 12, color: '#64748b' },
  switchLink: { fontSize: 12, color: '#0284c7', fontWeight: '700' },
});