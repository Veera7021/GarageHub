import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { collection, DocumentData, onSnapshot, QuerySnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../firebase/config';

const ORANGE = '#FF6600';

type Appointment = {
  id: string;
  date: string;
  time: string;
  service: string;
  customerName: string;
  status: 'pending' | 'confirmed' | 'canceled' | 'completed';
};

type MerchantStackParamList = {
  BookingDetails: { appointment: Appointment };
};

const AppointmentsScreen: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<MerchantStackParamList>>();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, 'appointments'),
      (snapshot: QuerySnapshot<DocumentData>) => {
        const list: Appointment[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            date: data.date || '',
            time: data.time || '',
            service: data.service || '',
            customerName: data.customerName || '',
            status: data.status || 'pending',
          };
        });
        setAppointments(list);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError('Failed to load appointments.');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

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
        <Text style={styles.headerTitle}>Appointments</Text>
      </View>
      <FlatList
        data={appointments}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('BookingDetails', { appointment: item })}
          >
            <View style={styles.infoContainer}>
              <Text style={styles.dateTime}>{item.date} {item.time}</Text>
              <Text style={styles.service}>{item.service}</Text>
              <Text style={styles.customer}>Customer: {item.customerName}</Text>
              <Text style={[styles.status, styles[item.status]]}>{item.status.toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888', marginTop: 32 }}>No appointments found.</Text>}
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
  },
  infoContainer: {},
  dateTime: { fontSize: 16, fontWeight: 'bold', color: ORANGE, marginBottom: 4 },
  service: { fontSize: 15, color: '#222', marginBottom: 2 },
  customer: { fontSize: 14, color: '#666', marginBottom: 2 },
  status: { fontSize: 14, fontWeight: 'bold', marginTop: 4 },
  pending: { color: '#FFB300' },
  confirmed: { color: '#2E7D32' },
  canceled: { color: '#D32F2F' },
  completed: { color: '#1976D2' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
});

export default AppointmentsScreen; 