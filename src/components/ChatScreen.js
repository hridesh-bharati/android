// src/components/ChatScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  FlatList,
  Alert,
  Clipboard,
  TouchableHighlight,
  Vibration,
  AppState,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { db, auth } from "../services/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  deleteField,
  getDocs,
  where,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const { width, height } = Dimensions.get("window");

const C = {
  primary: "#0284c7",
  primaryLight: "#e0f2fe",
  dark: "#071e3d",
  success: "#10b981",
  white: "#ffffff",
  border: "#e2e8f0",
  gray: "#64748b",
  bg: "#f0f6ff",
  lightBg: "#f8fafc",
  danger: "#ef4444",
  warning: "#f59e0b",
};

const getSafeAvatar = (photo, name) => {
  if (photo && typeof photo === "string" && photo.trim() !== "") {
    return photo;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || "User"
  )}&background=0284c7&color=fff&size=128`;
};

// --- CONTEXT MENU COMPONENT ---
const ContextMenu = ({
  visible,
  message,
  onClose,
  onCopy,
  onDelete,
  onEdit,
  isAdmin,
  isMe,
  position,
}) => {
  if (!visible || !message) return null;

  const canDelete = isAdmin || isMe;
  const canEdit = isMe;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableOpacity
        style={styles.contextMenuOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[
            styles.contextMenuContainer,
            {
              top: position?.y || height / 2 - 120,
              left: Math.min(position?.x || 20, width - 200),
            },
          ]}
        >
          <TouchableOpacity
            style={styles.contextMenuItem}
            onPress={() => onCopy(message.message)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="content-copy" size={20} color={C.dark} />
            <Text style={styles.contextMenuItemText}>Copy</Text>
          </TouchableOpacity>

          {canEdit && (
            <TouchableOpacity
              style={styles.contextMenuItem}
              onPress={() => {
                onClose();
                onEdit(message);
              }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="edit" size={20} color={C.dark} />
              <Text style={styles.contextMenuItemText}>Edit</Text>
            </TouchableOpacity>
          )}

          {canDelete && (
            <TouchableOpacity
              style={[styles.contextMenuItem, styles.contextMenuItemDanger]}
              onPress={() => {
                onClose();
                onDelete(message);
              }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="delete" size={20} color={C.danger} />
              <Text style={[styles.contextMenuItemText, { color: C.danger }]}>
                Delete{isAdmin && !isMe ? " (Admin)" : ""}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.contextMenuDivider} />

          <View style={styles.contextMenuInfoItem}>
            <MaterialIcons name="access-time" size={16} color={C.gray} />
            <Text style={styles.contextMenuInfoText}>
              {message.timestamp
                ?.toDate?.()
                ?.toLocaleString([], {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }) || "Just now"}
            </Text>
          </View>

          <View style={styles.contextMenuInfoItem}>
            <MaterialIcons name="person" size={16} color={C.gray} />
            <Text style={styles.contextMenuInfoText}>
              {message.senderName}
              {message.edited && " (edited)"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// --- MESSAGE ITEM ---
const MessageItem = ({ item, isMe, isAdmin, onLongPress }) => {
  const senderAvatar = getSafeAvatar(item.senderPhoto, item.senderName);
  const canLongPress = isAdmin || isMe;

  return (
    <TouchableHighlight
      underlayColor="rgba(0,0,0,0.05)"
      onLongPress={(event) => {
        if (canLongPress) {
          onLongPress(item, event);
        }
      }}
      delayLongPress={500}
      style={[
        styles.messageTouchable,
        isMe ? styles.messageTouchableEnd : styles.messageTouchableStart,
      ]}
    >
      <View style={[styles.msgRow, isMe ? styles.rowEnd : styles.rowStart]}>
        {!isMe && (
          <Image source={{ uri: senderAvatar }} style={styles.msgSenderAvatar} />
        )}
        
        <View
          style={[styles.msgBubble, isMe ? styles.bubbleMe : styles.bubbleOther]}
        >
          <View style={styles.bubbleHeader}>
            <Text style={[styles.senderName, isMe && { color: "#bae6fd" }]}>
              {item.senderName}
              {isAdmin && !isMe}
            </Text>
          </View>

          <Text style={[styles.msgText, isMe ? styles.textMe : styles.textOther]}>
            {item.message}
          </Text>

          {item.edited && (
            <Text style={[styles.editedText, isMe && { color: "#bae6fd" }]}>
              {" "}
              (edited)
            </Text>
          )}

          <Text
            style={[styles.timestampText, isMe ? styles.timeMe : styles.timeOther]}
          >
            {item.timestamp
              ?.toDate?.()
              ?.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }) || "Just now"}
          </Text>
        </View>
        
        {isMe && (
          <Image source={{ uri: senderAvatar }} style={styles.msgSenderAvatarMe} />
        )}
      </View>
    </TouchableHighlight>
  );
};

// --- MEMBER CARD ---
const MemberCard = ({ member, onClick }) => {
  const memberAvatar = getSafeAvatar(member.photoURL || member.photoUrl, member.name);

  return (
    <TouchableOpacity
      style={styles.memberCard}
      onPress={() => onClick(member)}
      activeOpacity={0.8}
    >
      <View style={styles.memberAvatarRing}>
        <Image source={{ uri: memberAvatar }} style={styles.memberAvatarImg} />
      </View>
      <Text style={styles.memberNameText} numberOfLines={1}>
        {member.name}
      </Text>
      {member.role === "admin" && (
        <View style={styles.adminBadge}>
          <Text style={styles.adminBadgeText}>Admin</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// --- MAIN PAGE ---
export default function ChatScreen({ navigation }) {
  const { user, displayName, photoURL, isAdmin } = useAuth();
  const currentUser = user || auth.currentUser;
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [members, setMembers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    position: { x: 20, y: 200 },
    message: null,
  });

  const [currentPhoto, setCurrentPhoto] = useState(photoURL || currentUser?.photoURL || null);

  useEffect(() => {
    const fetchUserPhoto = async () => {
      if (!currentUser?.email) return;
      try {
        const emailKey = currentUser.email.trim().toLowerCase();
        const studentSnap = await getDocs(query(collection(db, "admissions"), where("email", "==", emailKey)));
        if (!studentSnap.empty) {
          const sData = studentSnap.docs[0].data();
          if (sData.photoUrl || sData.photoURL) {
            setCurrentPhoto(sData.photoUrl || sData.photoURL);
            return;
          }
        }
        const qUsers = query(collection(db, "users"), where("email", "==", emailKey));
        const snapUsers = await getDocs(qUsers);
        if (!snapUsers.empty) {
          const uData = snapUsers.docs[0].data();
          if (uData.photoURL || uData.photoUrl) {
            setCurrentPhoto(uData.photoURL || uData.photoUrl);
            return;
          }
        }
      } catch (err) {
        console.log("Error fetching live photo:", err);
      }
    };
    fetchUserPhoto();
  }, [currentUser]);

  // Helper to update typing status in Firestore
  const updateTypingStatus = async (isTyping) => {
    if (!currentUser?.uid) return;
    try {
      const typingRef = doc(db, "typingStatus", currentUser.uid);
      const activeName = displayName || currentUser?.displayName || "Someone";
      if (isTyping) {
        await setDoc(typingRef, { name: activeName, updatedAt: serverTimestamp() });
      } else {
        await deleteDoc(typingRef);
      }
    } catch (e) {
      console.error("Typing status error:", e);
    }
  };

  // Handle Text Input Change with Auto-Timeout for typing indicator
  const handleTextChange = (text) => {
    setNewMessage(text);
    
    if (text.length > 0) {
      updateTypingStatus(true);
      
      // Clear previous timeout if user is actively typing
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      // Auto stop typing status after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        updateTypingStatus(false);
      }, 3000);
    } else {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      updateTypingStatus(false);
    }
  };

  // Cleanup typing status when leaving screen or app goes to background
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState !== "active") {
        updateTypingStatus(false);
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      updateTypingStatus(false);
      subscription?.remove();
    };
  }, [currentUser]);

  const formatMember = (d, roleType) => {
    const data = d.data();
    return {
      id: d.id,
      uid: d.id,
      name:
        data.name?.trim() ||
        data.displayName?.trim() ||
        data.fullName?.trim() ||
        "Unknown",
      email: data.email || "N/A",
      phone: data.phone || data.mobile || "N/A",
      photoURL: data.photoURL || data.photoUrl || null,
      role: data.role || roleType,
      branch: data.branch || "N/A",
    };
  };

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      const usersData = snap.docs.map((d) => formatMember(d, "user"));
      setMembers((prev) => {
        const others = prev.filter((m) => m.role === "student");
        return [...others, ...usersData].sort((a, b) => a.name.localeCompare(b.name));
      });
      setIsLoading(false);
    });

    const unsubStudents = onSnapshot(collection(db, "admissions"), (snap) => {
      const studentsData = snap.docs.map((d) => formatMember(d, "student"));
      setMembers((prev) => {
        const others = prev.filter((m) => m.role !== "student");
        return [...others, ...studentsData].sort((a, b) => a.name.localeCompare(b.name));
      });
      setIsLoading(false);
    });

    const qMessages = query(collection(db, "chats"), orderBy("timestamp", "asc"));
    const unsubMsgs = onSnapshot(qMessages, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    const unsubTyping = onSnapshot(collection(db, "typingStatus"), (snap) => {
      const typingList = [];
      snap.docs.forEach((d) => {
        if (d.id !== currentUser?.uid) {
          typingList.push(d.data().name);
        }
      });
      setTypingUsers(typingList);
    });

    return () => {
      unsubUsers();
      unsubStudents();
      unsubMsgs();
      unsubTyping();
    };
  }, [currentUser]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser?.uid) return;

    try {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      await updateTypingStatus(false);

      const activePhoto = currentPhoto || photoURL || currentUser?.photoURL || null;
      const activeName = displayName || currentUser?.displayName || "Unknown";

      if (editingId) {
        await updateDoc(doc(db, "chats", editingId), {
          message: newMessage.trim(),
          edited: true,
        });
        setEditingId(null);
      } else {
        await addDoc(collection(db, "chats"), {
          senderId: currentUser.uid,
          senderName: activeName,
          senderPhoto: activePhoto,
          message: newMessage.trim(),
          timestamp: serverTimestamp(),
          edited: false,
        });
      }
      setNewMessage("");
    } catch (err) {
      console.error("Message send error:", err);
      Alert.alert("Error", "Failed to send message");
    }
  };

  const handleDeleteMessage = async (msg) => {
    const canDelete = isAdmin || msg.senderId === currentUser?.uid;
    if (!canDelete) return;
    try {
      await deleteDoc(doc(db, "chats", msg.id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleEditInit = (msg) => {
    if (msg.senderId === currentUser?.uid) {
      setEditingId(msg.id);
      setNewMessage(msg.message);
    }
  };

  const handleCopyMessage = (text) => {
    Clipboard.setString(text);
    Alert.alert("Copied!", "Message copied");
    setContextMenu({ visible: false, position: { x: 20, y: 200 }, message: null });
  };

  const handleLongPress = (msg, event) => {
    const isMyMessage = msg.senderId === currentUser?.uid;
    if (!isAdmin && !isMyMessage) return;

    const touchX = event?.nativeEvent?.pageX || 20;
    const touchY = event?.nativeEvent?.pageY || 200;

    if (Platform.OS === "android") Vibration.vibrate(10);

    setContextMenu({
      visible: true,
      position: {
        x: Math.min(touchX, width - 180),
        y: Math.min(touchY, height - 250),
      },
      message: msg,
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ visible: false, position: { x: 20, y: 200 }, message: null });
  };

  const membersToShow = isAdmin ? members : members.filter(m => m.role === "admin");
  const activeHeaderAvatar = getSafeAvatar(currentPhoto || photoURL || currentUser?.photoURL, displayName || currentUser?.displayName);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {/* Background Blobs */}
        <View style={styles.backgroundContainer}>
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
          <View style={[styles.circle, styles.circle3]} />
          <View style={[styles.circle, styles.circle4]} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => {
              updateTypingStatus(false);
              navigation?.goBack();
            }} 
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={20} color={C.dark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            Drishtee Chat {isAdmin && <Text style={styles.adminHeaderTag}>(Admin)</Text>}
          </Text>
          <Image source={{ uri: activeHeaderAvatar }} style={styles.headerAvatar} />
        </View>

        {/* Member List */}
        <View style={styles.memberScrollWrapper}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading members...</Text>
            </View>
          ) : (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={membersToShow}
              renderItem={({ item }) => <MemberCard member={item} onClick={setSelectedMember} />}
              keyExtractor={(item) => item.uid}
              contentContainerStyle={styles.memberScroll}
              style={styles.memberFlatList}
            />
          )}
        </View>

        {/* Messages */}
        <View style={styles.messagesWrapper}>
          {messages.length === 0 ? (
            <View style={styles.emptyMessagesContainer}>
              <MaterialIcons name="chat" size={50} color={C.gray} />
              <Text style={styles.emptyMessagesText}>No messages yet</Text>
              <Text style={styles.emptyMessagesSubText}>Start a conversation!</Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={({ item }) => (
                <MessageItem
                  item={item}
                  isMe={item.senderId === currentUser?.uid}
                  isAdmin={isAdmin}
                  onLongPress={handleLongPress}
                />
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.msgContentContainer}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              style={styles.msgContainer}
            />
          )}
        </View>

        {/* Realtime Typing Indicator */}
        {typingUsers.length > 0 && (
          <View style={styles.typingIndicatorBox}>
            <Text style={styles.typingText}>
              {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
            </Text>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder={editingId ? "Edit message..." : "Type a message..."}
            placeholderTextColor="#94a3b8"
            value={newMessage}
            onChangeText={handleTextChange}
            onBlur={() => updateTypingStatus(false)}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, editingId && { backgroundColor: C.warning }]}
            onPress={handleSendMessage}
            activeOpacity={0.85}
          >
            <MaterialIcons name={editingId ? "check" : "send"} size={18} color={C.white} />
          </TouchableOpacity>
        </View>

        {/* Context Menu */}
        <ContextMenu
          visible={contextMenu.visible}
          message={contextMenu.message}
          position={contextMenu.position}
          onClose={closeContextMenu}
          onCopy={handleCopyMessage}
          onDelete={handleDeleteMessage}
          onEdit={handleEditInit}
          isAdmin={isAdmin}
          isMe={contextMenu.message?.senderId === currentUser?.uid}
        />

        {/* Profile Modal */}
        {selectedMember && (
          <Modal visible={true} transparent={true} animationType="fade" onRequestClose={() => setSelectedMember(null)} statusBarTranslucent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setSelectedMember(null)} activeOpacity={0.7}>
                  <MaterialIcons name="close" size={18} color={C.gray} />
                </TouchableOpacity>

                <Image
                  source={{ uri: getSafeAvatar(selectedMember.photoURL || selectedMember.photoUrl, selectedMember.name) }}
                  style={styles.modalAvatar}
                />
                <Text style={styles.modalName}>{selectedMember.name}</Text>

                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>{selectedMember.role.toUpperCase()}</Text>
                </View>

                {isAdmin && selectedMember.role === "student" && (
                  <View style={styles.adminDetailsBox}>
                    <Text style={styles.detailText}><Text style={{ fontWeight: "900" }}>Branch:</Text> {selectedMember.branch}</Text>
                    <Text style={styles.detailText}><Text style={{ fontWeight: "900" }}>Email:</Text> {selectedMember.email}</Text>

                    <TouchableOpacity
                      style={styles.viewProfileBtn}
                      onPress={() => {
                        const targetId = selectedMember.id;
                        setSelectedMember(null);
                        navigation?.navigate("StudentProfile", { studentId: targetId });
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.viewProfileBtnText}>View Student Profile</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </Modal>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, width: "100%", height: "100%", backgroundColor: C.bg },
  container: { flex: 1, width: "100%", height: "100%", backgroundColor: C.bg, position: "relative" },
  
  backgroundContainer: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", zIndex: -1 },
  circle: { position: "absolute", borderRadius: 999 },
  circle1: { width: 260, height: 260, top: -50, right: -50, backgroundColor: "#38bdf8", opacity: 0.16 },
  circle2: { width: 280, height: 280, bottom: -60, left: -60, backgroundColor: "#34d399", opacity: 0.14 },
  circle3: { width: 180, height: 180, top: "35%", right: -40, backgroundColor: "#8b5cf6", opacity: 0.10 },
  circle4: { width: 160, height: 160, bottom: "25%", left: -40, backgroundColor: "#f59e0b", opacity: 0.09 },

  header: { height: 60, width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(255,255,255,0.92)", paddingHorizontal: 16, borderBottomWidth: 1.5, borderColor: C.border, elevation: 3, flexShrink: 0, zIndex: 1 },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#f1f5f9", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 16, fontWeight: "900", color: C.dark },
  adminHeaderTag: { fontSize: 12, fontWeight: "700", color: C.primary },
  headerAvatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: "#cbd5e1", backgroundColor: "#e2e8f0" },

  memberScrollWrapper: { width: "100%", backgroundColor: "rgba(255,255,255,0.85)", borderBottomWidth: 1, borderBottomColor: C.border, height: 90, flexShrink: 0, zIndex: 1 },
  memberFlatList: { flex: 1, width: "100%" },
  memberScroll: { paddingHorizontal: 12, paddingVertical: 8, gap: 12 },
  memberCard: { alignItems: "center", width: 70, marginRight: 8 },
  memberAvatarRing: { width: 54, height: 54, borderRadius: 27, padding: 2, borderWidth: 2, borderColor: C.primary, backgroundColor: C.white },
  memberAvatarImg: { width: "100%", height: "100%", borderRadius: 24, backgroundColor: "#e2e8f0" },
  memberNameText: { fontSize: 10, fontWeight: "800", color: C.dark, marginTop: 4, textAlign: "center", maxWidth: 70 },
  adminBadge: { backgroundColor: C.primary, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4, marginTop: 2 },
  adminBadgeText: { fontSize: 8, color: C.white, fontWeight: "700" },

  messagesWrapper: { flex: 1, width: "100%", backgroundColor: "transparent", zIndex: 1 },
  msgContainer: { flex: 1, width: "100%", paddingHorizontal: 14 },
  msgContentContainer: { paddingVertical: 14, gap: 10, paddingBottom: 20 },
  messageTouchable: { borderRadius: 16 },
  messageTouchableStart: { alignSelf: "flex-start" },
  messageTouchableEnd: { alignSelf: "flex-end" },
  msgRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 4, gap: 6 },
  rowEnd: { justifyContent: "flex-end" },
  rowStart: { justifyContent: "flex-start" },
  msgSenderAvatar: { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: "#cbd5e1", backgroundColor: "#e2e8f0", marginBottom: 2 },
  msgSenderAvatarMe: { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: C.primary, backgroundColor: "#e2e8f0", marginBottom: 2, marginLeft: 4 },
  msgBubble: { maxWidth: "72%", padding: 12, borderRadius: 16, elevation: 1 },
  bubbleMe: { backgroundColor: C.primary, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: "rgba(255, 255, 255, 0.95)", borderWidth: 1, borderColor: C.border, borderBottomLeftRadius: 4 },
  bubbleHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4, gap: 10 },
  senderName: { fontSize: 11, fontWeight: "900", color: C.dark },
  msgText: { fontSize: 13, fontWeight: "600", lineHeight: 18 },
  textMe: { color: C.white },
  textOther: { color: C.dark },
  editedText: { fontSize: 9, fontStyle: "italic", color: "#64748b" },
  timestampText: { fontSize: 9, fontWeight: "700", marginTop: 4, textAlign: "right" },
  timeMe: { color: "#e0f2fe" },
  timeOther: { color: C.gray },

  typingIndicatorBox: { paddingHorizontal: 16, paddingVertical: 5, backgroundColor: 'rgba(255,255,255,0.85)', alignSelf: 'flex-start', marginHorizontal: 14, borderRadius: 10, marginBottom: 4, borderWidth: 1, borderColor: '#bae6fd' },
  typingText: { fontSize: 11, fontStyle: 'italic', color: C.primary, fontWeight: '700' },

  inputBar: { width: "100%", flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.95)", paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1.5, borderColor: C.border, gap: 10, height: 70, flexShrink: 0, zIndex: 1 },
  textInput: { flex: 1, backgroundColor: "#f8fafc", borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, maxHeight: 50, fontSize: 13, fontWeight: "600", color: C.dark },
  sendBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: C.primary, justifyContent: "center", alignItems: "center", elevation: 2 },
  
  emptyMessagesContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  emptyMessagesText: { fontSize: 16, fontWeight: "700", color: C.dark, marginTop: 12 },
  emptyMessagesSubText: { fontSize: 14, color: C.gray, marginTop: 4 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  loadingText: { fontSize: 14, color: C.gray, fontWeight: "600" },

  contextMenuOverlay: { flex: 1, backgroundColor: "transparent" },
  contextMenuContainer: { position: "absolute", backgroundColor: C.white, borderRadius: 12, paddingVertical: 6, minWidth: 180, elevation: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" },
  contextMenuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 16, gap: 12 },
  contextMenuItemDanger: { borderTopWidth: 1, borderTopColor: "#f1f1f1", marginTop: 2, paddingTop: 10 },
  contextMenuItemText: { fontSize: 14, color: C.dark, fontWeight: "500" },
  contextMenuDivider: { height: 1, backgroundColor: "#f1f1f1", marginVertical: 4 },
  contextMenuInfoItem: { flexDirection: "row", alignItems: "center", paddingVertical: 4, paddingHorizontal: 16, gap: 8 },
  contextMenuInfoText: { fontSize: 11, color: C.gray },

  modalOverlay: { flex: 1, backgroundColor: "rgba(7, 30, 61, 0.75)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalCard: { width: "100%", maxWidth: 320, backgroundColor: C.white, borderRadius: 20, padding: 20, alignItems: "center", elevation: 15, position: "relative" },
  modalCloseBtn: { position: "absolute", top: 12, right: 12, width: 30, height: 30, borderRadius: 15, backgroundColor: "#f1f5f9", justifyContent: "center", alignItems: "center" },
  modalAvatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: "#38bdf8", marginBottom: 12, backgroundColor: "#e2e8f0" },
  modalName: { fontSize: 16, fontWeight: "900", color: C.dark, marginBottom: 6, textAlign: "center" },
  roleBadge: { backgroundColor: "#e0f2fe", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: "#bae6fd", marginBottom: 14 },
  roleBadgeText: { fontSize: 10, fontWeight: "900", color: C.primary },
  adminDetailsBox: { width: "100%", backgroundColor: "#f8fafc", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#e2e8f0", gap: 6 },
  detailText: { fontSize: 12, color: C.dark, fontWeight: "600" },
  viewProfileBtn: { backgroundColor: C.dark, height: 38, borderRadius: 10, justifyContent: "center", alignItems: "center", marginTop: 10, elevation: 2 },
  viewProfileBtnText: { color: C.white, fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
});