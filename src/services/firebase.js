// import { initializeApp } from "firebase/app";
// import { initializeAuth, getReactNativePersistence } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";
// import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// const firebaseConfig = {
//   apiKey: "AIzaSyDm15ex3UZlOTzhHALn6ukvmRO9jobM4Y8",
//   authDomain: "diit-5bff0.firebaseapp.com",
//   projectId: "diit-5bff0",
//   storageBucket: "diit-5bff0.appspot.com",
//   messagingSenderId: "55289745043",
//   appId: "1:55289745043:web:7ddcb37bb1a4b4f02a4766",
// };

// export const app = initializeApp(firebaseConfig);

// // Initialize Auth with AsyncStorage persistence
// export const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(ReactNativeAsyncStorage),
// });

// export const db = getFirestore(app);
// export const storage = getStorage(app);
// src/services/firebase.js
// ✅ Firebase for React Native — with AsyncStorage persistence

import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDm15ex3UZlOTzhHALn6ukvmRO9jobM4Y8",
  authDomain: "diit-5bff0.firebaseapp.com",
  projectId: "diit-5bff0",
  storageBucket: "diit-5bff0.appspot.com",
  messagingSenderId: "55289745043",
  appId: "1:55289745043:web:7ddcb37bb1a4b4f02a4766",
};

// ✅ Avoid re-initializing on hot reload
export const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ✅ Auth with AsyncStorage persistence (session survives app restart)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getFirestore(app);
export const storage = getStorage(app);