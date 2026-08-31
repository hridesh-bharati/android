// src\firebase\auth.js
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithCredential
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

/* Allowed Admin Emails */
const ADMIN_ALLOWED_EMAILS = [
  "hridesh027@gmail.com",
  "ajaytiwari4@gmail.com",
  "chauhansantosh045@gmail.com"
];

/* AUTH LISTENER */
export const authListener = (cb) => onAuthStateChanged(auth, cb);

/* SIGNUP */
export const signupWithEmail = async (email, password, role = "user") => {
  email = email.toLowerCase().trim();

  if (role === "admin" && !ADMIN_ALLOWED_EMAILS.includes(email)) {
    throw new Error("Unauthorized: You are not allowed to create admin account");
  }

  const res = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", res.user.uid), {
    email,
    role,
    name: email.split('@')[0],
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  return res.user;
};

/* LOGIN */
export const loginWithEmail = async (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

/* GOOGLE LOGIN / SIGNUP */
export const loginWithGoogleAuth = async (idToken) => {
  let user;
  if (idToken) {
    const credential = GoogleAuthProvider.credential(idToken);
    const res = await signInWithCredential(auth, credential);
    user = res.user;
  } else {
    const provider = new GoogleAuthProvider();
    const res = await signInWithPopup(auth, provider);
    user = res.user;
  }

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const email = user.email ? user.email.toLowerCase().trim() : "";
    const role = ADMIN_ALLOWED_EMAILS.includes(email) ? "admin" : "user";
    
    await setDoc(userRef, {
      email,
      role,
      name: user.displayName || email.split('@')[0],
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }

  return user;
};

/* GITHUB LOGIN / SIGNUP */
export const loginWithGithubAuth = async () => {
  const provider = new GithubAuthProvider();
  const res = await signInWithPopup(auth, provider);
  const user = res.user;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const email = user.email ? user.email.toLowerCase().trim() : "";
    const role = ADMIN_ALLOWED_EMAILS.includes(email) ? "admin" : "user";
    
    await setDoc(userRef, {
      email,
      role,
      name: user.displayName || email.split('@')[0],
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }

  return user;
};

/* GET ROLE */
export const getUserRole = async (uid) => {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? snap.data().role : null;
  } catch {
    return null;
  }
};

/* UPDATE USER PROFILE */
export const updateUserProfileInDb = async (uid, data) => {
  try {
    const ref = doc(db, "users", uid);
    await updateDoc(ref, {
      ...data,
      updatedAt: Date.now()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/* RESET PASSWORD */
export const resetPassword = async (email) => {
  email = email.toLowerCase().trim();
  return sendPasswordResetEmail(auth, email);
};

/* LOGOUT */
export const logoutUser = () => signOut(auth);

/* CHECK IF USER IS ADMIN */
export const isUserAdmin = async (uid) => {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return false;
    
    const userData = snap.data();
    return userData.role === "admin" || ADMIN_ALLOWED_EMAILS.includes(userData.email);
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

/* GET CURRENT USER PROFILE */
export const getCurrentUserProfile = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      return {
        uid: user.uid,
        email: user.email,
        ...snap.data()
      };
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }
  return null;
};