// src/components/VerificationScreen.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ActivityIndicator, ScrollView, Alert, KeyboardAvoidingView, Platform, Dimensions 
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { collection, onSnapshot, query, orderBy, doc } from "firebase/firestore";
import { db } from "../services/firebase";
import AdmissionProvider from "../dashboard/admin/studentManagement/AdmissionProvider";
import StudentCertificate from "../dashboard/student/Certificate/StudentCertificate";
import { getFeeLogic } from "../dashboard/admin/studentManagement/fees/FeePage";
const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#0EA5E9",
  primaryDark: "#0284C7",
  navy: "#0F172A",
  background: "#F0F6FF",
  white: "#FFFFFF",
  cardBg: "rgba(255, 255, 255, 0.78)", // Glassmorphism translucent background
  text: "#0F172A",
  textDark: "#020617",
  textMuted: "#64748B",
  border: "rgba(255, 255, 255, 0.9)",
  borderLight: "#CBD5E1",
  blueLight: "#E0F2FE",
  blueBorder: "#BAE6FD",
  green: "#10B981",
  greenLight: "#ECFDF5",
  red: "#EF4444",
  redLight: "#FEF2F2",
  warning: "#F59E0B",
  warningLight: "#FFFBEB",
};

// Complex Textured Captcha Component
function NativeCaptcha({ onVerify }) {
  const [captchaChars, setCaptchaChars] = useState([]);
  const [captchaString, setCaptchaString] = useState("");
  const [userInput, setUserInput] = useState("");
  const [noiseDots, setNoiseDots] = useState([]);
  const [noiseLines, setNoiseLines] = useState([]);

  const generateCaptcha = useCallback(() => {
    const charsList = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const colorsList = ["#0284C7", "#059669", "#DC2626", "#7C3AED", "#D97706", "#DB2777", "#2563EB"];
    
    let generatedChars = [];
    let rawStr = "";

    for (let i = 0; i < 6; i++) {
      const char = charsList.charAt(Math.floor(Math.random() * charsList.length));
      rawStr += char;
      generatedChars.push({
        id: i,
        char,
        color: colorsList[Math.floor(Math.random() * colorsList.length)],
        rotate: `${Math.floor(Math.random() * 50) - 25}deg`,
        fontSize: Math.floor(Math.random() * 8) + 18,
        skew: `${Math.floor(Math.random() * 40) - 20}deg`,
        topOffset: Math.floor(Math.random() * 12) - 6,
      });
    }

    let dots = [];
    for (let d = 0; d < 30; d++) {
      dots.push({
        id: d,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 3.5 + 1,
        color: colorsList[Math.floor(Math.random() * colorsList.length)]
      });
    }

    let lines = [];
    for (let l = 0; l < 5; l++) {
      lines.push({
        id: l,
        top: `${Math.random() * 80}%`,
        width: `${Math.random() * 60 + 40}%`,
        left: `${Math.random() * 20}%`,
        rotate: `${Math.floor(Math.random() * 40) - 20}deg`,
        color: colorsList[Math.floor(Math.random() * colorsList.length)]
      });
    }

    setCaptchaChars(generatedChars);
    setCaptchaString(rawStr);
    setNoiseDots(dots);
    setNoiseLines(lines);
    setUserInput("");
    onVerify(false);
  }, [onVerify]);

  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  const handleChange = (val) => {
    setUserInput(val);
    onVerify(val.trim() === captchaString);
  };

  return (
    <View style={styles.captchaBox}>
      <View style={styles.captchaHeader}>
        <View style={styles.captchaVisualContainer}>
          <View style={styles.matrixGridOverlay}>
            <Text style={styles.matrixGridText}># / * $ % & ? ! ~ @ \ _ - + = <></> ⚛ ⚡ 🌀</Text>
          </View>

          {noiseDots.map((dot) => (
            <View 
              key={`dot-${dot.id}`} 
              style={[
                styles.noiseDot, 
                { top: dot.top, left: dot.left, width: dot.size, height: dot.size, backgroundColor: dot.color }
              ]} 
            />
          ))}

          {noiseLines.map((line) => (
            <View 
              key={`line-${line.id}`} 
              style={[
                styles.noiseLine, 
                { top: line.top, left: line.left, width: line.width, backgroundColor: line.color, transform: [{ rotate: line.rotate }] }
              ]} 
            />
          ))}
          
          <View style={styles.captchaCharsRow}>
            {captchaChars.map((item) => (
              <Text 
                key={item.id} 
                style={[
                  styles.captchaCharItem, 
                  { 
                    color: item.color, 
                    fontSize: item.fontSize,
                    top: item.topOffset,
                    transform: [{ rotate: item.rotate }, { skewX: item.skew }]
                  }
                ]}
              >
                {item.char}
              </Text>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.refreshCaptchaBtn} onPress={generateCaptcha} activeOpacity={0.7}>
          <MaterialIcons name="refresh" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.captchaInput}
        placeholder="Type Complex Captcha"
        placeholderTextColor="#94a3b8"
        value={userInput}
        onChangeText={handleChange}
        maxLength={8}
        autoCapitalize="none"
      />
    </View>
  );
}

export default function VerificationScreen({ navigation }) {
  const [regNo, setRegNo] = useState("");
  const [searchEmail, setSearchEmail] = useState(null);
  const [liveStudent, setLiveStudent] = useState(null);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!searchEmail) return;

    let isMounted = true;
    setIsSyncing(true);

    const emailId = searchEmail.toLowerCase().trim();

    const unsubStudent = onSnapshot(
      doc(db, "admissions", emailId),
      (snap) => {
        if (isMounted && snap.exists()) {
          setLiveStudent({
            id: snap.id,
            ...snap.data()
          });
        }
      }
    );

    const unsubPay = onSnapshot(
      query(
        collection(db, "admissions", emailId, "payments"),
        orderBy("date", "desc")
      ),
      (snap) => {
        if (!isMounted) return;
        setPayments(
          snap.docs.map(d => ({
            id: d.id,
            ...d.data()
          }))
        );
        setIsSyncing(false);
      },
      () => {
        if (isMounted) {
          setPayments([]);
          setIsSyncing(false);
        }
      }
    );

    return () => {
      isMounted = false;
      unsubStudent();
      unsubPay();
    };
  }, [searchEmail]);

  const handleSearch = (admissions) => {
    setError(""); 
    setLiveStudent(null); 
    setSearchEmail(null);
    
    if (!regNo.trim()) {
      setError("Please enter Registration Number");
      return;
    }
    
    if (!captchaVerified) {
      setError("Please match the Complex Captcha text");
      return;
    }

    const match = admissions.find(s => s.regNo?.toUpperCase() === regNo.trim().toUpperCase());
    if (match) {
      setSearchEmail(match.email || match.id);
    } else {
      setError("No Record Found!");
    }
  };

  if (liveStudent) {
    if (isSyncing) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.syncText}>Verifying Records...</Text>
        </View>
      );
    }

    const summary = getFeeLogic ? getFeeLogic(liveStudent.course, payments) : { balance: 0 };
    const actualBalance = Number(summary.balance || 0);

    if (actualBalance > 0 && liveStudent.status?.toLowerCase() !== "done") {
      return (
        <View style={styles.alertScreen}>
          <View style={styles.alertCard}>
            <View style={styles.alertIconWrapDanger}>
              <MaterialIcons name="warning" size={32} color={COLORS.red} />
            </View>
            <Text style={styles.alertTitle}>FEE DUES PENDING</Text>
            <Text style={styles.alertSub}>Access for <Text style={{ fontWeight: "900", color: COLORS.textDark }}>{liveStudent.name}</Text> is locked due to outstanding balance.</Text>
            
            <View style={styles.dueBadgeBox}>
              <Text style={styles.dueBadgeLabel}>PENDING AMOUNT</Text>
              <Text style={styles.dueBadgeVal}>₹{actualBalance}</Text>
            </View>

            <TouchableOpacity 
              style={styles.backActionBtn} 
              onPress={() => { setLiveStudent(null); setSearchEmail(null); }}
              activeOpacity={0.8}
            >
              <Text style={styles.backActionBtnText}>← Back to Search</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (liveStudent.status?.toLowerCase() !== "done") {
      return (
        <View style={styles.alertScreen}>
          <View style={styles.alertCard}>
            <View style={styles.alertIconWrapWarning}>
              <MaterialIcons name="history" size={32} color={COLORS.warning} />
            </View>
            <Text style={styles.alertTitle}>VERIFICATION PENDING</Text>
            <Text style={styles.alertSub}>Final certification for <Text style={{ fontWeight: "900", color: COLORS.textDark }}>{liveStudent.name}</Text> is under administrative review.</Text>
            
            <TouchableOpacity 
              style={styles.backActionBtnOutline} 
              onPress={() => { setLiveStudent(null); setSearchEmail(null); }}
              activeOpacity={0.8}
            >
              <Text style={styles.backActionBtnOutlineText}>← Back to Search</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={{ flex: 1, backgroundColor: COLORS.white }}>
        <View style={styles.verifiedTopBar}>
          <TouchableOpacity 
            style={styles.verifiedBackBtn} 
            onPress={() => { setLiveStudent(null); setSearchEmail(null); }}
            activeOpacity={0.8}
          >
            <Text style={styles.verifiedBackText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.statusSuccessChip}>
            <MaterialIcons name="verified" size={14} color={COLORS.green} style={{ marginRight: 4 }} />
            <Text style={styles.statusSuccessText}>Status: Verified Official</Text>
          </View>
        </View>
        <StudentCertificate student={liveStudent} navigation={navigation} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1 }}
    >
      <AdmissionProvider>
        {({ admissions }) => (
          <ScrollView contentContainerStyle={styles.mainScroll} showsVerticalScrollIndicator={false}>
            {/* Diffused soft gradient glow orbs in the background */}
            <View style={styles.bgGlowOrbTopLeft} />
            <View style={styles.bgGlowOrbBottomRight} />
            <View style={styles.bgGlowOrbCenter} />

            {/* Glassmorphism Wide Card */}
            <View style={styles.searchCard}>
              <View style={styles.cardTopBarGradient} />
              
              <View style={styles.cardBody}>
                <View style={styles.headerIconContainer}>
                  <MaterialIcons name="security" size={36} color={COLORS.primary} />
                </View>
                <Text style={styles.title}>Certificate Verification</Text>
                
                <TextInput 
                  style={styles.regInput} 
                  placeholder="ENTER REGISTRATION NO" 
                  placeholderTextColor="#94A3B8"
                  value={regNo} 
                  onChangeText={(val) => setRegNo(val.trim().toUpperCase())} 
                  autoCapitalize="characters"
                />

                <NativeCaptcha onVerify={setCaptchaVerified} />

                <TouchableOpacity 
                  style={[styles.verifyBtn, !captchaVerified && { opacity: 0.5 }]} 
                  onPress={() => handleSearch(admissions)}
                  disabled={!captchaVerified}
                  activeOpacity={0.8}
                >
                  <Text style={styles.verifyBtnText}>VERIFY NOW</Text>
                </TouchableOpacity>

                {error ? (
                  <View style={styles.errorAlert}>
                    <MaterialIcons name="error-outline" size={16} color={COLORS.red} style={{ marginRight: 6 }} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </ScrollView>
        )}
      </AdmissionProvider>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainScroll: { 
    flexGrow: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 6, 
    backgroundColor: COLORS.background,
    position: "relative",
    overflow: "hidden"
  },
  // Extra blurred, diffused glowing background orbs
  bgGlowOrbTopLeft: {
    position: "absolute",
    top: -100,
    left: -80,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: "#38BDF8",
    opacity: 0.45,
    transform: [{ scale: 1.6 }]
  },
  bgGlowOrbBottomRight: {
    position: "absolute",
    bottom: -90,
    right: -80,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: "#34D399",
    opacity: 0.38,
  },
  bgGlowOrbCenter: {
    position: "absolute",
    top: "35%",
    left: "15%",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#C084FC",
    opacity: 0.28,
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: COLORS.background 
  },
  syncText: { 
    marginTop: 10, 
    fontSize: 12, 
    fontWeight: "800", 
    color: COLORS.textMuted 
  },
  
  // Glassmorphism Wide Card with bright clean white border
  searchCard: { 
    width: "100%", 
    maxWidth: 580, // Increased width here
    backgroundColor: COLORS.cardBg, 
    borderRadius: 30, 
    overflow: "hidden", 
    borderWidth: 3.5, 
    borderColor: '#FFFFFF', 
    elevation: 15,
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    zIndex: 2,
  },
  cardTopBarGradient: { 
    height: 6, 
    backgroundColor: COLORS.primary 
  },
  cardBody: { 
    padding: 30, 
    alignItems: "center" 
  },
  headerIconContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(224, 242, 254, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  title: { 
    fontSize: 20, 
    fontWeight: "900", 
    color: COLORS.textDark, 
    marginBottom: 22, 
    textAlign: "center",
    letterSpacing: 0.5
  },
  regInput: { 
    width: "100%", 
    backgroundColor: "rgba(255, 255, 255, 0.9)", 
    borderWidth: 1.5, 
    borderColor: '#E2E8F0', 
    borderRadius: 14, 
    height: 52, 
    textAlign: "center", 
    fontSize: 13, 
    fontWeight: "900", 
    color: COLORS.textDark, 
    marginBottom: 16,
    letterSpacing: 1.5
  },

  // Complex Textured Captcha Styles
  captchaBox: { 
    width: "100%", 
    backgroundColor: "rgba(248, 250, 252, 0.85)", 
    borderRadius: 14, 
    padding: 12, 
    borderWidth: 1.5, 
    borderColor: '#E2E8F0', 
    marginBottom: 16 
  },
  captchaHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: 10 
  },
  captchaVisualContainer: { 
    backgroundColor: "#FFFFFF", 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    flex: 1,
    height: 54,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative"
  },
  matrixGridOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.18,
    zIndex: 1
  },
  matrixGridText: {
    fontSize: 11,
    color: "#64748B",
    letterSpacing: 4,
    textAlign: "center"
  },
  noiseDot: {
    position: "absolute",
    borderRadius: 50,
    zIndex: 2,
    opacity: 0.65
  },
  noiseLine: {
    position: "absolute",
    height: 1.5,
    zIndex: 2,
    opacity: 0.45
  },
  captchaCharsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  captchaCharItem: {
    fontWeight: "900",
    marginHorizontal: 4,
    fontStyle: "italic",
    textShadowColor: 'rgba(14, 165, 233, 0.25)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 3
  },
  refreshCaptchaBtn: { 
    width: 44, 
    height: 54, 
    borderRadius: 10, 
    backgroundColor: "#FFFFFF", 
    justifyContent: "center", 
    alignItems: "center", 
    borderWidth: 1, 
    borderColor: '#E2E8F0' 
  },
  captchaInput: { 
    width: "100%", 
    backgroundColor: "#FFFFFF", 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    borderRadius: 10, 
    height: 44, 
    paddingHorizontal: 12, 
    fontSize: 13, 
    fontWeight: "700", 
    color: COLORS.textDark,
    textAlign: "center",
    letterSpacing: 1
  },

  verifyBtn: { 
    width: "100%", 
    height: 50, 
    backgroundColor: COLORS.primary, 
    borderRadius: 14, 
    justifyContent: "center", 
    alignItems: "center", 
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  verifyBtnText: { 
    color: COLORS.white, 
    fontSize: 12, 
    fontWeight: "900", 
    letterSpacing: 1 
  },

  errorAlert: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginTop: 14, 
    backgroundColor: COLORS.redLight, 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 10,
    width: "100%",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: '#FCA5A5'
  },
  errorText: { 
    color: COLORS.red, 
    fontSize: 11, 
    fontWeight: "800" 
  },

  // Alert Screen Styles
  alertScreen: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 20, 
    backgroundColor: COLORS.background 
  },
  alertCard: { 
    width: "100%", 
    maxWidth: 380, 
    backgroundColor: COLORS.cardBg, 
    borderRadius: 24, 
    padding: 24, 
    alignItems: "center", 
    borderWidth: 2, 
    borderColor: '#FFFFFF', 
    elevation: 5 
  },
  alertIconWrapDanger: { 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    backgroundColor: COLORS.redLight, 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5'
  },
  alertIconWrapWarning: { 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    backgroundColor: COLORS.warningLight, 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE68A'
  },
  alertTitle: { 
    fontSize: 18, 
    fontWeight: "900", 
    color: COLORS.textDark, 
    marginBottom: 6, 
    textAlign: "center" 
  },
  alertSub: { 
    fontSize: 12, 
    color: COLORS.textMuted, 
    textAlign: "center", 
    marginBottom: 20, 
    lineHeight: 18, 
    fontWeight: "600" 
  },
  dueBadgeBox: { 
    width: "100%", 
    backgroundColor: COLORS.red, 
    borderRadius: 16, 
    paddingVertical: 14, 
    alignItems: "center", 
    marginBottom: 20,
    elevation: 2
  },
  dueBadgeLabel: { 
    fontSize: 10, 
    fontWeight: "800", 
    color: "rgba(255,255,255,0.8)", 
    letterSpacing: 0.5,
    marginBottom: 2
  },
  dueBadgeVal: { 
    fontSize: 22, 
    fontWeight: "900", 
    color: COLORS.white 
  },
  backActionBtn: { 
    width: "100%", 
    height: 46, 
    backgroundColor: COLORS.textDark, 
    borderRadius: 14, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  backActionBtnText: { 
    color: COLORS.white, 
    fontSize: 12, 
    fontWeight: "900" 
  },
  backActionBtnOutline: { 
    width: "100%", 
    height: 46, 
    backgroundColor: COLORS.white, 
    borderWidth: 1.5, 
    borderColor: '#E2E8F0', 
    borderRadius: 14, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  backActionBtnOutlineText: { 
    color: COLORS.textDark, 
    fontSize: 12, 
    fontWeight: "900" 
  },

  // Verified Header View
  verifiedTopBar: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    backgroundColor: COLORS.white, 
    borderBottomWidth: 1, 
    borderBottomColor: '#E2E8F0' 
  },
  verifiedBackBtn: { 
    backgroundColor: COLORS.textDark, 
    paddingHorizontal: 14, 
    paddingVertical: 7, 
    borderRadius: 12 
  },
  verifiedBackText: { 
    color: COLORS.white, 
    fontSize: 11, 
    fontWeight: "800" 
  },
  statusSuccessChip: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: COLORS.greenLight, 
    borderWidth: 1, 
    borderColor: '#D1F5E0', 
    paddingHorizontal: 12, 
    paddingVertical: 5, 
    borderRadius: 12 
  },
  statusSuccessText: { 
    fontSize: 11, 
    fontWeight: "800", 
    color: COLORS.green 
  },
});