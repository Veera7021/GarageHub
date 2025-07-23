import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-document-picker';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db, storage } from '../../firebase/config';

const ORANGE = '#FF8800';

type AuthStackParamList = {
  Signup: undefined;
  SignupStep2: { email: string; password: string };
  SignupStep3: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    userType: 'customer' | 'merchant';
  };
  Dashboard: undefined;
};

const SignupStep3: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const route = useRoute<RouteProp<AuthStackParamList, 'SignupStep3'>>();
  const { email, password, fullName, phone, userType } = route.params || {};

  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [licenseDoc, setLicenseDoc] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    navigation.navigate('SignupStep2', { email, password });
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (result.assets && result.assets.length > 0) {
        setLicenseDoc(result.assets[0]);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not pick document.');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;
      let licenseUrl = '';

      // 2. If merchant, upload license to Storage
      if (userType === 'merchant') {
        if (!storeName.trim()) {
          setLoading(false);
          Alert.alert('Missing Store Name', 'Please enter your store name.');
          return;
        }
        if (!storeAddress.trim()) {
          setLoading(false);
          Alert.alert('Missing Store Address', 'Please enter your store address.');
          return;
        }
        if (!licenseDoc) {
          setLoading(false);
          Alert.alert('Missing License', 'Please upload your license document.');
          return;
        }
        // Upload license
        const response = await fetch(licenseDoc.uri);
        const blob = await response.blob();
        const ext = licenseDoc.name?.split('.').pop() || 'pdf';
        const storageRef = ref(storage, `licenses/${uid}/license.${ext}`);
        await uploadBytes(storageRef, blob);
        licenseUrl = await getDownloadURL(storageRef);
      }

      // 3. Save user data to Firestore
      const userData: any = {
        email,
        fullName,
        phone,
        userType,
      };
      if (userType === 'merchant') {
        userData.storeName = storeName;
        userData.storeAddress = storeAddress;
        userData.licenseUrl = licenseUrl;
      }
      await setDoc(doc(db, 'users', uid), userData);

      setLoading(false);
      navigation.navigate('Dashboard');
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Signup Error', error.message || 'An error occurred during signup.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Finish Signing Up</Text>
      {userType === 'merchant' ? (
        <>
          <TextInput
            placeholder="Store Name"
            placeholderTextColor="#aaa"
            style={styles.input}
            value={storeName}
            onChangeText={setStoreName}
          />
          <TextInput
            placeholder="Store Address"
            placeholderTextColor="#aaa"
            style={styles.input}
            value={storeAddress}
            onChangeText={setStoreAddress}
          />
          <TouchableOpacity style={styles.uploadButton} onPress={handlePickDocument} activeOpacity={0.7}>
            <Text style={styles.uploadButtonText}>{licenseDoc ? 'License Uploaded' : 'Upload License Document'}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.confirmationBox}>
          <Text style={styles.confirmationText}>Almost done!</Text>
        </View>
      )}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7} disabled={loading}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.7} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Submit</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: ORANGE,
    alignSelf: 'center',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderColor: ORANGE,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#222',
    backgroundColor: '#fff',
  },
  uploadButton: {
    backgroundColor: ORANGE,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmationBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  confirmationText: {
    fontSize: 20,
    color: ORANGE,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  backButton: {
    backgroundColor: '#fff',
    borderColor: ORANGE,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  backButtonText: {
    color: ORANGE,
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: ORANGE,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SignupStep3; 