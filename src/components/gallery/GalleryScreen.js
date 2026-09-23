// src/components/gallery/GalleryScreen.js
// ✅ Pure mobile — website + mobile dono ke posts fetch karega
// ✅ expo-image caching — bar bar load nahi karega

import React, { useEffect, useState, useCallback, memo } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  TextInput,
  Linking,
  Dimensions,
} from "react-native";
import { Image } from "expo-image"; // ✅ Caching ke liye
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { db } from "../../services/firebase";
import {
  collection,
  query,
  onSnapshot,
  updateDoc,
  doc,
  limit,
  deleteDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import UploadModal from "./GalleryUploadModal";
import LikeButton from "./LikeButton";
import DownloadButton from "./DownloadButton";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#0284c7",
  dark: "#071e3d",
  bg: "#f0f6ff",
  white: "#ffffff",
  text: "#0f172a",
  gray: "#64748b",
  border: "#e2e8f0",
  danger: "#ef4444",
};

/* ======================================================
   ✅ HELPERS
====================================================== */
const getPostTime = (post) => {
  const t =
    post.createdAt ||
    post.created_at ||
    post.uploadedAt ||
    post.timestamp ||
    post.date ||
    post.time;
  if (!t) return 0;
  if (typeof t?.toDate === "function") return t.toDate().getTime();
  const parsed = new Date(t).getTime();
  return isNaN(parsed) ? 0 : parsed;
};

const getUserPhoto = (post) => {
  return (
    post.userPhoto ||
    post.photoURL ||
    post.photoUrl ||
    post.avatar ||
    post.userAvatar ||
    post.profilePic ||
    post.profilePhoto ||
    ""
  );
};

const getMediaUrl = (post) => {
  return (
    post.url ||
    post.imageUrl ||
    post.mediaUrl ||
    post.fileUrl ||
    post.media ||
    post.image ||
    ""
  );
};

const getUploaderName = (post) => {
  return (
    post.uploadedBy ||
    post.author ||
    post.userName ||
    post.uploader ||
    post.name ||
    "Admin"
  );
};

const getMediaType = (post, mediaUrl) => {
  if (post.type) return post.type;
  if (mediaUrl.includes(".pdf")) return "pdf";
  if (mediaUrl.includes(".mp4") || mediaUrl.includes("/video/")) return "video";
  return "image";
};

