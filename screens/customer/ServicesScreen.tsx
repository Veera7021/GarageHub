import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ORANGE = '#FF6600';

const SERVICES = [
  { id: '1', name: 'General Service', description: 'Routine maintenance and inspection.' },
  { id: '2', name: 'Oil Change', description: 'Replace engine oil and filter.' },
  { id: '3', name: 'Tire Rotation', description: 'Rotate tires for even wear.' },
  { id: '4', name: 'Brake Inspection', description: 'Check and service brakes.' },
  { id: '5', name: 'Car Wash', description: 'Exterior and interior cleaning.' },
];

type CustomerStackParamList = {
  Booking: { service: string };
};

const ServicesScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CustomerStackParamList>>();
  const [loading, setLoading] = useState(false);
  // Assume merchantId is available (replace with actual logic if needed)
  const merchantId = 'MERCHANT_ID';

  const handleBook = (service: string) => {
    if (!merchantId) return;
    setLoading(true);
    navigation.navigate('Booking', { service });
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Services</Text>
      </View>
      <FlatList
        data={SERVICES}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.infoContainer}>
              <Text style={styles.serviceName}>{item.name}</Text>
              <Text style={styles.serviceDesc}>{item.description}</Text>
            </View>
            <TouchableOpacity
              style={styles.bookButton}
              activeOpacity={0.8}
              onPress={() => handleBook(item.name)}
              disabled={loading || !merchantId}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.bookButtonText}>Book</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888', marginTop: 32 }}>No services available.</Text>}
      />
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
  listContent: { padding: 16 },
  card: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  infoContainer: { marginBottom: 12 },
  serviceName: { fontSize: 18, fontWeight: 'bold', color: '#222', marginBottom: 4 },
  serviceDesc: { fontSize: 14, color: '#666' },
  bookButton: {
    width: '100%',
    backgroundColor: ORANGE,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  bookButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default ServicesScreen; 