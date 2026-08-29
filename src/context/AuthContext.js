// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { authListener, getUserRole, loginWithEmail, signupWithEmail, logoutUser } from '../firebase/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};
    
    try {
      unsubscribe = authListener(async (firebaseUser) => {
        setLoading(true);
        if (firebaseUser) {
          setUser(firebaseUser);
          const userRole = await getUserRole(firebaseUser.uid);
          setRole(userRole || 'student');
        } else {
          setUser(null);
          setRole(null);
        }
        setLoading(false);
      });
    } catch (error) {
      console.log("Auth listener error:", error);
      setLoading(false);
    }

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await loginWithEmail(email, password);
      return res;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, role) => {
    try {
      setLoading(true);
      const res = await signupWithEmail(email, password, role);
      return res;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await logoutUser();
      setUser(null);
      setRole(null);
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};