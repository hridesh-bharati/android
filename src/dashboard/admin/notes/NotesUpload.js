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
    Platform,
    Linking
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

export default function NotesUpload() {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState("");
    const [uploading, setUploading] = useState(false);
    const [notesList, setNotesList] = useState([]);

    useEffect(() => {
        const q = query(collection(db, "notes"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setNotesList(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
        }, (error) => {
            console.error("Error fetching notes:", error);
        });
        return () => unsubscribe();
    }, []);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) setFile(selectedFile);
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
                day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
            });
        } catch {
            return "Just now";
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            {/* Upload Form Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Upload New PDF</Text>
                
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
                                className="custom-file-input"
                            />
                            <style type="text/css">{`
                                .custom-file-input::-webkit-file-upload-button {
                                    background: #0284c7;
                                    color: white;
                                    padding: 8px 14px;
                                    border: none;
                                    border-radius: 8px;
                                    font-weight: 700;
                                    cursor: pointer;
                                    margin-right: 10px;
                                }
                            `}</style>
                        </View>
                    ) : (
                        <Text style={styles.errorText}>Please use Web platform for direct file inputs.</Text>
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
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.primaryBtnText}>Upload PDF</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Uploaded Files List Card */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Uploaded Notes & PDFs</Text>

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
                                        {formatTimestamp(note.createdAt)}
                                    </Text>
                                </View>

                                <View style={styles.actionBtns}>
                                    <TouchableOpacity
                                        style={styles.viewBtn}
                                        onPress={() => Linking.openURL(note.pdfUrl)}
                                        activeOpacity={0.7}
                                    >
                                        <MaterialIcons name="visibility" size={18} color="#0284c7" />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.deleteBtn}
                                        onPress={() => handleDelete(note.id)}
                                        activeOpacity={0.7}
                                    >
                                        <MaterialIcons name="delete-outline" size={18} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
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
        backgroundColor: '#f0f6ff',
        padding: 14,
        paddingBottom: 40
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1.5,
        borderColor: '#ffffff',
        marginBottom: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '900',
        color: '#071e3d',
        marginBottom: 14,
        textTransform: 'uppercase',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '900',
        color: '#071e3d',
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    inputGroup: {
        marginBottom: 12
    },
    label: {
        fontSize: 10,
        fontWeight: '800',
        color: '#64748b',
        marginBottom: 6,
        textTransform: 'uppercase'
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        fontSize: 12,
        fontWeight: '700',
        color: '#0f172a'
    },
    webFileWrapper: {
        width: '100%',
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 12,
        padding: 8,
        justifyContent: 'center'
    },
    successText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#059669',
        marginTop: 6
    },
    errorText: {
        fontSize: 10,
        color: '#ef4444',
        fontWeight: '700'
    },
    primaryBtn: {
        backgroundColor: '#0284c7',
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
        shadowColor: '#0284c7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 3,
    },
    disabledBtn: {
        backgroundColor: '#64748b'
    },
    primaryBtnText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    listContainer: {
        gap: 8
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 4
    },
    itemInfo: {
        flex: 1,
        marginRight: 10
    },
    itemTitle: {
        fontSize: 12,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 2
    },
    itemDate: {
        fontSize: 9,
        fontWeight: '700',
        color: '#64748b'
    },
    actionBtns: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    viewBtn: {
        backgroundColor: '#e0f2fe',
        padding: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#bae6fd'
    },
    deleteBtn: {
        backgroundColor: '#fef2f2',
        padding: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#fee2e2'
    },
    emptyText: {
        textAlign: 'center',
        color: '#64748b',
        fontSize: 11,
        fontWeight: '700',
        marginVertical: 16
    }
});