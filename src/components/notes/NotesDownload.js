// src/components/notes/NotesDownload.js
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Platform,
  RefreshControl,
  Dimensions,
  Image,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { db } from "../../services/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

let WebView = null;
if (Platform.OS !== 'web') {
  WebView = require("react-native-webview").WebView;
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 28;

const C = {
  primary: "#0284c7",
  primaryLight: "#e0f2fe",
  dark: "#071e3d",
  danger: "#ef4444",
  success: "#10b981",
  white: "#ffffff",
  border: "rgba(255, 255, 255, 0.8)",
  gray: "#64748b",
  bg: "#f0f6ff",
  lightBg: "rgba(255, 255, 255, 0.75)",
};

const shadowStyle = Platform.select({
  ios: { shadowColor: "#0ea5e9", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  android: { elevation: 3 },
  web: { boxShadow: '0px 4px 16px rgba(14, 165, 233, 0.06)' },
});

const WebPdfThumbnail = ({ pdfUrl }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateThumbnail = async () => {
      try {
        let pdfjsLib = window.pdfjsLib;
        if (!pdfjsLib) {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
          pdfjsLib = window.pdfjsLib;
        }

        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport: viewport }).promise;
        setThumbnailUrl(canvas.toDataURL());
        setLoading(false);
      } catch (error) {
        console.error("Error generating thumbnail:", error);
        setLoading(false);
      }
    };
    generateThumbnail();
  }, [pdfUrl]);

  if (loading) {
    return (
      <View style={styles.pdfFallback}>
        <ActivityIndicator size="small" color={C.primary} />
        <Text style={styles.previewUnavailable}>Loading...</Text>
      </View>
    );
  }

  if (thumbnailUrl) {
    return <Image source={{ uri: thumbnailUrl }} style={styles.thumbnailImage} resizeMode="cover" />;
  }

  return (
    <View style={styles.pdfFallback}>
      <MaterialIcons name="picture-as-pdf" size={40} color={C.danger} />
      <Text style={styles.pdfFallbackText}>PDF</Text>
    </View>
  );
};

const MobilePdfThumbnail = ({ pdfUrl }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!pdfUrl) {
    return (
      <View style={styles.pdfFallback}>
        <MaterialIcons name="picture-as-pdf" size={40} color={C.danger} />
        <Text style={styles.pdfFallbackText}>PDF</Text>
      </View>
    );
  }

  const safePdfUrl = JSON.stringify(pdfUrl);
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #ffffff; }
    #container { width: 100%; height: 100%; overflow: hidden; display: flex; justify-content: flex-start; align-items: flex-start; background: #ffffff; }
    canvas { display: block; width: 100% !important; height: auto !important; background: white; }
  </style>
</head>
<body>
  <div id="container"><canvas id="pdfCanvas"></canvas></div>
  <script>
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
    const pdfUrl = ${safePdfUrl};
    async function renderPDF() {
      try {
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        const page = await pdf.getPage(1);
        const container = document.getElementById("container");
        const canvas = document.getElementById("pdfCanvas");
        const context = canvas.getContext("2d");
        const containerWidth = container.clientWidth || window.innerWidth || 300;
        const originalViewport = page.getViewport({ scale: 1 });
        const scale = containerWidth / originalViewport.width;
        const viewport = page.getViewport({ scale: scale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: context, viewport: viewport }).promise;
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: "success" }));
      } catch (error) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: "error" }));
      }
    }
    function waitForPDFJS() {
      if (typeof pdfjsLib !== "undefined") { renderPDF(); } else { setTimeout(waitForPDFJS, 100); }
    }
    waitForPDFJS();
  </script>
