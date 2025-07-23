import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ORANGE = '#FF6600';
const { width } = Dimensions.get('window');

type Car = {
  id: string;
  name: string;
  price: string;
  description: string;
  specs?: string;
  imageUrl: string | string[];
};

type CustomerStackParamList = {
  CarDetail: { car: Car };
  Booking: { car: Car };
};

type CarDetailRoute = RouteProp<{ CarDetail: { car: Car } }, 'CarDetail'>;

const CarDetailScreen: React.FC = () => {
  const route = useRoute<CarDetailRoute>();
  const navigation = useNavigation<NativeStackNavigationProp<CustomerStackParamList>>();
  const car = route.params?.car;

  if (!car) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red', fontSize: 16 }}>Car details not found.</Text>
      </View>
    );
  }

  const images = Array.isArray(car.imageUrl) ? car.imageUrl : [car.imageUrl];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{car.name}</Text>
        </View>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.carousel}
          contentContainerStyle={{ alignItems: 'center' }}
        >
          {images.map((img, idx) => (
            <Image
              key={idx}
              source={{ uri: img || 'https://img.icons8.com/ios-filled/100/000000/car--v2.png' }}
              style={styles.carImage}
              resizeMode="contain"
            />
          ))}
        </ScrollView>
        <View style={styles.infoContainer}>
          <Text style={styles.price}>{car.price}</Text>
          <Text style={styles.desc}>{car.description}</Text>
          {car.specs && (
            <View style={styles.specsBox}>
              <Text style={styles.specsTitle}>Specifications</Text>
              <Text style={styles.specsText}>{car.specs}</Text>
            </View>
          )}
        </View>
      </ScrollView>
      <TouchableOpacity
        style={styles.bookButton}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Booking', { car })}
      >
        <Text style={styles.bookButtonText}>Book Appointment</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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
  carousel: {
    width: '100%',
    height: 220,
    marginTop: 16,
    marginBottom: 8,
  },
  carImage: {
    width: width - 32,
    height: 200,
    marginHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  infoContainer: {
    padding: 20,
  },
  price: {
    fontSize: 22,
    color: ORANGE,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  desc: {
    fontSize: 16,
    color: '#444',
    marginBottom: 16,
  },
  specsBox: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  specsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: ORANGE,
    marginBottom: 4,
  },
  specsText: {
    fontSize: 15,
    color: '#333',
  },
  bookButton: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: ORANGE,
    paddingVertical: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default CarDetailScreen; 