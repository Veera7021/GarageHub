import * as ImagePicker from 'expo-image-picker';
import { getAuth, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';

const ProfileScreen: React.FC = () => {
  const { user } = useAuth();
  const auth = getAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user || !user.uid) return;
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, 'users', user.uid); // Adjust if merchants are stored elsewhere
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFullName(data.fullName || '');
        setPhone(data.phone || '');
        setProfileImage(data.photoURL || null);
      } else {
        setError('Profile not found.');
      }
    } catch (e) {
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !user.uid) return;
    fetchProfile();
  }, [user]);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Permission to access gallery is required!');
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });
    if (!pickerResult.canceled) {
      setProfileImage(pickerResult.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid); // Adjust if merchants are stored elsewhere
      // TODO: If profileImage changed and is a local URI, upload to Firebase Storage and get URL
      // For now, just save local URI to Firestore (replace with real upload code)
      await updateDoc(userRef, {
        fullName,
        phone,
        photoURL: profileImage,
      });
      await updateProfile(auth.currentUser!, {
        displayName: fullName,
        photoURL: profileImage,
      });
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6600" />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: '#FF6600', fontSize: 16, marginBottom: 16 }}>{error}</Text>
        <Button title="Retry" onPress={fetchProfile} color="#FF6600" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={{ color: '#FF6600' }}>Tap to select photo</Text>
          </View>
        )}
      </TouchableOpacity>
      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
        placeholder="Full Name"
      />
      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="Phone Number"
        keyboardType="phone-pad"
      />
      <Text style={styles.label}>Email (read-only)</Text>
      <TextInput
        style={[styles.input, { backgroundColor: '#f0f0f0' }]}
        value={email}
        editable={false}
      />
      <View style={styles.buttonContainer}>
        <Button
          title="Save"
          onPress={handleSave}
          color="#FF6600"
          disabled={loading || !!error}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  imageContainer: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePlaceholder: {
    borderWidth: 2,
    borderColor: '#FF6600',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff5eb',
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#FF6600',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: 'white',
  },
  buttonContainer: {
    marginTop: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileScreen; 