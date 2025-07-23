import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../firebase/config';

const ORANGE = '#FF6600';

type Appointment = {
  id: string;
  service: string;
  car?: { id: string; name: string };
  date: string;
  time: string;
  merchantId?: string;
  merchantName?: string;
  status: 'pending' | 'confirmed' | 'canceled' | 'completed';
  notes?: string;
};

type AppointmentDetailsRoute = RouteProp<{ AppointmentDetails: { appointment: Appointment } }, 'AppointmentDetails'>;

const AppointmentDetailsScreen: React.FC = () => {
  const route = useRoute<AppointmentDetailsRoute>();
  const navigation = useNavigation();
  const [appointment, setAppointment] = useState<Appointment>(route.params.appointment);
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    Alert.alert('Cancel Appointment', 'Are you sure you want to cancel this appointment?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await updateDoc(doc(db, 'appointments', appointment.id), { status: 'canceled' });
            setAppointment({ ...appointment, status: 'canceled' });
            // Optional: notify merchant
            if (appointment.merchantId) {
              const merchantDoc = await getDoc(doc(db, 'users', appointment.merchantId));
              const merchantData = merchantDoc.data();
              if (merchantData?.expoPushToken) {
                await Notifications.scheduleNotificationAsync({
                  content: {
                    title: 'Booking Canceled',
                    body: `A booking for ${appointment.service || appointment.car?.name} was canceled.`,
                    data: { type: 'booking', appointmentId: appointment.id },
                    color: ORANGE,
                  },
                  trigger: null,
                  to: merchantData.expoPushToken,
                } as any);
              }
            }
            setLoading(false);
            Alert.alert('Canceled', 'Appointment canceled.');
            navigation.goBack();
          } catch (error: any) {
            setLoading(false);
            Alert.alert('Error', error.message || 'Failed to cancel appointment.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Appointment Details</Text></View>
      <View style={styles.infoBox}>
        <Text style={styles.label}>Service/Car</Text>
        <Text style={styles.value}>{appointment.service || appointment.car?.name}</Text>
        <Text style={styles.label}>Merchant</Text>
        <Text style={styles.value}>{appointment.merchantName || 'N/A'}</Text>
        <Text style={styles.label}>Date & Time</Text>
        <Text style={styles.value}>{appointment.date} {appointment.time}</Text>
        <Text style={styles.label}>Status</Text>
        <Text style={[styles.value, styles[appointment.status]]}>{appointment.status.toUpperCase()}</Text>
        {appointment.notes && (
          <>
            <Text style={styles.label}>Notes</Text>
            <Text style={styles.value}>{appointment.notes}</Text>
          </>
        )}
      </View>
      {['pending', 'confirmed'].includes(appointment.status) && (
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} activeOpacity={0.7} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.cancelButtonText}>Cancel Appointment</Text>}
        </TouchableOpacity>
      )}
      {/* Optional: Add Reschedule button here */}
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
  pending: { color: ORANGE },
  confirmed: { color: ORANGE },
  canceled: { color: '#D32F2F' },
  completed: { color: '#2E7D32' },
  cancelButton: {
    backgroundColor: ORANGE,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 32,
  },
  cancelButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default AppointmentDetailsScreen; 