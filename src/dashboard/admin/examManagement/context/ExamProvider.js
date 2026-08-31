// src/dashboard/admin/examManagement/context/ExamProvider.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { Alert } from "react-native";
import { db } from "../../../../services/firebase";
import {
    collection, doc, addDoc, updateDoc, getDocs, query, where,
    orderBy, onSnapshot, writeBatch, serverTimestamp, deleteDoc
} from "firebase/firestore";

const ExamContext = createContext();
export const useExam = () => useContext(ExamContext);

const COMPUTER_COURSES = [
  "ADCA+",
  "ADCA",
  "DCA",
  "DCAA",
  "DTP",
  "CDTP",
  "CCA",
  "CAC",
  "CCC",
  "O LEVEL",
  "DBI",
  "C",
  "C++",
  "Python",
  "JavaScript",
  "TypeScript",
  "Tally Prime with GST"
];

export const ExamProvider = ({ children }) => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Realtime Listener for Exams
    useEffect(() => {
        const q = query(collection(db, "exams"), orderBy("createdAt", "desc"));
        const unsub = onSnapshot(q, (snap) => {
            setExams(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        }, (error) => {
            console.error("Exam fetch error:", error);
            setLoading(false);
        });
        return unsub;
    }, []);

    // 2. Create Exam Info
    const createExam = async (data) => {
        try {
            const ref = await addDoc(collection(db, "exams"), {
                ...data,
                status: "Draft",
                isLive: false,
                resultsPublished: false,
                createdAt: serverTimestamp()
            });
            return ref.id;
        } catch (err) {
            Alert.alert("Error", err.message);
            return null;
        }
    };

    // 3. Add/Update Questions (Batch Logic)
    const addQuestions = async (examId, questions) => {
        try {
            const batch = writeBatch(db);
            const oldQs = await getDocs(query(collection(db, "examQuestions"), where("examId", "==", examId)));
            oldQs.forEach(d => batch.delete(d.ref));

            questions.forEach(q => {
                const qRef = doc(collection(db, "examQuestions"));
                batch.set(qRef, { ...q, examId });
            });

            batch.update(doc(db, "exams", examId), { status: "Ready", totalQuestions: questions.length });
            await batch.commit();
            return true;
        } catch (err) {
            Alert.alert("Error", "Failed to save questions");
            return false;
        }
    };

    // 4. Delete Exam Logic (Paper + Questions Cleanup)
    const deleteExam = async (examId) => {
        return new Promise((resolve) => {
            Alert.alert(
                "Permanent Delete",
                "Are you sure? This will delete the exam and all related questions!",
                [
                    { text: "Cancel", onPress: () => resolve(false), style: "cancel" },
                    {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                            try {
                                const batch = writeBatch(db);
                                const qSnap = await getDocs(query(collection(db, "examQuestions"), where("examId", "==", examId)));
                                qSnap.docs.forEach(d => batch.delete(d.ref));
                                batch.delete(doc(db, "exams", examId));
                                await batch.commit();
                                resolve(true);
                            } catch (err) {
                                Alert.alert("Error", err.message);
                                resolve(false);
                            }
                        }
                    }
                ]
            );
        });
    };

    // 5. Toggle Live Status
    const toggleExamLive = async (id, state) => {
        try {
            await updateDoc(doc(db, "exams", id), { isLive: !state });
        } catch (err) {
            Alert.alert("Error", "Failed to update live status");
        }
    };

    return (
        <ExamContext.Provider value={{
            exams, courses: COMPUTER_COURSES, loading,
            createExam, addQuestions, toggleExamLive, deleteExam
        }}>
            {children}
        </ExamContext.Provider>
    );
};