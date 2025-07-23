import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { collection, deleteDoc, doc, DocumentData, onSnapshot, QuerySnapshot } from 'firebase/firestore';
import { deleteObject, ref as storageRef } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db, storage } from '../../firebase/config';

const ORANGE = '#FF6600';

type Car = {
  id: string;
  name: string;
  price: string;
  description: string;
  specs?: string;
  imageUrl: string[];
};

type MerchantStackParamList = {
  CarForm: { car?: Car };
};

const ServicesScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MerchantStackParamList>>();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, 'cars'),
      (snapshot: QuerySnapshot<DocumentData>) => {
        const carList: Car[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            price: data.price || '',
            description: data.description || '',
            specs: data.specs || '',
            imageUrl: data.imageUrl || [],
          };
        });
        setCars(carList);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError('Failed to load cars.');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleDelete = async (car: Car) => {
    Alert.alert(
      'Delete Car',
      'Are you sure you want to delete this car?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Remove car document from Firestore
              await deleteDoc(doc(db, 'cars', car.id));
              // Remove images from Storage
              if (car.imageUrl && Array.isArray(car.imageUrl)) {
                await Promise.all(
                  car.imageUrl.map(async (url) => {
                    try {
                      // Extract the storage path from the URL
                      const pathMatch = url.match(/%2F(.+?)\?/);
                      if (pathMatch && pathMatch[1]) {
                        const path = decodeURIComponent(pathMatch[1]);
                        await deleteObject(storageRef(storage, `cars/${path}`));
                      }
                    } catch (e) {
                      // Ignore errors for missing images
                    }
                  })
                );
              }
              setCars(prev => prev.filter(c => c.id !== car.id));
              Alert.alert('Deleted', 'Car deleted successfully.');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete car.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={ORANGE} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red', fontSize: 16 }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Car Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CarForm', {})}
          activeOpacity={0.7}
        >
          <Text style={styles.addButtonText}>Add Car</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={cars}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={{ uri: item.imageUrl[0] || 'https://img.icons8.com/ios-filled/100/000000/car--v2.png' }}
              style={styles.carImage}
              resizeMode="contain"
            />
            <View style={styles.infoContainer}>
              <Text style={styles.carName}>{item.name}</Text>
              <Text style={styles.carPrice}>{item.price}</Text>
              <Text style={styles.carDesc}>{item.description}</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => navigation.navigate('CarForm', { car: item })}
                  activeOpacity={0.7}
                >
                  <Text style={styles.editButtonText}>Edit Car</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888', marginTop: 32 }}>No cars available.</Text>}
      />
    </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ORANGE,
    letterSpacing: 1,
  },
  addButton: {
    backgroundColor: ORANGE,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginLeft: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  carImage: {
    width: 64,
    height: 64,
    marginRight: 16,
    tintColor: '#222',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
  },
  carName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  carPrice: {
    fontSize: 16,
    color: ORANGE,
    fontWeight: '600',
    marginBottom: 2,
  },
  carDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  editButton: {
    backgroundColor: ORANGE,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginRight: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderColor: ORANGE,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  deleteButtonText: {
    color: ORANGE,
    fontSize: 15,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default ServicesScreen; 