// src/components/QuickInquiryModal.js
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants/theme';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function QuickInquiryModal() {
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Error', 'Please enter your name and phone number.');
      return;
    }

    if (phone.trim().length < 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'inquiries'), {
        name: name.trim(),
        phone: phone.trim(),
        message: message.trim() || 'No specific query provided',
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      Alert.alert('Success!', 'Thank you! Our counselor will call you back shortly.');
      setName('');
      setPhone('');
      setMessage('');
      setModalVisible(false);
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      Alert.alert('Error', 'Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.floatingBtn} 
        activeOpacity={0.85}
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons name="headset-mic" size={18} color="#ffffff" />
        <Text style={styles.floatingText}>Enquiry</Text>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        statusBarTranslucent
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Quick Course Enquiry</Text>
                <Text style={styles.modalSubtitle}>Get a free callback from Drishtee experts</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <MaterialIcons name="close" size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Your Full Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your name"
                  placeholderTextColor="#94a3b8"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mobile Number</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter 10-digit mobile number"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Your Message / Query (Optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Ask about courses, fees, batches..."
                  placeholderTextColor="#94a3b8"
                  multiline={true}
                  numberOfLines={3}
                  value={message}
                  onChangeText={setMessage}
                />
              </View>

              <TouchableOpacity 
                style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
                activeOpacity={0.8} 
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>Request Callback</Text>
                    <MaterialIcons name="arrow-forward" size={16} color="#ffffff" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingBtn: {
    position: 'absolute',
    right: 16,
    bottom: 85,
    backgroundColor: '#0284c7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    zIndex: 99,
    elevation: 8,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    gap: 5,
  },
  floatingText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 11.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalSubtitle: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 2,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    gap: 12,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#334155',
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0f172a',
  },
  textArea: {
    height: 75,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: COLORS.secondary || '#0284c7',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
    gap: 6,
    elevation: 2,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '700',
  },
});