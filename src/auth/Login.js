// src/auth/Login.js
import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const COLORS = {
  background: "#F4F7FB",
  primaryBlue: "#0284c7",
  textDark: "#0F172A",
  textSecondary: "#64748B",
};

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { login, loginWithGoogle, loginWithGithub } = useContext(AuthContext);

  const handleNavigationRoute = (userEmail, userRole) => {
    const cleanEmail = userEmail ? userEmail.trim().toLowerCase() : '';
    if (cleanEmail === 'hridesh027@gmail.com' || userRole === 'admin') {
      navigation.replace('AdminPanel');
    } else {
      navigation.replace('StudentPanel');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      const resUser = await login(email.trim(), password);
      handleNavigationRoute(email, resUser?.role);
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      setLoading(true);
      let resUser;
      if (provider === 'Google') {
        resUser = await loginWithGoogle();
      } else if (provider === 'GitHub') {
        resUser = await loginWithGithub();
      }
      handleNavigationRoute(resUser?.email, resUser?.role);
    } catch (error) {
      Alert.alert(`${provider} Sign-In Failed`, error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.wrapper}
    >
      <View style={styles.blobShape} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="school" size={32} color={COLORS.primaryBlue} />
          </View>
          <Text style={styles.title}>Drishtee Computer Centre</Text>
          <Text style={styles.subtitle}>Sign in to your portal</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Text style={[styles.floatingLabel, (focusedField === 'email' || email.length > 0) && styles.floatingLabelActive]}>
              Email Address
            </Text>
            <View style={[styles.inputBox, focusedField === 'email' && styles.inputBoxFocused]}>
              <MaterialIcons name="mail-outline" size={20} color={focusedField === 'email' ? COLORS.primaryBlue : COLORS.textSecondary} style={styles.prefixIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter your email"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={[styles.floatingLabel, (focusedField === 'password' || password.length > 0) && styles.floatingLabelActive]}>
              Password
            </Text>
            <View style={[styles.inputBox, focusedField === 'password' && styles.inputBoxFocused]}>
              <MaterialIcons name="lock-outline" size={20} color={focusedField === 'password' ? COLORS.primaryBlue : COLORS.textSecondary} style={styles.prefixIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter your password"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          <Pressable 
            style={styles.forgotPassContainer} 
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPassText}>Forgot Password?</Text>
          </Pressable>

          <Pressable 
            style={({ pressed }) => [styles.submitButton, pressed && { opacity: 0.85 }]} 
            onPress={handleLogin} 
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.submitButtonText}>Login</Text>}
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR CONNECT WITH</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <Pressable 
              style={({ pressed }) => [styles.socialBtn, pressed && { opacity: 0.7 }]} 
              onPress={() => handleSocialLogin('Google')}
            >
              <FontAwesome name="google" size={18} color="#DB4437" />
              <Text style={styles.socialBtnText}>Google</Text>
            </Pressable>

            <Pressable 
              style={({ pressed }) => [styles.socialBtn, pressed && { opacity: 0.7 }]} 
              onPress={() => handleSocialLogin('GitHub')}
            >
              <FontAwesome name="github" size={18} color="#0F172A" />
              <Text style={styles.socialBtnText}>GitHub</Text>
            </Pressable>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Don't have an account? </Text>
            <Pressable onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.switchLink}>Sign Up</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: COLORS.background },
  container: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  blobShape: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(2, 132, 199, 0.12)",
    zIndex: 0,
  },
  headerContainer: { alignItems: 'center', marginBottom: 24, zIndex: 1 },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.90)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.8)",
    shadowColor: COLORS.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.textDark, textAlign: 'center' },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4, fontWeight: '500' },
  form: { 
    backgroundColor: "rgba(255, 255, 255, 0.85)", 
    padding: 20, 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: "rgba(255, 255, 255, 0.95)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3, 
    gap: 14,
    zIndex: 1
  },
  inputWrapper: { position: "relative" },
  floatingLabel: { 
    fontSize: 11, 
    fontWeight: '700', 
    color: COLORS.textSecondary, 
    marginBottom: 4,
    marginLeft: 4,
    textTransform: "uppercase" 
  },
  floatingLabelActive: { color: COLORS.primaryBlue },
  inputBox: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#F8FAFC", 
    borderWidth: 1, 
    borderColor: "#CBD5E1", 
    borderRadius: 14, 
    paddingHorizontal: 12, 
    height: 52 
  },
  inputBoxFocused: { borderColor: COLORS.primaryBlue, borderWidth: 1.5, backgroundColor: "#FFFFFF" },
  prefixIcon: { marginRight: 10 },
  textInput: { flex: 1, fontSize: 14, color: COLORS.textDark, height: "100%", fontWeight: "500" },
  forgotPassContainer: { alignSelf: 'flex-end', marginTop: -2 },
  forgotPassText: { fontSize: 12, color: COLORS.primaryBlue, fontWeight: '700' },
  submitButton: { 
    height: 52, 
    backgroundColor: COLORS.primaryBlue, 
    borderRadius: 14, 
    justifyContent: "center", 
    alignItems: "center",
    shadowColor: COLORS.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 4
  },
  submitButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '700', marginHorizontal: 8 },
  socialRow: { flexDirection: 'row', gap: 10 },
  socialBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#CBD5E1', paddingVertical: 12, borderRadius: 14, gap: 8, backgroundColor: '#FFFFFF' },
  socialBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 4 },
  switchText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
  switchLink: { fontSize: 12, color: COLORS.primaryBlue, fontWeight: '800' },
});