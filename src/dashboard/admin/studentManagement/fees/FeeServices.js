// src/dashboard/admin/studentManagement/fees/FeeServices.js
import { db } from "../../../../services/firebase";
import { collection, addDoc, serverTimestamp, doc, deleteDoc } from "firebase/firestore";
import { Alert } from "react-native";

export const COURSE_CONFIG = {
  "ADCA+": { duration: 18, monthly: 800, adm: 600 },
  "ADCA": { duration: 15, monthly: 700, adm: 500 },
  "DCA": { duration: 12, monthly: 700, adm: 500 },
  "DCAA": { duration: 6, monthly: 700, adm: 500 },
  "CCC": { duration: 3, monthly: 1000, adm: 500 },
  "CAC": { duration: 3, monthly: 1000, adm: 600 }
};

export const getFeeLogic = (courseName, payments = []) => {
  const c = courseName?.toUpperCase() || "";
  const conf = COURSE_CONFIG[c] || { duration: 6, monthly: 700, adm: 500 };
  const netFee = (conf.duration * conf.monthly) + conf.adm;
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  return { ...conf, netFee, totalPaid, balance: netFee - totalPaid };
};

export const addPayment = async (studentEmail, data) => {
  if (!studentEmail) throw new Error("Student Email is required");
  const emailId = String(studentEmail).toLowerCase().trim();
  await addDoc(collection(db, "admissions", emailId, "payments"), {
    ...data, 
    amount: Number(data.amount), 
    createdAt: serverTimestamp()
  });
};

// Update this function in src/dashboard/admin/studentManagement/fees/FeeServices.js
export const deletePayment = async (studentIdentifier, pid) => {
  if (!studentIdentifier || !pid) {
    throw new Error("Student Identifier or Payment ID is missing");
  }
  try {
    const studentKey = String(studentIdentifier).toLowerCase().trim();
    
    // Direct path delete
    const paymentDocRef = doc(db, "admissions", studentKey, "payments", pid);
    await deleteDoc(paymentDocRef);
  } catch (error) {
    console.error("Delete payment error:", error);
    throw new Error("Failed to delete payment: " + error.message);
  }
};