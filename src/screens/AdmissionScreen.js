// src/screens/AdmissionScreen.js
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  Alert,
  Modal,
  Pressable,
  ActivityIndicator,
  Switch,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../constants/theme';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import DateTimePicker from '@react-native-community/datetimepicker';

const BRANCHES = [
  { id: 'DIIT124', name: 'DIIT124 - Main Branch' },
  { id: 'DIIT125', name: 'DIIT125 - East Branch' },
];

const courseNames = [
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

const CATEGORIES = ['GEN', 'OBC', 'SC', 'ST', 'EWS'];
const GENDERS = ['Male', 'Female', 'Other'];

export default function AdmissionScreen() {
  const [formData, setFormData] = useState({
    branch: '',
    course: '',
    admissionDate: new Date().toISOString().split('T')[0],
    fullName: '',
    fatherName: '',
    motherName: '',
    dob: '',
    gender: '',
    aadhar: '',
    category: '',
    qualification: '',
    mobile: '',
    email: '',
    pincode: '',
    village: '',
    postOffice: '',
    policeStation: '',
    district: '',
    state: '',
    address: '',
    agreed: false,
  });

  const [autoAddress, setAutoAddress] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Native Date Picker States
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('admissionDate');
  const [tempDate, setTempDate] = useState(new Date());

  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const updateField = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      
      if (autoAddress && ['village', 'postOffice', 'policeStation', 'district', 'state', 'pincode'].includes(field)) {
        const v = updated.village || '';
        const po = updated.postOffice || '';
        const ps = updated.policeStation || '';
        const dist = updated.district || '';
        const st = updated.state || '';
        const pin = updated.pincode || '';
        updated.address = `Vill: ${v}, PO: ${po}, PS: ${ps}, Dist: ${dist}, State: ${st} - ${pin}`;
      }
      return updated;
    });
  };

  const toggleAutoAddress = (val) => {
    setAutoAddress(val);
    if (val) {
      const { village, postOffice, policeStation, district, state, pincode } = formData;
      const fullAddr = `Vill: ${village}, PO: ${postOffice}, PS: ${policeStation}, Dist: ${district}, State: ${state} - ${pincode}`;
      setFormData(prev => ({ ...prev, address: fullAddr }));
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      if (pickerMode === 'admissionDate') {
        updateField('admissionDate', formattedDate);
      } else {
        updateField('dob', formattedDate);
      }
    }
  };

  const openDateChooser = (mode) => {
    setPickerMode(mode);
    const currentVal = mode === 'admissionDate' ? formData.admissionDate : formData.dob;
    setTempDate(currentVal ? new Date(currentVal) : new Date());
    setShowPicker(true);
  };

  // Cloudinary Upload with Progress Tracking
  const uploadToCloudinaryWithProgress = (filePayload, previewUri) => {
    if (previewUri) {
      setPhotoUri(previewUri);
    }
    
    setImgLoading(true);
    setUploadProgress(0);

    const data = new FormData();

    if (Platform.OS === 'web') {
      data.append('file', filePayload);
    } else {
      const filename = previewUri.split('/').pop() || 'student_photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      data.append('file', {
        uri: previewUri,
        name: filename,
        type: type,
      });
    }

    data.append('upload_preset', 'hridesh99!');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://api.cloudinary.com/v1_1/draowpiml/image/upload', true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      setImgLoading(false);
      if (xhr.status === 200) {
        try {
          const result = JSON.parse(xhr.responseText);
          if (result.secure_url) {
            setPhotoUri(result.secure_url);
          }
        } catch (e) {
          console.error("JSON parse error:", e);
        }
      } else {
        Alert.alert('Upload Failed', 'Could not upload image to cloud.');
      }
    };

    xhr.onerror = () => {
      setImgLoading(false);
      Alert.alert('Error', 'Image upload network failure.');
    };

    xhr.send(data);
  };

  // Web File Upload Handler
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 50 * 1024) {
        Alert.alert('Error', 'File size must be less than 50KB');
        return;
      }
      const localPreviewUrl = URL.createObjectURL(file);
      uploadToCloudinaryWithProgress(file, localPreviewUrl);
    }
  };

  // Unified Picker: Web triggers input file, Native triggers Device Gallery
  const openPicker = async () => {
    if (Platform.OS === 'web') {
      document.getElementById('photo-upload')?.click();
    } else {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'Gallery access permission is required to upload photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];

        if (selectedAsset.fileSize && selectedAsset.fileSize > 50 * 1024) {
          Alert.alert('Error', 'File size must be less than 50KB. Please select a smaller or compressed image.');
          return;
        }

        uploadToCloudinaryWithProgress(null, selectedAsset.uri);
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.email || !formData.mobile || !formData.course || !formData.branch) {
      Alert.alert('Missing Fields', 'Please fill in all mandatory (*) fields.');
      return;
    }
    if (formData.mobile.length !== 10) {
      Alert.alert('Invalid Mobile', 'Mobile number must be exactly 10 digits.');
      return;
    }
    if (!photoUri) {
      Alert.alert('Photo Required', 'Please upload a student passport photograph.');
      return;
    }
    if (!formData.agreed) {
      Alert.alert('Declaration', 'Please accept the declaration checkbox.');
      return;
    }

    setLoading(true);
    const applicationId = 'DCC-' + Math.floor(100000 + Math.random() * 900000);
    const emailKey = formData.email.trim().toLowerCase();

    try {
      const docRef = doc(db, 'admissions', emailKey);
      const existing = await getDoc(docRef);

      if (existing.exists()) {
        setLoading(false);
        Alert.alert('Error', 'An admission record with this email already exists!');
        return;
      }

      const finalRecord = {
        applicationId,
        name: formData.fullName,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        course: formData.course,
        branch: formData.branch,
        admissionDate: formData.admissionDate,
        dob: formData.dob,
        gender: formData.gender,
        aadharNo: formData.aadhar || '',
        category: formData.category,
        qualification: formData.qualification,
        mobile: formData.mobile,
        email: emailKey,
        pincode: formData.pincode,
        village: formData.village,
        post: formData.postOffice,
        thana: formData.policeStation,
        city: formData.district,
        state: formData.state,
        address: formData.address,
        photoUrl: photoUri,
        status: 'pending',
        createdAt: serverTimestamp(),
        appliedDate: new Date().toISOString(),
      };

      await setDoc(docRef, finalRecord);
      setSubmittedData(finalRecord);
      setIsSubmitted(true);
      Alert.alert('Success', 'Admission application submitted successfully!');
    } catch (error) {
      console.error('Admission submit error:', error);
      Alert.alert('Submission Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  // ===================== SUCCESS / RECEIPT VIEW =====================
  if (isSubmitted && submittedData) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={{ padding: 2 }}>
        <View style={styles.receiptBox}>
          <View style={styles.receiptHeader}>
            <Text style={styles.receiptMainTitle}>DRISHTEE COMPUTER CENTER</Text>
            <Text style={styles.receiptSubTitle}>ONLINE ADMISSION SLIP - 2026</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Application ID:</Text>
            <Text style={[styles.receiptValue, { color: COLORS.primary, fontWeight: '800' }]}>{submittedData.applicationId}</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Study Center:</Text>
            <Text style={styles.receiptValue}>{submittedData.branch}</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Enrolled Course:</Text>
            <Text style={[styles.receiptValue, { color: '#ef4444', fontWeight: '800' }]}>{submittedData.course}</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Student Name:</Text>
            <Text style={styles.receiptValue}>{submittedData.name}</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Father's Name:</Text>
            <Text style={styles.receiptValue}>{submittedData.fatherName}</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Mobile Number:</Text>
            <Text style={styles.receiptValue}>{submittedData.mobile}</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Email Address:</Text>
            <Text style={styles.receiptValue}>{submittedData.email}</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Application Status:</Text>
            <Text style={[styles.receiptValue, { color: '#d97706', fontWeight: '800' }]}>PENDING APPROVAL</Text>
          </View>

          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <Image source={{ uri: submittedData.photoUrl }} style={{ width: 100, height: 120, borderRadius: 8, borderWidth: 2, borderColor: COLORS.primary }} />
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, { marginTop: 24 }]} 
            onPress={() => { setIsSubmitted(false); setSubmittedData(null); setPhotoUri(null); }}
          >
            <Text style={styles.submitBtnText}>SUBMIT ANOTHER ADMISSION</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // ===================== FORM VIEW =====================
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 2 }}>
      {/* Background Glowing Orbs */}
      <View style={styles.bgGlowOrbTopLeft} />
      <View style={styles.bgGlowOrbBottomRight} />
      <View style={styles.bgGlowOrbCenter} />

      {/* Streamlined Compact Header Banner */}
      <View style={styles.headerBanner}>
        <View style={styles.headerGlowOverlay} />
        <View style={styles.logoBadge}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logoImage} 
            resizeMode="contain" 
          />
        </View>
        <Text style={styles.headerTitle}>DRISHTEE COMPUTER CENTER</Text>
        <Text style={styles.headerSubtitle}>AN ISO 9001:2015 CERTIFIED IT INSTITUTE</Text>
        <View style={styles.sessionBadge}>
          <Text style={styles.sessionBadgeText}>ONLINE ADMISSION PORTAL - SESSION 2026-27</Text>
        </View>
      </View>

      {/* Glassmorphism Form Body Container */}
      <View style={styles.formGlassCard}>
        <View style={styles.formBody}>
          
          {/* SECTION I: STUDENT PHOTOGRAPH */}
          <View style={[styles.sectionHeaderBox, { borderLeftColor: '#0EA5E9' }]}>
            <View style={[styles.sectionIconBox, { backgroundColor: '#0EA5E915' }]}>
              <MaterialIcons name="image" size={16} color="#0EA5E9" />
            </View>
            <Text style={styles.sectionHeaderText}>I. STUDENT PHOTOGRAPH</Text>
            <View style={styles.sizeBadge}>
              <Text style={styles.sizeBadgeText}>MAX 50KB</Text>
            </View>
          </View>

          <View style={styles.photoUploadContainer}>
            <TouchableOpacity 
              style={styles.photoUploadBox} 
              onPress={openPicker} 
              activeOpacity={0.85}
            >
              {photoUri ? (
                <>
                  <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                  {imgLoading ? (
                    <View style={styles.photoUploadingOverlay}>
                      <ActivityIndicator size="small" color="#ffffff" />
                      <Text style={styles.progressText}>Uploading... {uploadProgress}%</Text>
                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${uploadProgress}%` }]} />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.photoOverlay}>
                      <MaterialIcons name="edit" size={22} color="#ffffff" />
                      <Text style={styles.photoOverlayText}>Change Photo</Text>
                    </View>
                  )}
                </>
              ) : (
                <>
                  {imgLoading ? (
                    <View style={{ alignItems: 'center' }}>
                      <ActivityIndicator size="large" color={COLORS.primary} />
                      <Text style={styles.progressTextDark}>Uploading... {uploadProgress}%</Text>
                    </View>
                  ) : (
                    <>
                      <View style={styles.uploadIconContainer}>
                        <MaterialIcons name="cloud-upload" size={42} color={COLORS.secondary} />
                      </View>
                      <Text style={styles.photoPlaceholderText}>Tap to upload photo</Text>
                      <Text style={styles.photoSizeText}>JPG, PNG, GIF supported</Text>
                    </>
                  )}
                </>
              )}
            </TouchableOpacity>
          </View>

          {Platform.OS === 'web' && (
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={styles.hiddenFileInput}
              id="photo-upload"
            />
          )}

          {/* Notice Banner */}
          <View style={styles.noticeAlert}>
            <MaterialIcons name="info-outline" size={16} color="#d97706" style={{ marginRight: 6 }} />
            <Text style={styles.noticeAlertText}>
              PLEASE UPLOAD YOUR PHOTOGRAPH AS THE FIRST STEP OF ADMISSION
            </Text>
          </View>

          {/* SECTION II: CENTER & COURSE SELECTION */}
          <View style={[styles.sectionHeaderBox, { borderLeftColor: '#ef4444' }]}>
            <View style={[styles.sectionIconBox, { backgroundColor: '#ef444415' }]}>
              <MaterialIcons name="domain" size={16} color="#ef4444" />
            </View>
            <Text style={styles.sectionHeaderText}>II. CENTER & COURSE SELECTION</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>CHOOSE CENTER <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity 
                style={styles.inputWrapper} 
                onPress={() => setActiveDropdown('branch')}
              >
                <Text style={[styles.inputDropdownText, !formData.branch && { color: COLORS.gray }]}>
                  {formData.branch || '-- Select Branch --'}
                </Text>
                <MaterialIcons name="keyboard-arrow-down" size={20} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>SELECT COURSE <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity 
                style={styles.inputWrapper} 
                onPress={() => setActiveDropdown('course')}
              >
                <Text style={[styles.inputDropdownText, !formData.course && { color: COLORS.gray }]} numberOfLines={1}>
                  {formData.course || '-- Select Course --'}
                </Text>
                <MaterialIcons name="keyboard-arrow-down" size={20} color={COLORS.gray} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Admission Date Picker Touch */}
          <View style={styles.inputGroupFull}>
            <Text style={styles.label}>ADMISSION DATE <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity 
              style={styles.inputWrapper}
              onPress={() => openDateChooser('admissionDate')}
            >
              <Text style={styles.inputDropdownText}>{formData.admissionDate}</Text>
              <MaterialIcons name="calendar-today" size={18} color={COLORS.secondary} />
            </TouchableOpacity>
          </View>

          {/* SECTION III: PERSONAL DETAILS */}
          <View style={[styles.sectionHeaderBox, { borderLeftColor: '#8b5cf6' }]}>
            <View style={[styles.sectionIconBox, { backgroundColor: '#8b5cf615' }]}>
              <MaterialIcons name="person-outline" size={16} color="#8b5cf6" />
            </View>
            <Text style={styles.sectionHeaderText}>III. PERSONAL DETAILS</Text>
          </View>

          <View style={styles.inputGroupFull}>
            <Text style={styles.label}>STUDENT FULL NAME <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.inputStandard}
              placeholder="Enter student full name"
              placeholderTextColor={COLORS.gray}
              value={formData.fullName}
              onChangeText={(val) => updateField('fullName', val)}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>FATHER'S NAME <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.inputStandard}
                placeholder="Father's name"
                placeholderTextColor={COLORS.gray}
                value={formData.fatherName}
                onChangeText={(val) => updateField('fatherName', val)}
              />
            </View>
            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>MOTHER'S NAME <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.inputStandard}
                placeholder="Mother's name"
                placeholderTextColor={COLORS.gray}
                value={formData.motherName}
                onChangeText={(val) => updateField('motherName', val)}
              />
            </View>
          </View>

          <View style={styles.row}>
            {/* DOB Picker Touch */}
            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>DATE OF BIRTH <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity 
                style={styles.inputWrapper}
                onPress={() => openDateChooser('dob')}
              >
                <Text style={[styles.inputDropdownText, !formData.dob && { color: COLORS.gray }]}>
                  {formData.dob || 'YYYY-MM-DD'}
                </Text>
                <MaterialIcons name="event" size={18} color={COLORS.gray} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>GENDER <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity 
                style={styles.inputWrapper} 
                onPress={() => setActiveDropdown('gender')}
              >
                <Text style={[styles.inputDropdownText, !formData.gender && { color: COLORS.gray }]}>
                  {formData.gender || 'Select Gender'}
                </Text>
                <MaterialIcons name="keyboard-arrow-down" size={20} color={COLORS.gray} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroupFull}>
            <Text style={styles.label}>AADHAR NUMBER (OPTIONAL)</Text>
            <TextInput
              style={styles.inputStandard}
              placeholder="Enter 12 digit number"
              placeholderTextColor={COLORS.gray}
              keyboardType="numeric"
              maxLength={12}
              value={formData.aadhar}
              onChangeText={(val) => updateField('aadhar', val)}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>CATEGORY <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity 
                style={styles.inputWrapper} 
                onPress={() => setActiveDropdown('category')}
              >
                <Text style={[styles.inputDropdownText, !formData.category && { color: COLORS.gray }]}>
                  {formData.category || 'Select Category'}
                </Text>
                <MaterialIcons name="keyboard-arrow-down" size={20} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>HIGHEST QUALIFICATION <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.inputStandard}
                placeholder="e.g. 10th, 12th, Graduate"
                placeholderTextColor={COLORS.gray}
                value={formData.qualification}
                onChangeText={(val) => updateField('qualification', val)}
              />
            </View>
          </View>

          {/* SECTION IV: CONTACT INFORMATION */}
          <View style={[styles.sectionHeaderBox, { borderLeftColor: '#10b981' }]}>
            <View style={[styles.sectionIconBox, { backgroundColor: '#10b98115' }]}>
              <MaterialIcons name="phone" size={16} color="#10b981" />
            </View>
            <Text style={styles.sectionHeaderText}>IV. CONTACT INFORMATION</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>MOBILE NUMBER <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="phone-iphone" size={16} color={COLORS.secondary} style={{ marginRight: 6 }} />
                <TextInput
                  style={styles.input}
                  placeholder="10 Digit Mobile No."
                  placeholderTextColor={COLORS.gray}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={formData.mobile}
                  onChangeText={(val) => updateField('mobile', val)}
                />
              </View>
            </View>
            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>EMAIL ADDRESS <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="email" size={16} color={COLORS.secondary} style={{ marginRight: 6 }} />
                <TextInput
                  style={styles.input}
                  placeholder="example@mail.com"
                  placeholderTextColor={COLORS.gray}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(val) => updateField('email', val)}
                />
              </View>
            </View>
          </View>

          {/* SECTION V: ADDRESS DETAILS */}
          <View style={[styles.sectionHeaderBox, { borderLeftColor: '#f59e0b' }]}>
            <View style={[styles.sectionIconBox, { backgroundColor: '#f59e0b15' }]}>
              <MaterialIcons name="location-on" size={16} color="#f59e0b" />
            </View>
            <Text style={styles.sectionHeaderText}>V. ADDRESS DETAILS</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroupThirdSmall}>
              <Text style={styles.label}>PINCODE <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.inputStandard}
                placeholder="Pincode"
                placeholderTextColor={COLORS.gray}
                keyboardType="numeric"
                maxLength={6}
                value={formData.pincode}
                onChangeText={(val) => updateField('pincode', val)}
              />
            </View>
            <View style={styles.inputGroupWide}>
              <Text style={styles.label}>VILLAGE/TOWN <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.inputStandard}
                placeholder="Village/Town name"
                placeholderTextColor={COLORS.gray}
                value={formData.village}
                onChangeText={(val) => updateField('village', val)}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroupThird}>
              <Text style={styles.label}>POST OFFICE <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.inputStandard}
                placeholder="Post Office"
                placeholderTextColor={COLORS.gray}
                value={formData.postOffice}
                onChangeText={(val) => updateField('postOffice', val)}
              />
            </View>
            <View style={styles.inputGroupThird}>
              <Text style={styles.label}>POLICE STATION <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.inputStandard}
                placeholder="Police Station"
                placeholderTextColor={COLORS.gray}
                value={formData.policeStation}
                onChangeText={(val) => updateField('policeStation', val)}
              />
            </View>
            <View style={styles.inputGroupThird}>
              <Text style={styles.label}>DISTRICT <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.inputStandard}
                placeholder="District"
                placeholderTextColor={COLORS.gray}
                value={formData.district}
                onChangeText={(val) => updateField('district', val)}
              />
            </View>
          </View>

          <View style={styles.inputGroupFull}>
            <Text style={styles.label}>STATE <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.inputStandard}
              placeholder="State"
              placeholderTextColor={COLORS.gray}
              value={formData.state}
              onChangeText={(val) => updateField('state', val)}
            />
          </View>

          {/* AUTO ADDRESS TOGGLE SWITCH */}
          <View style={styles.toggleRow}>
            <Text style={styles.labelToggle}>Auto Complete Address from fields</Text>
            <Switch
              trackColor={{ false: '#cbd5e1', true: '#bae6fd' }}
              thumbColor={autoAddress ? COLORS.primary : '#f4f3f4'}
              onValueChange={toggleAutoAddress}
              value={autoAddress}
            />
          </View>

          <View style={styles.inputGroupFull}>
            <Text style={styles.label}>FULL PERMANENT ADDRESS</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Type complete address..."
              placeholderTextColor={COLORS.gray}
              multiline
              numberOfLines={3}
              value={formData.address}
              onChangeText={(val) => updateField('address', val)}
            />
          </View>

          {/* Declaration Checkbox */}
          <TouchableOpacity 
            style={styles.declarationBox} 
            activeOpacity={0.9}
            onPress={() => setFormData(prev => ({ ...prev, agreed: !prev.agreed }))}
          >
            <View style={[styles.checkbox, formData.agreed && styles.checkboxChecked]}>
              {formData.agreed && <MaterialIcons name="check" size={14} color="#ffffff" />}
            </View>
            <Text style={styles.declarationText}>
              I hereby declare that all provided details are correct and I will abide by the rules of the center.
            </Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity 
            style={styles.submitBtn} 
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <MaterialIcons name="check-circle" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={styles.submitBtnText}>FINALIZE ADMISSION</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* NATIVE DATETIME PICKER MODAL */}
      {showPicker && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}

      {/* MODAL PICKER FOR SELECT DROPDOWNS */}
      <Modal
        transparent={true}
        visible={activeDropdown !== null}
        animationType="fade"
        onRequestClose={() => setActiveDropdown(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setActiveDropdown(null)}>
          <View style={styles.dropdownModalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              Select {activeDropdown ? activeDropdown.toUpperCase() : ''}
            </Text>

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              {activeDropdown === 'branch' && BRANCHES.map(b => (
                <TouchableOpacity 
                  key={b.id} 
                  style={styles.dropdownOption}
                  onPress={() => { updateField('branch', b.id); setActiveDropdown(null); }}
                >
                  <Text style={styles.dropdownOptionText}>{b.name}</Text>
                </TouchableOpacity>
              ))}

              {activeDropdown === 'course' && courseNames.map(c => (
                <TouchableOpacity 
                  key={c} 
                  style={styles.dropdownOption}
                  onPress={() => { updateField('course', c); setActiveDropdown(null); }}
                >
                  <Text style={styles.dropdownOptionText}>{c}</Text>
                </TouchableOpacity>
              ))}

              {activeDropdown === 'gender' && GENDERS.map(g => (
                <TouchableOpacity 
                  key={g} 
                  style={styles.dropdownOption}
                  onPress={() => { updateField('gender', g); setActiveDropdown(null); }}
                >
                  <Text style={styles.dropdownOptionText}>{g}</Text>
                </TouchableOpacity>
              ))}

              {activeDropdown === 'category' && CATEGORIES.map(cat => (
                <TouchableOpacity 
                  key={cat} 
                  style={styles.dropdownOption}
                  onPress={() => { updateField('category', cat); setActiveDropdown(null); }}
                >
                  <Text style={styles.dropdownOptionText}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setActiveDropdown(null)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F6FF', position: 'relative' },
  
  // Background Glowing Orbs
  bgGlowOrbTopLeft: {
    position: "absolute",
    top: -80,
    left: -70,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "#38BDF8",
    opacity: 0.35,
    transform: [{ scale: 1.5 }]
  },
  bgGlowOrbBottomRight: {
    position: "absolute",
    bottom: -80,
    right: -70,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: "#34D399",
    opacity: 0.3,
  },
  bgGlowOrbCenter: {
    position: "absolute",
    top: "40%",
    left: "20%",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#C084FC",
    opacity: 0.22,
  },

  // Streamlined Compact Header Banner
  headerBanner: { 
    backgroundColor: '#0284C7',
    paddingVertical: 16, 
    paddingHorizontal: 4, 
    alignItems: 'center', 
    borderBottomLeftRadius: 22, 
    borderBottomRightRadius: 22, 
    position: 'relative', 
    overflow: 'hidden',
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    borderBottomWidth: 3,
    borderBottomColor: '#38BDF8',
  },
  headerGlowOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(56, 189, 248, 0.25)' },
  logoBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', marginBottom: 6, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.9)', elevation: 4 },
  logoImage: { width: '80%', height: '80%' },
  headerTitle: { color: '#ffffff', fontSize: 15, fontWeight: '900', textAlign: 'center', letterSpacing: 0.5 },
  headerSubtitle: { color: '#E0F2FE', fontSize: 8, fontWeight: '700', marginTop: 2, textAlign: 'center', letterSpacing: 0.5 },
  sessionBadge: { marginTop: 6, backgroundColor: 'rgba(2, 132, 199, 0.6)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)' },
  sessionBadgeText: { color: '#ffffff', fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },

  // Photo Upload Container
  sizeBadge: { backgroundColor: '#fef3c7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: '#fde68a', marginLeft: 'auto' },
  sizeBadgeText: { fontSize: 7, fontWeight: '800', color: '#92400e' },
  photoUploadContainer: { marginVertical: 10 },
  photoUploadBox: { width: '100%', height: 150, borderRadius: 12, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#cbd5e1', borderStyle: 'dashed', overflow: 'hidden', position: 'relative' },
  photoPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  photoOverlayText: { color: '#ffffff', fontSize: 11, fontWeight: '700', marginTop: 4 },
  photoUploadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  progressText: { color: '#ffffff', fontSize: 12, fontWeight: '700', marginTop: 6 },
  progressTextDark: { color: COLORS.primary, fontSize: 12, fontWeight: '700', marginTop: 6 },
  progressBarBg: { width: '80%', height: 6, backgroundColor: '#cbd5e1', borderRadius: 3, marginTop: 8, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#10b981' },
  uploadIconContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#f0f9ff', justifyContent: 'center', alignItems: 'center', marginBottom: 6, borderWidth: 1, borderColor: '#bae6fd' },
  photoPlaceholderText: { fontSize: 12, fontWeight: '700', color: '#475569', marginTop: 4 },
  photoSizeText: { fontSize: 9, color: '#94a3b8', marginTop: 2 },
  hiddenFileInput: { display: 'none' },

  noticeAlert: { backgroundColor: '#fef3c7', marginTop: 6, marginBottom: 14, padding: 8, borderRadius: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#fde68a' },
  noticeAlertText: { color: '#92400e', fontSize: 8, fontWeight: '800', flex: 1 },

  // Glassmorphism Form Card Wrapper
  formGlassCard: {
    marginHorizontal: 2,
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    elevation: 10,
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    overflow: 'hidden',
  },
  formBody: { padding: 10 },

  sectionHeaderBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.95)', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, marginTop: 16, marginBottom: 12, borderLeftWidth: 4, borderWidth: 1, borderColor: '#e2e8f0' },
  sectionIconBox: { width: 24, height: 24, borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  sectionHeaderText: { color: COLORS.primary, fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },

  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  inputGroupHalf: { width: '48%' },
  inputGroupThird: { width: '31%' },
  inputGroupThirdSmall: { width: '28%' },
  inputGroupWide: { width: '69%' },
  inputGroupFull: { marginBottom: 12 },
  label: { fontSize: 8.5, fontWeight: '800', color: '#475569', marginBottom: 5, letterSpacing: 0.3 },
  required: { color: '#ef4444' },

  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 8, height: 42, justifyContent: 'space-between' },
  input: { flex: 1, fontSize: 11, color: '#1e293b', paddingVertical: 0, fontWeight: '600' },
  inputDropdownText: { fontSize: 11, color: '#1e293b', flex: 1, fontWeight: '600' },
  inputStandard: { backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 8, height: 42, fontSize: 11, color: '#1e293b', fontWeight: '600' },
  textArea: { backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 8, paddingTop: 8, fontSize: 11, color: '#1e293b', height: 75, textAlignVertical: 'top', fontWeight: '600' },

  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(240, 249, 255, 0.9)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#bae6fd', marginBottom: 12 },
  labelToggle: { fontSize: 9, fontWeight: '800', color: '#0284c7' },

  declarationBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7', padding: 12, borderRadius: 10, marginTop: 10, marginBottom: 14, borderWidth: 1, borderColor: '#fde68a' },
  checkbox: { width: 16, height: 16, borderRadius: 4, borderWidth: 1.5, borderColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center', marginRight: 10, backgroundColor: '#ffffff' },
  checkboxChecked: { backgroundColor: COLORS.secondary },
  declarationText: { fontSize: 8.5, color: '#92400e', fontWeight: '800', flex: 1, lineHeight: 13 },

  submitBtn: { backgroundColor: COLORS.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 12, marginBottom: 8, elevation: 6, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10 },
  submitBtnText: { color: '#ffffff', fontSize: 11, fontWeight: '900', letterSpacing: 1 },

  receiptBox: { backgroundColor: '#ffffff', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#cbd5e1', elevation: 4 },
  receiptHeader: { alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 16, marginBottom: 16 },
  receiptMainTitle: { fontSize: 18, fontWeight: '900', color: COLORS.primary, textAlign: 'center' },
  receiptSubTitle: { fontSize: 11, fontWeight: '700', color: '#64748b', marginTop: 4 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  receiptLabel: { fontSize: 12, fontWeight: '700', color: '#475569' },
  receiptValue: { fontSize: 12, fontWeight: '600', color: '#1e293b', textAlign: 'right' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  dropdownModalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '60%', elevation: 10 },
  modalHandle: { width: 40, height: 4, backgroundColor: '#cbd5e1', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 16, textAlign: 'center' },
  dropdownOption: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  dropdownOptionText: { fontSize: 14, fontWeight: '600', color: '#334155' },
  modalCancelBtn: { marginTop: 12, paddingVertical: 14, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center' },
  modalCancelText: { fontSize: 14, fontWeight: '700', color: '#64748b' },
});