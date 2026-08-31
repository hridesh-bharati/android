// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  authListener, 
  getUserRole, 
  loginWithEmail, 
  signupWithEmail, 
  logoutUser, 
  loginWithGoogleAuth,
  loginWithGithubAuth 
} from '../firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export const AuthContext = createContext();

// Custom hook to consume AuthContext safely
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// ✅ Helper to get photo from any field
const getPhotoUrl = (data) => {
  if (!data) return null;
  return data.photoURL || data.photoUrl || data.photo || data.avatar || data.profilePhoto || null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // ✅ Get user profile from Firestore
  const getUserProfileFromFirestore = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.log('Error fetching user profile:', error);
      return null;
    }
  };

  // ✅ Merge user data
  const mergeUserData = (firebaseUser, profile) => {
    return {
      ...firebaseUser,
      displayName: profile?.name || 
                   profile?.displayName || 
                   firebaseUser.displayName || 
                   firebaseUser.email?.split('@')[0] || 
                   'User',
      photoURL: getPhotoUrl(profile) || firebaseUser.photoURL || null,
      photoUrl: getPhotoUrl(profile) || firebaseUser.photoURL || null,
    };
  };

  useEffect(() => {
    let unsubscribe = () => {};
    
    try {
      unsubscribe = authListener(async (firebaseUser) => {
        setLoading(true);
        if (firebaseUser) {
          // ✅ Get user profile from Firestore
          const profile = await getUserProfileFromFirestore(firebaseUser.uid);
          setUserProfile(profile);
          
          // ✅ Merge Firebase auth user with Firestore profile
          const mergedUser = mergeUserData(firebaseUser, profile);
          setUser(mergedUser);
          
          const userRole = await getUserRole(firebaseUser.uid);
          setRole(userRole || profile?.role || 'student');
        } else {
          setUser(null);
          setRole(null);
          setUserProfile(null);
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
      
      const profile = await getUserProfileFromFirestore(resUser.uid);
      setUserProfile(profile);
      
      const mergedUser = mergeUserData(resUser, profile);
      setUser(mergedUser);
      
      const userRole = await getUserRole(resUser.uid);
      setRole(userRole || profile?.role || 'student');
      return mergedUser;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, roleInput, userData = {}) => {
    try {
      setLoading(true);
      const resUser = await signupWithEmail(email, password, roleInput);
      
      const userDocRef = doc(db, 'users', resUser.uid);
      await setDoc(userDocRef, {
        name: userData.name || resUser.displayName || email.split('@')[0],
        email: email,
        photoURL: userData.photoURL || resUser.photoURL || null,
        photoUrl: userData.photoUrl || resUser.photoURL || null,
        role: roleInput || 'student',
        createdAt: new Date().toISOString(),
      });
      
      const profile = await getUserProfileFromFirestore(resUser.uid);
      setUserProfile(profile);
      
      const mergedUser = mergeUserData(resUser, profile);
      setUser(mergedUser);
      
      const userRole = await getUserRole(resUser.uid);
      setRole(userRole || roleInput || 'student');
      return mergedUser;
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
      
      const profile = await getUserProfileFromFirestore(resUser.uid);
      
      if (!profile) {
        const userDocRef = doc(db, 'users', resUser.uid);
        await setDoc(userDocRef, {
          name: resUser.displayName || resUser.email?.split('@')[0] || 'User',
          email: resUser.email,
          photoURL: resUser.photoURL || null,
          photoUrl: resUser.photoURL || null,
          role: 'student',
          createdAt: new Date().toISOString(),
        });
      }
      
      const updatedProfile = await getUserProfileFromFirestore(resUser.uid);
      setUserProfile(updatedProfile);
      
      const mergedUser = mergeUserData(resUser, updatedProfile);
      setUser(mergedUser);
      
      const userRole = await getUserRole(resUser.uid);
      setRole(userRole || updatedProfile?.role || 'student');
      return mergedUser;
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
      
      const profile = await getUserProfileFromFirestore(resUser.uid);
      
      if (!profile) {
        const userDocRef = doc(db, 'users', resUser.uid);
        await setDoc(userDocRef, {
          name: resUser.displayName || resUser.email?.split('@')[0] || 'User',
          email: resUser.email,
          photoURL: resUser.photoURL || null,
          photoUrl: resUser.photoURL || null,
          role: 'student',
          createdAt: new Date().toISOString(),
        });
      }
      
      const updatedProfile = await getUserProfileFromFirestore(resUser.uid);
      setUserProfile(updatedProfile);
      
      const mergedUser = mergeUserData(resUser, updatedProfile);
      setUser(mergedUser);
      
      const userRole = await getUserRole(resUser.uid);
      setRole(userRole || updatedProfile?.role || 'student');
      return mergedUser;
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
      setUserProfile(null);
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Value with all properties
  const value = { 
    user, 
    role, 
    loading, 
    isLoggedIn: !!user,
    isAdmin: role === 'admin',
    displayName: user?.displayName || user?.email?.split('@')[0] || 'User',
    photoURL: user?.photoURL || user?.photoUrl || null,
    userProfile,
    login, 
    signup, 
    loginWithGoogle, 
    loginWithGithub, 
    logout 
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};