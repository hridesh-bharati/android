// src/dashboard/student/Certificate/StudentCertificate.jsx
import React, { useState, useEffect, useCallback, useContext } from "react";
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, Platform } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { AuthContext } from "../../../context/AuthContext";
import { getCourseDetails } from "./courseData";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const formatDate = (dateString) => {
    if (!dateString) return "19 JUNE 2025";
    try {
        let date;
        if (typeof dateString === "string" && dateString.includes("/")) {
            const [day, month, year] = dateString.split("/");
            date = new Date(`${year}-${month}-${day}`);
        } else {
            date = new Date(dateString);
        }
        if (isNaN(date.getTime())) return dateString;
        const day = date.getDate().toString().padStart(2, "0");
        const monthNames = [
            "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
            "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
        ];
        return `${day} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    } catch {
        return dateString;
    }
};

const getGradeFromPercentage = (percentage) => {
    if (!percentage && percentage !== 0) return "Excellent";
    const percNum = parseFloat(percentage);
    if (isNaN(percNum)) return "Excellent";
    if (percNum >= 81) return "Excellent";
    else if (percNum >= 71) return "Very Good";
    else if (percNum >= 51) return "Good";
    else if (percNum >= 50) return "Satisfactory";
    else return "Needs Improvement";
};

export default function StudentCertificate({ route, navigation, student: propStudent }) {
    const urlEmail = route?.params?.email;
    
    const authContext = useContext(AuthContext);
    const user = authContext?.user;
    const role = authContext?.role;
    const isAdmin = role === 'admin' || user?.email?.toLowerCase() === 'hridesh027@gmail.com';

    const [student, setStudent] = useState(propStudent || null);
    const [loading, setLoading] = useState(!propStudent);
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        if (propStudent) {
            setStudent(propStudent);
            setLoading(false);
            return;
        }

        if (!urlEmail) {
            setLoading(false);
            setError("STUDENT_NOT_FOUND");
            return;
        }

        const emailId = urlEmail.toLowerCase().trim();
        const docRef = doc(db, "admissions", emailId);

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setStudent({ id: docSnap.id, ...docSnap.data() });
                setError(null);
            } else {
                setError("STUDENT_NOT_FOUND");
            }
            setLoading(false);
        }, (err) => {
            console.error(err);
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [urlEmail, propStudent]);

    const downloadPDF = useCallback(async () => {
        if (!student || downloading) return;
        setDownloading(true);

        try {
            const courseDetails = getCourseDetails(student.course);
            const grade = getGradeFromPercentage(student.percentage);
            const studentPhoto = student.photoUrl || 'https://placehold.co/100';

            const htmlContent = `
                <html>
                    <head>
                        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Rubik:wght@500;700;900&display=swap" rel="stylesheet">
                        <style>
                            @page { 
                                size: A4 landscape !important; 
                                margin: 0 !important; 
                            }
                            * {
                                margin: 0;
                                padding: 0;
                                box-sizing: border-box;
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                            }
                            html, body { 
                                width: 294.64mm;
                                height: 209.211mm;
                                font-family: 'Poppins', Arial, sans-serif; 
                                text-align: center; 
                                background: #ffffff;
                            }
                            #watermark {
                                width: 294.64mm;
                                height: 209.211mm;
                                border: 13px solid rgb(11, 1, 56);
                                padding: 15px;
                                position: relative;
                                background: #ffffff;
                                display: flex;
                                flex-direction: column;
                                justify-content: space-between;
                                overflow: hidden;
                            }
                            #watermark::before {
                                content: "";
                                position: absolute;
                                top: 0; right: 0; bottom: 0; left: 0;
                                background: url("https://drishteeindia.com/images/vender/logos.png") no-repeat center center;
                                background-size: 70% 70%;
                                opacity: 0.3;
                                z-index: 0;
                                pointer-events: none;
                            }
                            #watermark > * { position: relative; z-index: 1; }

                            .certificate-header-grid {
                                display: flex;
                                justify-content: space-between;
                                align-items: flex-start;
                                height: 95px;
                                padding: 4px;
                            }
                            .header-logo-img {
                                width: 95px;
                                height: 95px;
                                object-fit: contain;
                            }
                            .certificate-main-title {
                                font-family: 'Rubik', sans-serif;
                                font-weight: 750;
                                font-size: 65px;
                                color: rgb(11, 1, 56);
                                margin: 0;
                                letter-spacing: 3px;
                                text-transform: uppercase;
                                line-height: 0.9;
                            }
                            .certificate-sub-title {
                                color: maroon;
                                font-family: 'Poppins', sans-serif;
                                letter-spacing: 1.1px;
                                font-size: 13px;
                                font-weight: 500;
                                text-align: left;
                            }
                            .certificate-photo-container {
                                width: 90px;
                                height: 90px;
                                background: #fff;
                                border-radius: 2px;
                                overflow: hidden;
                                border: 1px solid #ddd;
                            }
                            .certificate-photo {
                                width: 100%;
                                height: 100%;
                                object-fit: cover;
                            }
                            .cert-right {
                                font-size: 13px;
                                color: #111;
                                text-align: right;
                                font-weight: bold;
                            }
                            .certificate-title {
                                font-family: 'Arial Black', Arial, sans-serif;
                                font-size: 38px;
                                font-weight: 500;
                                letter-spacing: 1.5px;
                                color: #fff;
                                background: rgb(11, 1, 56);
                                margin: 5px 0;
                                text-transform: uppercase;
                                text-align: center;
                                height: 55px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                line-height: 1;
                            }
                            .certificate-body-grid {
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                width: 100%;
                                padding: 0 10px;
                                margin: 4px 0;
                            }
                            .certificate-body-text {
                                font-size: 24px;
                                font-family: 'Poppins', sans-serif;
                                font-weight: 500;
                            }
                            .certificate-name {
                                font-family: 'Arial Black', Arial, sans-serif;
                                font-weight: bold;
                                color: #be0027;
                                text-decoration: underline;
                                text-underline-offset: 4px;
                                text-transform: uppercase;
                                font-size: 22px;
                                margin-left: 6px;
                            }
                            .certificate-course-title {
                                font-family: 'Arial Black', Arial, sans-serif;
                                font-weight: bold;
                                color: #be0027;
                                text-decoration: underline;
                                text-underline-offset: 4px;
                                font-size: 22px;
                                letter-spacing: 0.8px;
                                margin: 4px 0;
                                text-transform: uppercase;
                            }
                            .certificate-grade-highlight {
                                color: #be0027;
                                font-size: 22px;
                                font-weight: 700;
                                text-decoration: underline;
                            }
                            .modules-container {
                                width: 93%;
                                margin: 4px auto;
                                display: flex;
                                align-items: flex-start;
                                text-align: left;
                            }
                            .certificate-modules-title {
                                font-size: 20px;
                                font-weight: bold;
                                color: rgb(27, 2, 68);
                                width: 180px;
                            }
                            .modules-grid {
                                flex: 1;
                                display: grid;
                                grid-template-columns: repeat(4, 1fr);
                                gap: 2px 10px;
                            }
                            .certificate-module-item {
                                font-size: 15px;
                                font-family: 'Poppins', sans-serif;
                                color: #00062B;
                                font-weight: bold;
                                white-space: nowrap;
                            }
                            .certificateFooter {
                                width: 92%;
                                margin-top: 10px;
                            }
                            .dbluetext { color: rgb(27, 2, 68); }
                            .redText { color: #be0027; }
                            .blueColor { color: rgb(11, 1, 56); }
                            .arial { font-family: 'Arial Black', Arial, sans-serif; }
                            .certificate-footer-text { font-size: 17px; }
                            .certificate-footer-reg { font-size: 18px; }
                            .certificate-institute-title { font-size: 20px; }
                        </style>
                    </head>
                    <body>
                        <div id="watermark">
                            <div class="certificate-header-grid">
                                <div style="text-align: left;">
                                    <img src="https://drishteeindia.com/images/icon/logo.png" class="header-logo-img" />
                                </div>
                                <div style="display: flex; align-items: flex-start; margin-left: 20px;">
                                    <div style="padding-left: 10px;">
                                        <h1 class="certificate-main-title">DRISHTEE</h1>
                                        <p class="certificate-sub-title fw-bold">An ISO 9001:2008 Certified Institute</p>
                                    </div>
                                    <div class="certificate-photo-container" style="margin-left: 25px;">
                                        <img src="${studentPhoto}" class="certificate-photo" crossorigin="anonymous" />
                                    </div>
                                </div>
                                <div class="cert-right fw-bold" style="text-align: right;">
                                    <p style="margin: 0;">Reg under The Indian trust act 1882</p>
                                    <p style="margin: 2px 0;">Reg No - 14/2025</p>
                                    <p style="margin: 0;">Darpan ID : UP/20250878051</p>
                                </div>
                            </div>

                            <div class="certificate-title arial">Certificate of Course Completion</div>

                            <div class="certificate-body-grid text-center text-black">
                                <p style="margin: 4px 0;">
                                    <span class="certificate-body-text">This certificate is awarded to Mr/Miss </span>
                                    <span class="certificate-name">${student.name} ${student.gender === "Female" ? "D/O" : "S/O"} ${student.fatherName || ''}</span>
                                </p>
                                <p style="margin: 4px 0;"><span class="certificate-body-text">On the successfully completion of a <b>${courseDetails.durationMonths}</b> (${courseDetails.hours}) course, titled</span></p>
                                <h4 class="certificate-course-title">${courseDetails.fullName}</h4>
                                <p style="margin: 4px 0;"><span class="certificate-body-text">with grade & Percentage </span><span class="certificate-grade-highlight"><u>{grade} & ${student.percentage || '85'}%</u></span></p>
                                <p class="certificate-body-text" style="font-size: 20px; margin-top: 2px;">Examination conducted on at all-india basis at <b>Maharajganj / U.P.</b></p>
                            </div>

                            <div class="modules-container">
                                <div class="certificate-modules-title">Modules Covered:</div>
                                <div class="modules-grid">
                                    ${courseDetails.modules.map((m, idx) => `<span class="certificate-module-item"><b>${idx + 1}.</b> ${m}</span>`).join('')}
                                </div>
                            </div>

                            <div class="certificateFooter">
                                <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                                    <div style="text-align: left; width: 50%;">
                                        <img src="https://drishteeindia.com/images/vender/signature.png" alt="Sign" style="width: 150px; height: 50px; object-fit: contain;" crossorigin="anonymous" />
                                        <h6 class="dbluetext fw-bold certificate-footer-text" style="margin: 0;">Chief Exam Controller</h6>
                                    </div>
                                    <div style="text-align: left; width: 50%; font-weight: bolder;">
                                        <p class="certificate-footer-text" style="margin: 0;">Date of Issue : <span class="dbluetext">${formatDate(student.issueDate)}</span></p>
                                    </div>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-top: 8px; font-weight: bold; font-size: 18px; padding: 4px 20px; border-top: 1.5px solid darkblue; border-bottom: 1.5px solid darkblue;">
                                    <div><span class="dbluetext">Student Reg No. :</span> <span style="text-transform: uppercase;">${student.regNo || 'DIIT124/DCA/1390'}</span></div>
                                    <div><span class="dbluetext">Center Code :</span> <span>${student.branch || 'DIIT124'}</span></div>
                                </div>
                                <div style="text-align: center;">
                                    <p class="certificate-footer-text grade border bg-danger-subtle" style="margin: 4px 0; padding: 2px; background-color: #fee2e2; color: #7f1d1d; border: 1px solid #fecaca;">Grade Mark : Excellent (81% - 100%), Very Good (71% - 80%), Good(51% - 70%), Satisfactory (50% - 60%)</p>
                                </div>
                                <div style="text-align: center; margin-top: 4px;">
                                    <h6 class="fw-bold certificate-institute-title arial" style="margin: 0; color: #0f172a;">DRISHTEE INSTITUTE OF INFORMATION TECHNOLOGY</h6>
                                    <p class="certificate-footer-text arial redText" style="margin: 0;">(An unit of Drishtee Educational & welfare Trust)</p>
                                    <p class="certificate-footer-text arial blueColor" style="display: flex; justify-content: space-between; margin: 0; padding: 0 10px;">
                                        <span>Reg Office: Harredeeh, ward No.5, Nichalul, Distt-Maharajganj (273304)</span>
                                        <span>https://www.drishteeindia.com</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </body>
                </html>
            `;

            if (Platform.OS === 'web') {
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                    printWindow.document.write(htmlContent);
                    printWindow.document.close();
                    printWindow.focus();
                    setTimeout(() => {
                        printWindow.print();
                        printWindow.close();
                    }, 500);
                }
            } else {
                const result = await Print.printToFileAsync({
                    html: htmlContent,
                    width: 1122,
                    height: 792,
                });

                if (result && result.uri) {
                    await Sharing.shareAsync(result.uri, {
                        mimeType: 'application/pdf',
                        dialogTitle: 'Download Certificate',
                        UTI: 'com.adobe.pdf'
                    });
                }
            }

        } catch (err) {
            console.error('Download error:', err);
            Alert.alert("Error", "Failed to generate PDF certificate. Please try again.");
        } finally {
            setDownloading(false);
        }
    }, [student, downloading]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0284c7" />
                <Text style={styles.loadingText}>Loading certificate...</Text>
            </View>
        );
    }

    if (student?.certificateDisabled && !isAdmin) {
        return (
            <View style={styles.center}>
                <MaterialIcons name="lock" size={60} color="#ef4444" style={{ marginBottom: 12 }} />
                <Text style={styles.lockTitle}>Portal Access Locked</Text>
                <Text style={styles.lockSub}>Your certificate portal access is restricted by administration.</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (error === "STUDENT_NOT_FOUND" || !student) {
        return (
            <View style={styles.center}>
                <Text style={styles.notFoundText}>Record Not Found</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack()}>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const courseDetails = getCourseDetails(student.course);
    const grade = getGradeFromPercentage(student.percentage);

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 10, paddingBottom: 30 }}>
            <View style={styles.topBar}>
                <TouchableOpacity 
                    style={[styles.downloadBtn, downloading && styles.downloadBtnDisabled]} 
                    onPress={downloadPDF} 
                    activeOpacity={0.8}
                    disabled={downloading}
                >
                    {downloading ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                        <>
                            <MaterialIcons name="download" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                            <Text style={styles.downloadBtnText}>Download/Print PDF</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* A4 LANDSCAPE PREVIEW INSIDE HORIZONTAL & VERTICAL SCROLL VIEW */}
            <ScrollView horizontal={true} bounces={false} showsHorizontalScrollIndicator={true} style={styles.horizontalScroll}>
                <ScrollView vertical={true} bounces={false} showsVerticalScrollIndicator={true}>
                    <View style={styles.certificateCard}>
                        <View style={styles.watermarkBgContainer}>
                            <Image source={require('../../../../assets/watermark.png')} style={styles.watermarkLogo} resizeMode="contain" />
                        </View>

                        <View style={styles.cardContent}>
                            <View style={styles.headerGrid}>
                                <View style={styles.logoCol}>
                                    <Image source={require('../../../../assets/logo.png')} style={styles.logoImg} resizeMode="contain" />
                                </View>
                                <View style={styles.titleCol}>
                                    <Text style={styles.brandTitle} numberOfLines={1}>DRISHTEE</Text>
                                    <Text style={styles.isoText}>An ISO 9001:2008 Certified Institute</Text>
                                </View>
                                <View style={styles.picCol}>
                                    <View style={styles.photoContainer}>
                                        <Image 
                                            source={{ uri: student.photoUrl || "https://placehold.co/100" }} 
                                            style={styles.studentPhoto} 
                                            resizeMode="cover"
                                        />
                                    </View>
                                </View>
                                <View style={styles.infoCol}>
                                    <Text style={styles.regInfoText}>Reg under The Indian trust act 1882</Text>
                                    <Text style={styles.regInfoText}>Reg No - 14/2025</Text>
                                    <Text style={styles.regInfoText}>Darpan ID : UP/20250878051</Text>
                                </View>
                            </View>

                            <View style={styles.bannerBadge}>
                                <Text style={styles.bannerText}>CERTIFICATE OF COURSE COMPLETION</Text>
                            </View>

                            <View style={styles.certBody}>
                                <Text style={styles.bodyText}>
                                    This certificate is awarded to Mr/Miss <Text style={styles.studentNameText}>{student.name} {student.gender === "Female" ? "D/O" : "S/O"} {student.fatherName || ""}</Text>
                                </Text>
                                <Text style={styles.bodyText}>
                                    On the successfully completion of a <Text style={{ fontWeight: 'bold' }}>{courseDetails.durationMonths}</Text> ({courseDetails.hours}) course, titled
                                </Text>
                                <Text style={styles.courseNameText}>{courseDetails.fullName}</Text>
                                <Text style={styles.bodyText}>
                                    with grade & Percentage <Text style={styles.highlightText}><u>{grade} & {student.percentage || "85"}%</u></Text>
                                </Text>
                                <Text style={styles.locationText}>Examination conducted on at all-india basis at <Text style={{ fontWeight: 'bold' }}>Maharajganj / U.P.</Text></Text>
                            </View>

                            <View style={styles.modulesBox}>
                                <View style={styles.modulesRow}>
                                    <Text style={styles.modulesTitle}>Modules Covered:</Text>
                                    <View style={styles.modulesGrid}>
                                        {courseDetails.modules.map((m, index) => (
                                            <Text key={index} style={styles.moduleItem} numberOfLines={1}>
                                                <Text style={{ fontWeight: 'bold' }}>{index + 1}.</Text> {m}
                                            </Text>
                                        ))}
                                    </View>
                                </View>
                            </View>

                            <View style={styles.certFooterTop}>
                                <View style={styles.signatureBox}>
                                    <Image source={require('../../../../assets/signature.png')} style={styles.signImg} resizeMode="contain" />
                                    <Text style={styles.controllerText}>Chief Exam Controller</Text>
                                </View>
                                <View style={styles.issueDateBox}>
                                    <Text style={styles.issueDateText}>Date of Issue : <Text style={{ color: 'rgb(27, 2, 68)' }}>{formatDate(student.issueDate)}</Text></Text>
                                </View>
                            </View>

                            <View style={styles.regBar}>
                                <Text style={styles.regBarText}>Student Reg No. : <Text style={{ textTransform: 'uppercase' }}>{student.regNo || "DIIT124/DCA/1390"}</Text></Text>
                                <Text style={styles.regBarText}>Center Code : <Text>{student.branch || "DIIT124"}</Text></Text>
                            </View>

                            <View style={styles.gradeMarkBanner}>
                                <Text style={styles.gradeMarkText}>Grade Mark : Excellent (81% - 100%), Very Good (71% - 80%), Good(51% - 70%), Satisfactory (50% - 60%)</Text>
                            </View>

                            <View style={styles.instituteDetails}>
                                <Text style={styles.instituteName}>DRISHTEE INSTITUTE OF INFORMATION TECHNOLOGY</Text>
                                <Text style={styles.instituteTrust}>(An unit of Drishtee Educational & welfare Trust)</Text>
                                <View style={styles.instituteAddressRow}>
                                    <Text style={styles.addressText}>Reg Office: Harredeeh, ward No.5, Nichalul, Distt-Maharajganj (273304)</Text>
                                    <Text style={styles.addressText}>https://www.drishteeindia.com</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </ScrollView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8fafc" },
    center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#f8fafc" },
    loadingText: { marginTop: 8, fontSize: 12, fontWeight: "600", color: "#64748b" },
    notFoundText: { fontSize: 16, fontWeight: "800", color: "#0f172a", marginBottom: 12 },
    
    topBar: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", marginBottom: 10 },
    downloadBtn: { 
        flexDirection: "row", 
        alignItems: "center", 
        backgroundColor: "rgb(11, 1, 56)", 
        paddingHorizontal: 16, 
        paddingVertical: 10,
        minWidth: 160,
        justifyContent: "center",
        borderRadius: 4,
    },
    downloadBtnDisabled: { opacity: 0.6 },
    downloadBtnText: { fontSize: 12, fontWeight: "900", color: "#ffffff", letterSpacing: 0.3 },

    lockTitle: { fontSize: 18, fontWeight: "900", color: "#0f172a", marginBottom: 4 },
    lockSub: { fontSize: 12, color: "#64748b", textAlign: "center", marginBottom: 20 },
    backButton: { backgroundColor: "rgb(11, 1, 56)", paddingHorizontal: 20, paddingVertical: 10 },
    backButtonText: { color: "#ffffff", fontWeight: "800", fontSize: 12 },

    horizontalScroll: { width: '100%' },

    // EXACT A4 LANDSCAPE DIMENSIONS FOR UI PREVIEW (Scrollable)
    certificateCard: {
        width: 1122,
        height: 794,
        backgroundColor: "#ffffff",
        paddingHorizontal: 24,
        paddingVertical: 18,
        borderWidth: 13,
        borderColor: "rgb(11, 1, 56)",
        position: "relative",
        overflow: "hidden",
    },
    watermarkBgContainer: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center', alignItems: 'center',
        opacity: 0.3,
        zIndex: 0,
    },
    watermarkLogo: { width: 550, height: 550 },
    cardContent: { position: "relative", zIndex: 1, height: '100%', justifyContent: 'space-between' },

    headerGrid: { 
        flexDirection: "row", 
        justifyContent: "space-between", 
        alignItems: "flex-start", 
        height: 95,
        padding: 4,
    },
    logoCol: { width: "10%", justifyContent: "center", alignItems: "flex-start" },
    logoImg: { width: 95, height: 95 },
    titleCol: { width: "40%", alignItems: "center", paddingHorizontal: 5 },
    brandTitle: { 
        fontSize: 65, 
        fontWeight: "750", 
        color: "rgb(11, 1, 56)", 
        letterSpacing: 3, 
        fontFamily: Platform.OS === 'ios' ? 'Impact' : 'sans-serif-black'
    },
    brandSub: { fontSize: 13, fontWeight: "500", color: "maroon", marginTop: 2, textTransform: "uppercase", letterSpacing: 1.1 },
    picCol: { width: "20%", alignItems: "center", justifyContent: "center" },
    photoContainer: { width: 90, height: 90, borderWidth: 1, borderColor: "#ddd", backgroundColor: "#fff", borderRadius: 2 },
    studentPhoto: { width: "100%", height: "100%" },
    infoCol: { width: "30%", alignItems: "flex-end", justifyContent: "center" },
    regInfoText: { fontSize: 13, fontWeight: "700", color: "#111", lineHeight: 18, textAlign: "right" },

    bannerBadge: { 
        backgroundColor: "rgb(11, 1, 56)", 
        paddingVertical: 8, 
        marginVertical: 6,
        alignItems: "center",
        justifyContent: "center",
        height: 55,
        marginHorizontal: -24,
    },
    bannerText: { fontSize: 38, fontWeight: "500", color: "#ffffff", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: Platform.OS === 'ios' ? 'Impact' : 'sans-serif-black' },
    
    certBody: { alignItems: "center", marginVertical: 6 },
    bodyText: { fontSize: 24, color: "#111", fontWeight: "500", textAlign: "center", marginVertical: 4 },
    studentNameText: { fontSize: 22, fontWeight: "700", color: "#be0027", textDecorationLine: "underline", textTransform: "uppercase", fontFamily: Platform.OS === 'ios' ? 'Impact' : 'sans-serif-black' },
    courseNameText: { fontSize: 22, fontWeight: "700", color: "#be0027", textDecorationLine: "underline", marginVertical: 4, fontFamily: Platform.OS === 'ios' ? 'Impact' : 'sans-serif-black' },
    highlightText: { color: "#be0027", fontWeight: "700", fontSize: 22 },
    locationText: { fontSize: 20, color: "#111", marginTop: 2, textAlign: "center", fontWeight: "500" },

    modulesBox: { backgroundColor: "transparent", padding: 4, marginVertical: 4, width: '93%', alignSelf: 'center' },
    modulesRow: { flexDirection: "row", alignItems: "flex-start" },
    modulesTitle: { width: "180px", fontSize: 20, fontWeight: "700", color: "rgb(11, 1, 56)" },
    modulesGrid: { flex: 1, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
    moduleItem: { width: "25%", fontSize: 15, color: "#00062B", fontWeight: "700", marginBottom: 2 },

    certFooterTop: { 
        flexDirection: "row", 
        justifyContent: "space-between", 
        alignItems: "flex-end", 
        marginTop: 10,
        width: '92%',
        alignSelf: 'center',
    },
    signatureBox: { alignItems: "flex-start", width: '50%' },
    signImg: { width: 150, height: 50 },
    controllerText: { fontSize: 17, fontWeight: "700", color: "rgb(11, 1, 56)", marginTop: 2 },
    issueDateBox: { alignItems: "flex-start", width: '50%' },
    issueDateText: { fontSize: 17, fontWeight: "700", color: "#111" },

    regBar: { 
        flexDirection: "row", 
        justifyContent: "space-between", 
        borderTopWidth: 1.5, 
        borderBottomWidth: 1.5, 
        borderColor: "darkblue", 
        paddingVertical: 4, 
        paddingHorizontal: 20, 
        marginTop: 8, 
        width: '92%',
        alignSelf: 'center',
    },
    regBarText: { fontSize: 18, fontWeight: "700", color: "rgb(11, 1, 56)" },

    gradeMarkBanner: { 
        backgroundColor: "#fee2e2", 
        paddingVertical: 2, 
        paddingHorizontal: 6, 
        borderWidth: 1, 
        borderColor: "#fecaca", 
        marginTop: 4, 
        alignItems: "center", 
        width: '92%',
        alignSelf: 'center',
    },
    gradeMarkText: { fontSize: 17, fontWeight: "500", color: "#7f1d1d", textAlign: "center" },

    instituteDetails: { marginTop: 4, alignItems: "center", width: '92%', alignSelf: 'center' },
    instituteName: { fontSize: 20, fontWeight: "700", color: "#0f172a", textAlign: "center", fontFamily: Platform.OS === 'ios' ? 'Impact' : 'sans-serif-black' },
    instituteTrust: { fontSize: 17, fontWeight: "500", color: "#be0027", textAlign: "center", marginTop: 1, fontFamily: Platform.OS === 'ios' ? 'Impact' : 'sans-serif-black' },
    instituteAddressRow: { flexDirection: "row", width: "100%", marginTop: 2, paddingHorizontal: 2, justifyContent: "space-between" },
    addressText: { fontSize: 17, fontWeight: "500", color: "rgb(11, 1, 56)" },
});