</body>
</html>
`;

  return (
    <View style={styles.thumbnailWrapper}>
      {WebView && (
        <WebView
          source={{ html: html, baseUrl: "https://localhost/" }}
          style={styles.thumbnailWebView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={["*"]}
          mixedContentMode="always"
          allowFileAccess={true}
          scrollEnabled={false}
          bounces={false}
          setSupportMultipleWindows={false}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.type === "success") { setLoaded(true); setError(false); }
              if (data.type === "error") { setError(true); }
            } catch (e) {}
          }}
          onError={() => setError(true)}
        />
      )}
      {!loaded && !error && (
        <View style={styles.thumbnailLoading}>
          <ActivityIndicator size="small" color={C.primary} />
        </View>
      )}
      {error && (
        <View style={styles.pdfFallback}>
          <MaterialIcons name="picture-as-pdf" size={40} color={C.danger} />
          <Text style={styles.pdfFallbackText}>PDF</Text>
        </View>
      )}
    </View>
  );
};

const PdfThumbnail = Platform.OS === 'web' ? WebPdfThumbnail : MobilePdfThumbnail;

export default function NotesDownload() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState("");

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Recent";
    try {
      const date = timestamp.toDate();
      return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch (error) {
      return "Recent";
    }
  };

  useEffect(() => {
    const q = query(collection(db, "notes"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setNotes(notesList);
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      setLoading(false);
      setRefreshing(false);
    });
    return () => unsubscribe();
  }, []);

  const openPdf = (pdfUrl, title) => {
    if (!pdfUrl) return;
    if (Platform.OS === 'web') {
      window.open(pdfUrl, '_blank');
    } else {
      setSelectedPdf(pdfUrl);
      setSelectedTitle(title || "PDF Viewer");
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={styles.loadingText}>Loading notes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.waterBlobTop} />
      <View style={styles.waterBlobBottom} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(false)} colors={[C.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* COMPACT DRISHTEE STUDY NOTES HEADER */}
        <View style={styles.headerCard}>
          <View style={styles.accentLine} />
          
          <View style={styles.headerTopRow}>
            <View style={styles.badgeContainer}>
              <MaterialIcons name="menu-book" size={12} color={C.primary} />
              <Text style={styles.badgeText}>Drishtee Study Notes</Text>
            </View>

            <View style={styles.counterBadge}>
              <MaterialIcons name="description" size={11} color={C.white} />
              <Text style={styles.counterText}>Total: {notes.length}</Text>
            </View>
          </View>

          <Text style={styles.headerTitle}>
            Drishtee Official <Text style={styles.gradientText}>Study Notes</Text>
          </Text>

          <Text style={styles.headerSubtitle}>
            Access premium quality curated study materials, lecture PDFs, and notes structured for your academic success.
          </Text>
        </View>

        {notes.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialIcons name="folder-open" size={42} color={C.gray} />
            <Text style={styles.emptyText}>No notes available yet.</Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {notes.map((note) => (
              <TouchableOpacity
                key={note.id}
                style={styles.noteCard}
                onPress={() => openPdf(note.pdfUrl, note.title)}
                activeOpacity={0.85}
              >
                <View style={styles.thumbnailContainer}>
                  {note.pdfUrl ? <PdfThumbnail pdfUrl={note.pdfUrl} /> : (
                    <View style={styles.pdfFallback}>
                      <MaterialIcons name="picture-as-pdf" size={40} color={C.danger} />
                      <Text style={styles.pdfFallbackText}>PDF</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.title} numberOfLines={2}>{note.title || "Untitled"}</Text>
                  <Text style={styles.date}>📅 {formatTimestamp(note.createdAt)}</Text>
                  <View style={styles.readBtn}>
                    <MaterialIcons name="menu-book" size={13} color={C.primary} />
                    <Text style={styles.readBtnText}>Read Online</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {selectedPdf && Platform.OS !== 'web' && WebView && (
        <Modal visible={true} animationType="slide" onRequestClose={() => setSelectedPdf(null)} presentationStyle="fullScreen" statusBarTranslucent>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <MaterialIcons name="picture-as-pdf" size={18} color={C.primary} />
                <Text style={styles.modalTitle} numberOfLines={1}>{selectedTitle || "PDF Viewer"}</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedPdf(null)} activeOpacity={0.8}>
                <MaterialIcons name="close" size={20} color={C.white} />
              </TouchableOpacity>
            </View>
            <View style={styles.pdfViewerContainer}>
              <WebView
                source={{ uri: selectedPdf }}
                style={styles.pdfViewer}
                javaScriptEnabled
                domStorageEnabled
                startInLoadingState
                originWhitelist={["*"]}
                mixedContentMode="always"
                setSupportMultipleWindows={false}
                renderLoading={() => (
                  <View style={styles.pdfLoading}>
                    <ActivityIndicator size="large" color={C.primary} />
                  </View>
                )}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, position: "relative" },
  waterBlobTop: { position: "absolute", top: -40, right: -40, width: 240, height: 240, borderRadius: 120, backgroundColor: "#38bdf8", opacity: 0.15 },
  waterBlobBottom: { position: "absolute", bottom: -40, left: -40, width: 240, height: 240, borderRadius: 120, backgroundColor: "#34d399", opacity: 0.13 },
  contentContainer: { padding: 14, paddingBottom: 100 }, // 👈 Increased bottom padding to 100 to provide 60px+ safe space above the bottom navbar
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: C.bg },
  loadingText: { marginTop: 10, fontSize: 12, fontWeight: "700", color: C.gray },
  
  headerCard: {
    backgroundColor: C.lightBg,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    marginBottom: 12,
    position: "relative",
    overflow: "hidden",
    ...shadowStyle,
  },
  accentLine: { position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: C.primary },
  headerTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  badgeContainer: {
    backgroundColor: C.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#bae6fd",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  badgeText: { fontSize: 9, fontWeight: "800", color: C.primary, textTransform: "uppercase" },
  counterBadge: {
    backgroundColor: C.dark,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  counterText: { color: C.white, fontSize: 9, fontWeight: "800" },
  headerTitle: { fontSize: 16, fontWeight: "900", color: C.dark, marginBottom: 2 },
  gradientText: { color: C.primary },
  headerSubtitle: { fontSize: 10, fontWeight: "600", color: C.gray, lineHeight: 14 },

  emptyCard: { backgroundColor: C.lightBg, borderRadius: 14, padding: 24, alignItems: "center", borderWidth: 1.5, borderColor: C.border, ...shadowStyle },
  emptyText: { fontSize: 13, fontWeight: "900", color: C.dark, marginTop: 8 },

  gridContainer: { width: "100%" },
  noteCard: {
    width: CARD_WIDTH,
    backgroundColor: C.lightBg,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: C.border,
    marginBottom: 14,
    ...shadowStyle,
  },
  thumbnailContainer: {
    width: "100%",
    height: 360, // 👈 Increased thumbnail card height
    backgroundColor: C.white,
    position: "relative",
    overflow: "hidden",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  thumbnailWrapper: { width: "100%", height: "100%", position: "relative", backgroundColor: C.white },
  thumbnailWebView: { flex: 1, backgroundColor: "transparent" },
  thumbnailImage: { width: "100%", height: "100%", resizeMode: "cover" },
  thumbnailLoading: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 5, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" },
  
  pdfFallback: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fee2e2" },
  pdfFallbackText: { marginTop: 4, fontSize: 11, fontWeight: "900", color: C.danger },
  
  cardBody: { padding: 12, justifyContent: "space-between", backgroundColor: "rgba(255, 255, 255, 0.85)" },
  title: { fontSize: 13, fontWeight: "900", color: C.dark, marginBottom: 3, lineHeight: 17 },
  date: { fontSize: 10, color: C.gray, fontWeight: "700", marginBottom: 8 },
  readBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: C.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  readBtnText: { fontSize: 10, fontWeight: "900", color: C.primary },

  modalContainer: { flex: 1, backgroundColor: "#000" },
  modalHeader: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitleContainer: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6, marginRight: 8 },
  modalTitle: { flex: 1, fontSize: 13, fontWeight: "900", color: C.dark },
  closeButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.danger, justifyContent: "center", alignItems: "center" },
  pdfViewerContainer: { flex: 1, backgroundColor: "#111827" },
  pdfViewer: { flex: 1, backgroundColor: C.white },
  pdfLoading: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: C.white },
});