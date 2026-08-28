// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
// Sahi relative path check karein apne folder structure ke mutabiq:
import { authListener, getUserRole, loginWithEmail, signupWithEmail, logoutUser } from '../firebase/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authListener(async (firebaseUser) => {
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

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    return await loginWithEmail(email, password);
  };

  const signup = async (email, password, role) => {
    return await signupWithEmail(email, password, role);
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};