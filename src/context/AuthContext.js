import React, {
  createContext,
  useState,
  useEffect,
  useContext,
} from 'react';

import {
  authListener,
  getUserRole,
  loginWithEmail,
  signupWithEmail,
  logoutUser,
  loginWithGoogleAuth,
  loginWithGithubAuth,
} from '../firebase/auth';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// All three authorized admin emails
export const ADMIN_EMAILS = [
  'hridesh027@gmail.com',
  'ajaytiwari4@gmail.com',
  'chauhansantosh045@gmail.com',
];

const isAdminEmail = (email) => {
  return ADMIN_EMAILS.includes((email || '').trim().toLowerCase());
};

const getPhotoUrl = (data) => {
  if (!data) return null;
  return (
    data.photoURL ||
    data.photoUrl ||
    data.photo ||
    data.avatar ||
    data.profilePhoto ||
    null
  );
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  const getUserProfileFromFirestore = async (uid) => {
    if (!uid) return null;
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.log('Profile fetch error:', error);
      throw error;
    }
  };

  const resolveUserRole = async (firebaseUser, profile) => {
    if (!firebaseUser) return null;
    let databaseRole = null;

    try {
      databaseRole = await getUserRole(firebaseUser.uid);
    } catch (error) {
      console.log('Role fetch error:', error);
    }

    const email = firebaseUser.email?.trim().toLowerCase();

    if (
      isAdminEmail(email) ||
      profile?.role === 'admin' ||
      databaseRole === 'admin'
    ) {
      return 'admin';
    }

    return profile?.role || databaseRole || 'student';
  };

  const mergeUserData = (firebaseUser, profile, userRole) => {
    if (!firebaseUser) return null;
    return {
      ...firebaseUser,
      role: userRole || 'student',
      displayName:
        profile?.name ||
        profile?.displayName ||
        firebaseUser.displayName ||
        firebaseUser.email?.split('@')[0] ||
        'User',
      photoURL: getPhotoUrl(profile) || firebaseUser.photoURL || null,
      photoUrl: getPhotoUrl(profile) || firebaseUser.photoURL || null,
    };
  };

  useEffect(() => {
    let active = true;

    const unsubscribe = authListener(async (firebaseUser) => {
      if (!active) return;
      setLoading(true);

      try {
        if (firebaseUser) {
          const profile = await getUserProfileFromFirestore(firebaseUser.uid);
          const userRole = await resolveUserRole(firebaseUser, profile);
          const mergedUser = mergeUserData(firebaseUser, profile, userRole);

          if (!active) return;
          setUserProfile(profile);
          setUser(mergedUser);
          setRole(userRole);
        } else {
          if (!active) return;
          setUser(null);
          setRole(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.log('Authentication listener error:', error);
        if (active) {
          setUser(null);
          setRole(null);
          setUserProfile(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    });

    return () => {
      active = false;
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const resUser = await loginWithEmail(cleanEmail, password);
      const profile = await getUserProfileFromFirestore(resUser.uid);
      const userRole = await resolveUserRole(resUser, profile);
      const mergedUser = mergeUserData(resUser, profile, userRole);

      setUserProfile(profile);
      setUser(mergedUser);
      setRole(userRole);
      return mergedUser;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, roleInput = 'student', userData = {}) => {
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const resUser = await signupWithEmail(cleanEmail, password, 'student');

      if (resUser?.uid) {
        const userDocRef = doc(db, 'users', resUser.uid);
        await setDoc(
          userDocRef,
          {
            name: userData.name || resUser.displayName || cleanEmail.split('@')[0],
            email: cleanEmail,
            photoURL: userData.photoURL || resUser.photoURL || null,
            photoUrl: userData.photoUrl || resUser.photoURL || null,
            role: 'student',
            createdAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }

      const profile = await getUserProfileFromFirestore(resUser.uid);
      const userRole = await resolveUserRole(resUser, profile);
      const mergedUser = mergeUserData(resUser, profile, userRole);

      setUserProfile(profile);
      setUser(mergedUser);
      setRole(userRole);
      return mergedUser;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const resUser = await loginWithGoogleAuth();
      let profile = await getUserProfileFromFirestore(resUser.uid);

      if (!profile) {
        await setDoc(doc(db, 'users', resUser.uid), {
          name: resUser.displayName || resUser.email?.split('@')[0] || 'User',
          email: resUser.email?.toLowerCase(),
          photoURL: resUser.photoURL || null,
          photoUrl: resUser.photoURL || null,
          role: 'student',
          createdAt: new Date().toISOString(),
        });
        profile = await getUserProfileFromFirestore(resUser.uid);
      }

      const userRole = await resolveUserRole(resUser, profile);
      const mergedUser = mergeUserData(resUser, profile, userRole);

      setUserProfile(profile);
      setUser(mergedUser);
      setRole(userRole);
      return mergedUser;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGithub = async () => {
    setLoading(true);
    try {
      const resUser = await loginWithGithubAuth();
      let profile = await getUserProfileFromFirestore(resUser.uid);

      if (!profile) {
        await setDoc(doc(db, 'users', resUser.uid), {
          name: resUser.displayName || resUser.email?.split('@')[0] || 'User',
          email: resUser.email?.toLowerCase(),
          photoURL: resUser.photoURL || null,
          photoUrl: resUser.photoURL || null,
          role: 'student',
          createdAt: new Date().toISOString(),
        });
        profile = await getUserProfileFromFirestore(resUser.uid);
      }

      const userRole = await resolveUserRole(resUser, profile);
      const mergedUser = mergeUserData(resUser, profile, userRole);

      setUserProfile(profile);
      setUser(mergedUser);
      setRole(userRole);
      return mergedUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setRole(null);
      setUserProfile(null);
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    role,
    loading,
    isLoggedIn: !!user,
    isAdmin: role === 'admin' || ADMIN_EMAILS.includes(user?.email?.toLowerCase()),
    displayName: user?.displayName || user?.email?.split('@')[0] || 'User',
    photoURL: user?.photoURL || user?.photoUrl || null,
    userProfile,
    login,
    signup,
    loginWithGoogle,
    loginWithGithub,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};