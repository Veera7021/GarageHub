import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import uuid from 'react-native-uuid';
import { db, storage } from '../../firebase/config';

const ORANGE = '#FF6600';

type Car = {
  id?: string;
  name: string;
  price: string;
  description: string;
  specs?: string;
  imageUrl: string[];
};

type MerchantStackParamList = {
  CarForm: { car?: Car };
};

type CarFormRoute = RouteProp<{ CarForm: { car?: Car } }, 'CarForm'>;

const CarFormScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MerchantStackParamList>>();
  const route = useRoute<CarFormRoute>();
  const editingCar = route.params?.car;

  const [name, setName] = useState(editingCar?.name || '');
  const [price, setPrice] = useState(editingCar?.price || '');
  const [description, setDescription] = useState(editingCar?.description || '');
  const [specs, setSpecs] = useState(editingCar?.specs || '');
  const [images, setImages] = useState<string[]>(editingCar?.imageUrl || []);
  const [uploading, setUploading] = useState(false);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets) {
      setImages([...images, ...result.assets.map(a => a.uri)]);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !price.trim() || !description.trim() || images.length === 0) {
      Alert.alert('Validation Error', 'Please fill all fields and upload at least one image.');
      return;
    }
    setUploading(true);
    try {
      // Upload new images to Firebase Storage
      const uploadedUrls: string[] = [];
      for (const img of images) {
        if (img.startsWith('http')) {
          uploadedUrls.push(img); // Already uploaded
        } else {
          const response = await fetch(img);
          const blob = await response.blob();
          const ext = img.split('.').pop() || 'jpg';
          const imgRef = ref(storage, `cars/${uuid.v4()}.${ext}`);
          await uploadBytes(imgRef, blob);
          const url = await getDownloadURL(imgRef);
          uploadedUrls.push(url);
        }
      }
      const carData = {
        name,
        price,
        description,
        specs,
        imageUrl: uploadedUrls,
      };
      if (editingCar && editingCar.id) {
        await updateDoc(doc(db, 'cars', editingCar.id), carData);
      } else {
        await addDoc(collection(db, 'cars'), carData);
      }
      setUploading(false);
      navigation.goBack();
    } catch (error: any) {
      setUploading(false);
      Alert.alert('Error', error.message || 'Failed to save car.');
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{editingCar ? 'Edit Car' : 'Add Car'}</Text>
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Car Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter car name" />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Price</Text>
        <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="Enter price" keyboardType="numeric" />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, { height: 80 }]} value={description} onChangeText={setDescription} placeholder="Enter description" multiline />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Specs</Text>
        <TextInput style={styles.input} value={specs} onChangeText={setSpecs} placeholder="Enter specs (optional)" />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Images</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
          {images.map((img, idx) => (
            <Image key={idx} source={{ uri: img }} style={styles.imagePreview} />
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.uploadButton} onPress={pickImages} activeOpacity={0.7}>
          <Text style={styles.uploadButtonText}>Upload Images</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} activeOpacity={0.7} disabled={uploading}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.7} disabled={uploading}>
          {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 48,
    paddingBottom: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: ORANGE,
    letterSpacing: 1,
  },
  formGroup: {
    marginHorizontal: 20,
    marginTop: 18,
  },
  label: {
    fontSize: 15,
    color: ORANGE,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#222',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#f5f5f5',
  },
  uploadButton: {
    backgroundColor: ORANGE,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    marginHorizontal: 20,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderColor: ORANGE,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: ORANGE,
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: ORANGE,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CarFormScreen; 