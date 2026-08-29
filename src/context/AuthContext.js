// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { 
  authListener, 
  getUserRole, 
  loginWithEmail, 
  signupWithEmail, 
  logoutUser, 
  loginWithGoogleAuth,
  loginWithGithubAuth 
} from '../firebase/auth';

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
      const resUser = await loginWithEmail(email, password);
      setUser(resUser);
      const userRole = await getUserRole(resUser.uid);
      setRole(userRole || 'student');
      return resUser;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, roleInput) => {
    try {
      setLoading(true);
      const resUser = await signupWithEmail(email, password, roleInput);
      setUser(resUser);
      const userRole = await getUserRole(resUser.uid);
      setRole(userRole || 'student');
      return resUser;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const resUser = await loginWithGoogleAuth();
      setUser(resUser);
      const userRole = await getUserRole(resUser.uid);
      setRole(userRole || 'student');
      return resUser;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGithub = async () => {
    try {
      setLoading(true);
      const resUser = await loginWithGithubAuth();
      setUser(resUser);
      const userRole = await getUserRole(resUser.uid);
      setRole(userRole || 'student');
      return resUser;
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
    <AuthContext.Provider value={{ user, role, loading, login, signup, loginWithGoogle, loginWithGithub, logout }}>
      {children}
    </AuthContext.Provider>
  );
};