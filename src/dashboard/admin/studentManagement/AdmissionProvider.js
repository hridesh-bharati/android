// src/dashboard/admin/studentManagement/AdmissionProvider.js react natic code 
import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { Alert } from "react-native";

const AdmissionContext = createContext(null);

export function useAdmissions() {
  const context = useContext(AdmissionContext);
  if (!context) throw new Error("useAdmissions must be used within an AdmissionProvider");
  return context;
}

export default function AdmissionProvider({ children }) {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const q = query(collection(db, "admissions"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q,
      (snap) => {
        if (!isMounted) return;
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setAdmissions(data);
        setLoading(false);
      },
      (err) => {
        if (!isMounted) return;
        console.error("Firestore Error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const updateAdmission = async (id, updatedData) => {
    try {
      await updateDoc(doc(db, "admissions", id), updatedData);
    } catch (err) {
      console.error("Update Error:", err);
      Alert.alert("Error", "Database update failed");
      throw err;
    }
  };

const deleteAdmission = async (id) => {
  if (!id) {
    console.error("Delete failed: No ID provided");
    return;
  }
  
  try {
    console.log("Deleting student with ID:", id);
    const docRef = doc(db, "admissions", id);
    await deleteDoc(docRef);
    console.log("Student deleted successfully");
  } catch (err) {
    console.error("Delete Error:", err);
    throw err;
  }
};

  const value = useMemo(() => ({
    admissions,
    loading,
    error,
    updateAdmission,
    deleteAdmission
  }), [admissions, loading, error]);

  return (
    <AdmissionContext.Provider value={value}>
      {typeof children === "function" ? children(value) : children}
    </AdmissionContext.Provider>
  );
}