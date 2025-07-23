import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

type BookingDetailsRoute = RouteProp<MerchantStackParamList, 'BookingDetails'>;

const BookingDetailsScreen: React.FC = () => {
  const route = useRoute<BookingDetailsRoute>();
  const navigation = useNavigation<NativeStackNavigationProp<MerchantStackParamList>>();
  const [appointment, setAppointment] = useState<Appointment>(route.params.appointment);
  const [loading, setLoading] = useState(false);

  const updateStatus = async (status: Appointment['status']) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'appointments', appointment.id), { status });
      setAppointment({ ...appointment, status });
      setLoading(false);
      Alert.alert('Success', `Appointment marked as ${status}.`);
      if (status === 'canceled' || status === 'completed') {
        navigation.goBack();
      }
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Failed to update status.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Booking Details</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.label}>Date & Time</Text>
        <Text style={styles.value}>{appointment.date} {appointment.time}</Text>
        <Text style={styles.label}>Service</Text>
        <Text style={styles.value}>{appointment.service}</Text>
        <Text style={styles.label}>Customer</Text>
        <Text style={styles.value}>{appointment.customerName}</Text>
        <Text style={styles.label}>Status</Text>
        <Text style={[styles.value, styles[appointment.status]]}>{appointment.status.toUpperCase()}</Text>
      </View>
      <View style={styles.buttonRow}>
        {appointment.status === 'pending' && (
          <TouchableOpacity style={styles.actionButton} onPress={() => updateStatus('confirmed')} disabled={loading}>
            <Text style={styles.actionButtonText}>Confirm</Text>
          </TouchableOpacity>
        )}
        {appointment.status !== 'canceled' && appointment.status !== 'completed' && (
          <TouchableOpacity style={styles.actionButton} onPress={() => updateStatus('canceled')} disabled={loading}>
            <Text style={styles.actionButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        {appointment.status === 'confirmed' && (
          <TouchableOpacity style={styles.actionButton} onPress={() => updateStatus('completed')} disabled={loading}>
            <Text style={styles.actionButtonText}>Mark Completed</Text>
          </TouchableOpacity>
        )}
        {/* Reschedule logic can be added here */}
      </View>
      {loading && <ActivityIndicator color={ORANGE} style={{ marginTop: 16 }} />}
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
  infoBox: {
    margin: 24,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  label: { fontSize: 15, color: ORANGE, fontWeight: 'bold', marginTop: 8 },
  value: { fontSize: 16, color: '#222', marginTop: 2 },
  pending: { color: '#FFB300' },
  confirmed: { color: '#2E7D32' },
  canceled: { color: '#D32F2F' },
  completed: { color: '#1976D2' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 24 },
  actionButton: {
    backgroundColor: ORANGE,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default BookingDetailsScreen; 