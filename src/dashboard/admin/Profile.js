// src/dashboard/admin/Profile.js
import React, { useContext, useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, Image, TextInput, Pressable, ActivityIndicator, Alert, ScrollView, Platform 
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { uploadToCloudinary } from '../../services/cloudinary';

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: 'Administrator',
    contact: '',
    about: '',
    photoUrl: null,
  });

  const emailKey = user?.email ? user.email.trim().toLowerCase() : '';

  useEffect(() => {
    const fetchAdminProfile = async () => {
      if (!emailKey) return;
      try {
        const docRef = doc(db, 'adminProfiles', emailKey);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData({
            name: data.name || 'Administrator',
            contact: data.contact || '',
            about: data.about || '',
            photoUrl: data.photoUrl || null,
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, [emailKey]);

  const handleFieldChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleImagePickAndUpload = async (fileObj, localUri) => {
    try {
      setImgUploading(true);
      if (localUri) {
        setProfileData(prev => ({ ...prev, photoUrl: localUri }));
      }

      const res = await uploadToCloudinary(fileObj);
      if (res.success && res.url) {
        setProfileData(prev => ({ ...prev, photoUrl: res.url }));
        Alert.alert('Success', 'Profile picture uploaded successfully!');
      } else {
        Alert.alert('Upload Failed', res.error || 'Could not upload image.');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setImgUploading(false);
    }
  };

  const handleFileChangeWeb = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        Alert.alert('Error', 'File size must be less than 2MB');
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      handleImagePickAndUpload(file, previewUrl);
    }
  };

  const triggerPhotoSelect = () => {
    if (Platform.OS === 'web') {
      document.getElementById('admin-avatar-upload')?.click();
    } else {
      Alert.alert('Notice', 'File picker for mobile can be linked using expo-image-picker.');
    }
  };

  const handleSaveProfile = async () => {
    if (!emailKey) return;
    try {
      setUpdating(true);
      const docRef = doc(db, 'adminProfiles', emailKey);
      const payload = {
        email: emailKey,
        name: profileData.name,
        contact: profileData.contact,
        about: profileData.about,
        photoUrl: profileData.photoUrl || '',
        updatedAt: serverTimestamp(),
      };

      await setDoc(docRef, payload, { merge: true });
      Alert.alert('Success', 'Admin profile updated successfully!');
    } catch (error) {
      Alert.alert('Update Failed', error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        {/* Glowing Ambient Top Highlight */}
        <View style={styles.cardGlowTop} />

        <Pressable style={styles.avatarWrapper} onPress={triggerPhotoSelect} activeOpacity={0.8}>
          <Image 
            source={profileData.photoUrl ? { uri: profileData.photoUrl } : require('../../../assets/team1.avif')} 
            style={styles.avatar} 
          />
          <View style={styles.cameraIconBadge}>
            {imgUploading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <MaterialIcons name="camera-alt" size={14} color="#ffffff" />
            )}
          </View>
        </Pressable>

        {Platform.OS === 'web' && (
          <input 
            type="file" 
            accept="image/*" 
            id="admin-avatar-upload" 
            style={{ display: 'none' }} 
            onChange={handleFileChangeWeb} 
          />
        )}

        <Text style={styles.emailStatic}>{user?.email}</Text>

        <View style={styles.badge}>
          <MaterialIcons name="admin-panel-settings" size={14} color="#0284c7" />
          <Text style={styles.badgeText}>Authorized Management</Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputBox}>
              <MaterialIcons name="person-outline" size={18} color="#64748b" style={styles.prefixIcon} />
              <TextInput 
                style={styles.textInput} 
                placeholder="Enter admin name"
                placeholderTextColor="#94a3b8"
                value={profileData.name}
                onChangeText={(val) => handleFieldChange('name', val)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Number</Text>
            <View style={styles.inputBox}>
              <MaterialIcons name="phone-iphone" size={18} color="#64748b" style={styles.prefixIcon} />
              <TextInput 
                style={styles.textInput} 
                placeholder="Enter contact number"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
                maxLength={10}
                value={profileData.contact}
                onChangeText={(val) => handleFieldChange('contact', val)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>About / Bio</Text>
            <View style={[styles.inputBox, { height: 80, alignItems: 'flex-start', paddingTop: 10 }]}>
              <MaterialIcons name="info-outline" size={18} color="#64748b" style={[styles.prefixIcon, { marginTop: 2 }]} />
              <TextInput 
                style={[styles.textInput, { height: '100%', textAlignVertical: 'top' }]} 
                placeholder="Write a brief professional summary..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={3}
                value={profileData.about}
                onChangeText={(val) => handleFieldChange('about', val)}
              />
            </View>
          </View>

          <Pressable 
            style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.85 }]}
            onPress={handleSaveProfile}
            disabled={updating || imgUploading}
          >
            {updating ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <MaterialIcons name="save" size={18} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.saveBtnText}>Save Profile Changes</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#F0F6FF', justifyContent: 'center', alignItems: 'center' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F6FF' },
  loadingText: { marginTop: 10, fontSize: 13, fontWeight: '700', color: '#64748b' },
  card: { 
    width: '100%', 
    maxWidth: 520, 
    backgroundColor: 'rgba(255, 255, 255, 0.85)', 
    borderRadius: 30, 
    padding: 24, 
    alignItems: 'center', 
    borderWidth: 3, 
    borderColor: '#FFFFFF',
    elevation: 12,
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    position: 'relative',
    overflow: 'hidden'
  },
  cardGlowTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: '#0EA5E9',
  },
  avatarWrapper: {
    position: 'relative',
    marginTop: 10,
    marginBottom: 10,
  },
  avatar: { 
    width: 90, 
    height: 90, 
    borderRadius: 45, 
    borderWidth: 3, 
    borderColor: '#38BDF8',
    backgroundColor: '#E2E8F0'
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0EA5E9',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 4
  },
  emailStatic: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginTop: 4 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E0F2FE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, gap: 6, marginTop: 8, marginBottom: 20, borderWidth: 1, borderColor: '#BAE6FD' },
  badgeText: { fontSize: 11, fontWeight: '800', color: '#0284c7' },
  formSection: { width: '100%', gap: 14 },
  inputGroup: { width: '100%' },
  label: { fontSize: 11, fontWeight: '800', color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F8FAFC', 
    borderWidth: 1.5, 
    borderColor: '#CBD5E1', 
    borderRadius: 14, 
    paddingHorizontal: 12, 
    height: 50 
  },
  prefixIcon: { marginRight: 10 },
  textInput: { flex: 1, fontSize: 13, color: '#0F172A', fontWeight: '600', height: '100%' },
  saveBtn: { 
    height: 50, 
    backgroundColor: '#0EA5E9', 
    borderRadius: 14, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 10,
    elevation: 4,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900', letterSpacing: 0.8 },
});