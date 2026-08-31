// src/dashboard/admin/notes/NotesUpload.js
import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Platform
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { db } from "../../../services/firebase";
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp
} from "firebase/firestore";

const C = {
    primary: '#0284c7',
    dark: '#0f172a',
    danger: '#ef4444',
    white: '#ffffff',
    border: '#e2e8f0',
    gray: '#64748b',
    bg: '#f8fafc',
    success: '#10b981'
};

const shadowStyle = Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
    android: { elevation: 3 }
});

export default function NotesUpload() {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState("");
    const [uploading, setUploading] = useState(false);
    const [notesList, setNotesList] = useState([]);

    useEffect(() => {
        const q = query(collection(db, "notes"), orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notesData = snapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...docSnap.data(),
            }));
            setNotesList(notesData);
        }, (error) => {
            console.error("Error fetching notes:", error);
        });

        return () => unsubscribe();
    }, []);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleUpload = async () => {
        if (!file || !title.trim()) {
            Alert.alert("Error", "Please enter title and select a PDF file");
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "hridesh99!");

            const response = await fetch("https://api.cloudinary.com/v1_1/draowpiml/image/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (data.secure_url) {
                await addDoc(collection(db, "notes"), {
                    title: title.trim(),
                    pdfUrl: data.secure_url,
                    createdAt: serverTimestamp(),
                });

                Alert.alert("Success", "PDF Uploaded Successfully!");
                setTitle("");
                setFile(null);
                const inputElement = document.getElementById("pdf-file-input");
                if (inputElement) inputElement.value = "";
            } else {
                Alert.alert("Error", "Upload failed. Check Cloudinary settings.");
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            Alert.alert("Error", "Something went wrong during upload.");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = (noteId) => {
        Alert.alert(
            "Confirm Delete",
            "Kya aap sach me is file ko delete karna chahte hain?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, "notes", noteId));
                        } catch (error) {
                            console.error("Error deleting document:", error);
                            Alert.alert("Error", "Delete failed!");
                        }
                    }
                }
            ]
        );
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return "Just now";
        try {
            const date = timestamp.toDate();
            return date.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "Just now";
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            {/* Upload Form Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>📤 Upload New PDF</Text>
                
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Title *</Text>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Enter note title"
                        placeholderTextColor="#94a3b8"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>PDF File *</Text>
                    {Platform.OS === 'web' ? (
                        <View style={styles.webFileWrapper}>
                            <input
                                id="pdf-file-input"
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}
                            />
                        </View>
                    ) : (
                        <Text style={styles.errorText}>Please use Web platform for direct file inputs or install expo-document-picker.</Text>
                    )}
                    {file && (
                        <Text style={styles.successText}>
                            ✓ {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </Text>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.primaryBtn, uploading && styles.disabledBtn]}
                    onPress={handleUpload}
                    disabled={uploading}
                    activeOpacity={0.8}
                >
                    {uploading ? (
                        <ActivityIndicator color={C.white} />
                    ) : (
                        <Text style={styles.primaryBtnText}>Upload PDF</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Uploaded Files List Card */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>📄 Uploaded Notes & PDFs</Text>

                {notesList.length === 0 ? (
                    <Text style={styles.emptyText}>Koi bhi file uploaded nahi hai.</Text>
                ) : (
                    <View style={styles.listContainer}>
                        {notesList.map((note) => (
                            <View key={note.id} style={styles.listItem}>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemTitle} numberOfLines={1}>
                                        {note.title}
                                    </Text>
                                    <Text style={styles.itemDate}>
                                        📅 {formatTimestamp(note.createdAt)}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.deleteBtn}
                                    onPress={() => handleDelete(note.id)}
                                    activeOpacity={0.7}
                                >
                                    <MaterialIcons name="delete-outline" size={18} color={C.danger} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: C.bg,
        padding: 16,
        paddingBottom: 40
    },
    card: {
        backgroundColor: C.white,
        borderRadius: 16,
        padding: 18,
        borderWidth: 1,
        borderColor: C.border,
        marginBottom: 16,
        ...shadowStyle
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '900',
        color: C.dark,
        textAlign: 'center',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '900',
        color: C.dark,
        marginBottom: 14,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    inputGroup: {
        marginBottom: 14
    },
    label: {
        fontSize: 11,
        fontWeight: '800',
        color: '#475569',
        marginBottom: 6
    },
    input: {
        backgroundColor: C.bg,
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 10,
        paddingHorizontal: 14,
        height: 48,
        fontSize: 13,
        fontWeight: '700',
        color: C.dark
    },
    webFileWrapper: {
        width: '100%'
    },
    successText: {
        fontSize: 11,
        fontWeight: '700',
        color: C.success,
        marginTop: 6
    },
    errorText: {
        fontSize: 11,
        color: C.danger,
        fontWeight: '700'
    },
    primaryBtn: {
        backgroundColor: C.primary,
        height: 48,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 6,
        ...shadowStyle
    },
    disabledBtn: {
        backgroundColor: C.gray
    },
    primaryBtnText: {
        color: C.white,
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 0.5
    },
    listContainer: {
        gap: 10
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9'
    },
    itemInfo: {
        flex: 1,
        marginRight: 10
    },
    itemTitle: {
        fontSize: 13,
        fontWeight: '900',
        color: C.dark,
        marginBottom: 2
    },
    itemDate: {
        fontSize: 10,
        fontWeight: '700',
        color: C.gray
    },
    deleteBtn: {
        backgroundColor: '#fef2f2',
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#fee2e2'
    },
    emptyText: {
        textAlign: 'center',
        color: C.gray,
        fontSize: 12,
        fontWeight: '700',
        marginVertical: 20
    }
});