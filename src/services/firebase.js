// src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDm15ex3UZlOTzhHALn6ukvmRO9jobM4Y8",
  authDomain: "diit-5bff0.firebaseapp.com",
  projectId: "diit-5bff0",
  storageBucket: "diit-5bff0.appspot.com",
  messagingSenderId: "55289745043",
  appId: "1:55289745043:web:7ddcb37bb1a4b4f02a4766",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);