/* ======================================================
   ✅ OPTIMIZED URL — SAFE TRANSFORMATIONS
====================================================== */
const getOptimizedUrl = (url, type = "post") => {
  if (!url || typeof url !== "string") return "";
  if (!url.includes("cloudinary.com")) return url;

  try {
    const afterUpload = url.split("/upload/")[1] || "";
    const firstSegment = afterUpload.split("/")[0] || "";

    if (
      firstSegment.includes("f_auto") ||
      firstSegment.includes("q_auto") ||
      firstSegment.includes("w_") ||
      firstSegment.includes("c_") ||
      firstSegment.includes("g_")
    ) {
      return url;
    }

    let cleanUrl = url.replace(/\/v\d+\//, "/");
    const urlParts = cleanUrl.split("/upload/");
    if (urlParts.length < 2) return cleanUrl;

    const transformations =
      type === "avatar"
        ? "f_auto,q_auto:eco,w_120,h_120,c_fill/"
        : "f_auto,q_auto:eco,w_800,h_600,c_fill/";

    return `${urlParts[0]}/upload/${transformations}${urlParts[1]}`;
  } catch (err) {
    return url;
  }
};

const getFallbackAvatar = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || "User"
  )}&background=0284c7&color=fff&size=120`;
};

/* ======================================================
   ✅ GALLERY POST CARD (memoized)
====================================================== */
const GalleryPostCard = memo(
  ({
    post,
    currentUserId,
    isAdmin,
    isCommentsOpen,
    commentText,
    onDeletePress,
    onImagePress,
    onToggleComments,
    onReact,
    onCommentChange,
    onCommentSend,
    onOpenMedia,
  }) => {
    const p = post;

    const [avatarStage, setAvatarStage] = useState(0);
    const [mediaStage, setMediaStage] = useState(0);

    const mediaUrl = getMediaUrl(p);
    const userPhoto = getUserPhoto(p);
    const uploaderName = getUploaderName(p);
    const mediaType = getMediaType(p, mediaUrl);
    const uploadedById = p.uploadedById || p.userId || p.uid || "";

    const optimizedImageUrl = getOptimizedUrl(mediaUrl);
    const optimizedAvatarUrl = getOptimizedUrl(userPhoto, "avatar");

    // Avatar URL with fallback chain
    let avatarUrl;
    if (!userPhoto) {
      avatarUrl = getFallbackAvatar(uploaderName);
    } else if (avatarStage === 0) {
      avatarUrl = optimizedAvatarUrl;
    } else if (avatarStage === 1) {
      avatarUrl = userPhoto;
    } else {
      avatarUrl = getFallbackAvatar(uploaderName);
    }

    // Media URL with fallback chain
    let finalMediaUrl;
    if (mediaStage === 0) {
      finalMediaUrl = optimizedImageUrl;
    } else {
      finalMediaUrl = mediaUrl;
    }

    const userReaction = p.reactions?.[currentUserId];
    const canDelete = isAdmin || uploadedById === currentUserId;
    const likes = Array.isArray(p.likes) ? p.likes : [];
    const comments = Array.isArray(p.comments) ? p.comments : [];

    return (
      <View style={styles.postCard}>
        {/* ===== Header ===== */}
        <View style={styles.cardHeader}>
          <View style={styles.userInfoRow}>
            <Image
              source={{ uri: avatarUrl }}
              style={styles.userAvatar}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={200}
              onError={() => {
                if (avatarStage < 2) {
                  setAvatarStage(avatarStage + 1);
                }
              }}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.postTitle} numberOfLines={1}>
                {p.title || "Untitled Post"}
              </Text>
              <Text style={styles.postAuthor} numberOfLines={1}>
                by {uploaderName}
              </Text>
            </View>
          </View>

          {canDelete && (
            <TouchableOpacity
              onPress={() => onDeletePress(p.id)}
              style={styles.trashBtn}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name="delete-outline"
                size={18}
                color={COLORS.danger}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* ===== Media Box ===== */}
        <View style={styles.mediaBox}>
          {mediaType === "image" && mediaUrl && (
            <TouchableOpacity
              onPress={() => onImagePress(finalMediaUrl)}
              activeOpacity={0.9}
              style={{ width: "100%", height: "100%" }}
            >
              <Image
                source={{ uri: finalMediaUrl }}
                style={styles.mediaImage}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={300}
                onError={() => {
                  if (mediaStage === 0) {
                    setMediaStage(1);
                  }
                }}
              />
            </TouchableOpacity>
          )}

          {mediaType === "video" && (
            <TouchableOpacity
              style={styles.videoPlaceholder}
              onPress={() => onOpenMedia(mediaUrl, "video")}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name="play-circle-filled"
                size={48}
                color="#fff"
              />
              <Text style={styles.videoText}>Tap to Play Video</Text>
            </TouchableOpacity>
          )}

          {mediaType === "pdf" && (
            <TouchableOpacity
              style={styles.pdfBox}
              onPress={() => onOpenMedia(mediaUrl, "pdf")}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name="picture-as-pdf"
                size={40}
                color={COLORS.danger}
              />
              <Text style={styles.pdfText}>Tap to Open PDF Document</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ===== Stats Bar ===== */}
        <View style={styles.statsBar}>
          <Text style={styles.statsText}>❤️ {likes.length} reactions</Text>
          <TouchableOpacity onPress={() => onToggleComments(p.id)}>
            <Text style={styles.statsText}>{comments.length} Comments</Text>
          </TouchableOpacity>
        </View>

        {/* ===== Action Bar ===== */}
        <View style={styles.actionBar}>
          <LikeButton
            isLiked={!!userReaction}
            userReaction={userReaction}
            onClick={(emoji) => onReact(p.id, emoji, p.reactions || {})}
          />
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => onToggleComments(p.id)}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="chat-bubble-outline"
              size={18}
              color={COLORS.gray}
            />
            <Text style={styles.actionText}>Comment</Text>
          </TouchableOpacity>
          <DownloadButton
            imageUrl={mediaUrl}
            imageId={p.id}
            count={p.downloadCount || 0}
            filename={p.title}
          />
        </View>

        {/* ===== Comments ===== */}
        {isCommentsOpen && (
          <View style={styles.commentSection}>
            {comments.map((c, i) => (
              <View key={c.id || i} style={styles.commentBubble}>
                <Text style={styles.commentUser}>
                  {c.userName || c.user || "User"}
                </Text>
                <Text style={styles.commentBody}>
                  {c.text || c.comment || ""}
                </Text>
              </View>
            ))}
            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write comment..."
                placeholderTextColor={COLORS.gray}
                value={commentText || ""}
                onChangeText={(txt) => onCommentChange(p.id, txt)}
              />
              <TouchableOpacity
                style={styles.sendBtn}
                onPress={() => onCommentSend(p.id)}
                activeOpacity={0.8}
              >
                <MaterialIcons name="send" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  },
  (prev, next) => {
    return (
      prev.post === next.post &&
      prev.isCommentsOpen === next.isCommentsOpen &&
      prev.commentText === next.commentText &&
      prev.currentUserId === next.currentUserId &&
      prev.isAdmin === next.isAdmin
    );
  }
);

/* ======================================================
   ✅ MAIN GALLERY SCREEN
====================================================== */
export default function GalleryScreen({ navigation }) {
  const { user, role, isLoggedIn } = useAuth();
  const isAdmin =
    role === "admin" ||
    user?.email?.toLowerCase() === "hridesh027@gmail.com";

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [activeComments, setActiveComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [selectedImg, setSelectedImg] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const currentUserId = user?.uid || "guest";
  const displayName =
    user?.displayName || user?.email?.split("@")[0] || "Guest Student";
  const photoURL = user?.photoURL || user?.photoUrl || "";

  /* ======================================================
     ✅ FETCH ALL POSTS
  ====================================================== */
  useEffect(() => {
    const q = query(collection(db, "galleryImages"), limit(80));

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const fetchedPosts = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        fetchedPosts.sort((a, b) => getPostTime(b) - getPostTime(a));

        console.log(
          "📸 Gallery Posts fetched:",
          fetchedPosts.length,
          "| With userPhoto:",
          fetchedPosts.filter((p) => getUserPhoto(p)).length
        );

        setPosts(fetchedPosts);
        setLoading(false);
      },
      (err) => {
        console.error("Gallery sync error:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updatePost = useCallback((id, data) => {
    return updateDoc(doc(db, "galleryImages", id), data);
  }, []);

  /* ======================================================
     ✅ FILTER
  ====================================================== */
  const filteredPosts =
    filterType === "all"
      ? posts
      : posts.filter((p) => {
          const mediaUrl = getMediaUrl(p);
          const type = getMediaType(p, mediaUrl);
          return type === filterType;
        });

  /* ======================================================
     ✅ DELETE
  ====================================================== */
  const confirmDeletePost = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteDoc(doc(db, "galleryImages", deleteTargetId));
      setDeleteTargetId(null);
    } catch (err) {
      console.error("Delete failed:", err);
      setDeleteTargetId(null);
    }
  };

  /* ======================================================
     ✅ OPEN EXTERNAL MEDIA
  ====================================================== */
  const handleOpenMedia = async (url, type) => {
    if (!url) return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Cannot open this file format directly.");
      }
    } catch (error) {
      console.error("URL open error:", error);
    }
  };

  /* ======================================================
     ✅ MEMOIZED HANDLERS
  ====================================================== */
  const handleReact = useCallback(
    async (id, emoji, existingReactions) => {
      const reactions = { ...existingReactions };
      if (emoji) {
        reactions[currentUserId] = emoji;
        await updatePost(id, {
          likes: arrayUnion(currentUserId),
          reactions,
        });
      } else {
        delete reactions[currentUserId];
        await updatePost(id, {
          likes: arrayRemove(currentUserId),
          reactions,
        });
      }
    },
    [currentUserId, updatePost]
  );

  const handleToggleComments = useCallback((id) => {
    setActiveComments((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleCommentChange = useCallback((id, txt) => {
    setCommentText((prev) => ({ ...prev, [id]: txt }));
  }, []);

  const handleCommentSend = useCallback(
    async (id) => {
      const text = commentText[id]?.trim();
      if (!text) return;
      try {
        await updatePost(id, {
          comments: arrayUnion({
            text,
            userId: currentUserId,
            userName: displayName,
            id: Date.now(),
          }),
        });
        setCommentText((prev) => ({ ...prev, [id]: "" }));
      } catch (err) {
        console.error("Comment failed:", err);
      }
    },
    [commentText, currentUserId, displayName, updatePost]
  );

  /* ======================================================
     ✅ STABLE RENDER ITEM
  ====================================================== */
  const renderItem = useCallback(
    ({ item }) => (
      <GalleryPostCard
        post={item}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        isCommentsOpen={!!activeComments[item.id]}
        commentText={commentText[item.id] || ""}
        onDeletePress={setDeleteTargetId}
        onImagePress={setSelectedImg}
        onToggleComments={handleToggleComments}
        onReact={handleReact}
        onCommentChange={handleCommentChange}
        onCommentSend={handleCommentSend}
        onOpenMedia={handleOpenMedia}
      />
    ),
    [
      currentUserId,
      isAdmin,
      activeComments,
      commentText,
      handleToggleComments,
      handleReact,
      handleCommentChange,
      handleCommentSend,
    ]
  );

  /* ======================================================
     ✅ LOADING
  ====================================================== */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Gallery...</Text>
      </View>
    );
  }

  /* ======================================================
     ✅ RENDER
  ====================================================== */
  return (
    <View style={styles.container}>
      <View style={styles.waterBlobTop} />
      <View style={styles.waterBlobBottom} />

      {/* NAVBAR */}
      <View style={styles.navbar}>
        <Text style={styles.navTitle}>
          DRISHTEE <Text style={{ color: COLORS.danger }}>GALLERY</Text>
        </Text>
        <TouchableOpacity
          style={styles.addPostBtn}
          onPress={() => {
            if (isLoggedIn || user) {
              setShowUploadModal(true);
            } else {
              Alert.alert("Login Required", "Please login to add a post.", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Login",
                  onPress: () => navigation.navigate("Login"),
                },
              ]);
            }
          }}
          activeOpacity={0.8}
        >
          <MaterialIcons name="add" size={16} color="#fff" />
          <Text style={styles.addPostText}>
            {isLoggedIn || user ? "Add Post" : "Login"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* FILTERS */}
      <View style={styles.storiesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {[
            { id: "all", label: "All Feeds", icon: "widgets" },
            { id: "image", label: "Photos", icon: "image" },
            { id: "video", label: "Reels", icon: "play-circle" },
            { id: "pdf", label: "Documents", icon: "picture-as-pdf" },
          ].map((t) => {
            const isActive = filterType === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => setFilterType(t.id)}
                style={[styles.storyRing, isActive && styles.storyRingActive]}
                activeOpacity={0.8}
              >
                <View style={styles.storyCircle}>
                  <MaterialIcons
                    name={t.icon}
                    size={22}
                    color={isActive ? COLORS.danger : COLORS.dark}
                  />
                </View>
                <Text
                  style={[
                    styles.storyText,
                    isActive && styles.storyTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* POSTS LIST */}
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <MaterialIcons
              name="photo-library"
              size={40}
              color={COLORS.gray}
            />
            <Text style={styles.emptyTitle}>No Gallery Posts Found</Text>
          </View>
        }
      />

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        visible={!!deleteTargetId}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.customModalOverlay}>
          <View style={styles.customModalCard}>
            <MaterialIcons
              name="warning-amber"
              size={32}
              color={COLORS.danger}
              style={{ marginBottom: 8 }}
            />
            <Text style={styles.customModalTitle}>Delete Post</Text>
            <Text style={styles.customModalSub}>
              Are you sure you want to delete this post? This action cannot be
              undone.
            </Text>
            <View style={styles.customModalBtnRow}>
              <TouchableOpacity
                style={styles.customCancelBtn}
                onPress={() => setDeleteTargetId(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.customCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.customConfirmBtn}
                onPress={confirmDeletePost}
                activeOpacity={0.8}
              >
                <Text style={styles.customConfirmText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* UPLOAD MODAL */}
      <UploadModal
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        userDetails={{ displayName, currentUserId, photoURL }}
      />

      {/* IMAGE ZOOM MODAL */}
      <Modal
        visible={!!selectedImg}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImg(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.closeZoom}
            onPress={() => setSelectedImg(null)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {selectedImg && (
            <Image
              source={{ uri: selectedImg }}
              style={styles.zoomedImage}
              contentFit="contain"
              cachePolicy="memory-disk"
              transition={200}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

/* ======================================================
   ✅ STYLES
====================================================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, position: "relative" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.bg,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.gray,
  },

  waterBlobTop: {
    position: "absolute",
    top: -30,
    right: -40,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#38bdf8",
    opacity: 0.16,
  },
  waterBlobBottom: {
    position: "absolute",
    bottom: -30,
    left: -40,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#34d399",
    opacity: 0.14,
  },

  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },
  navTitle: { fontSize: 16, fontWeight: "900", color: COLORS.dark },
  addPostBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.danger,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    elevation: 2,
  },
  addPostText: { color: "#fff", fontSize: 11, fontWeight: "900" },

  storiesWrapper: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 8,
  },
  filterScroll: { paddingHorizontal: 12, gap: 12 },
  storyRing: { alignItems: "center", width: 68, padding: 2 },
  storyRingActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.danger,
  },
  storyCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    elevation: 2,
  },
  storyText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.gray,
    marginTop: 4,
    textAlign: "center",
  },
  storyTextActive: { color: COLORS.danger, fontWeight: "900" },

  listContent: { padding: 14, paddingBottom: 40 },

  postCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    overflow: "hidden",
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  userInfoRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f1f5f9",
  },
  postTitle: { fontSize: 13, fontWeight: "900", color: COLORS.text },
  postAuthor: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.gray,
    marginTop: 1,
  },
  trashBtn: {
    padding: 6,
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
  },

  mediaBox: {
    width: "100%",
    height: 260,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
  },
  mediaImage: { width: "100%", height: "100%" },
  videoPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    width: "100%",
    height: "100%",
  },
  videoText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  pdfBox: {
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    width: "100%",
    height: "100%",
  },
  pdfText: { color: COLORS.text, fontSize: 12, fontWeight: "900" },

  statsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  statsText: { fontSize: 11, fontWeight: "700", color: COLORS.gray },

  actionBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 6,
    backgroundColor: "#fff",
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  actionText: { fontSize: 11, fontWeight: "800", color: COLORS.gray },

  commentSection: {
    backgroundColor: "#f8fafc",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    gap: 6,
  },
  commentBubble: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  commentUser: { fontSize: 10, fontWeight: "900", color: COLORS.danger },
  commentBody: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 2,
  },
  commentInputRow: { flexDirection: "row", gap: 6, marginTop: 4 },
  commentInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.text,
  },
  sendBtn: {
    backgroundColor: COLORS.danger,
    justifyContent: "center",
    alignItems: "center",
    width: 36,
    borderRadius: 8,
  },

  emptyBox: {
    padding: 40,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.dark,
    marginTop: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(7, 30, 61, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeZoom: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
  },
  zoomedImage: { width: width * 0.95, height: width * 0.95 },

  customModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(7, 30, 61, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  customModalCard: {
    width: "100%",
    maxWidth: 300,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    elevation: 8,
  },
  customModalTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 6,
  },
  customModalSub: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 20,
  },
  customModalBtnRow: { flexDirection: "row", gap: 10, width: "100%" },
  customCancelBtn: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  customCancelText: { color: "#0f172a", fontSize: 12, fontWeight: "900" },
  customConfirmBtn: {
    flex: 1,
    backgroundColor: COLORS.danger,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  customConfirmText: { color: "#fff", fontSize: 12, fontWeight: "900" },
});