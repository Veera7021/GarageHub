import DateTimePicker from '@react-native-community/datetimepicker';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuthContext } from '../../context/AuthContext';
import { db } from '../../firebase/config';

const ORANGE = '#FF6600';

const SERVICES = [
  'General Service',
  'Oil Change',
  'Tire Rotation',
  'Brake Inspection',
  'Car Wash',
];

type Car = {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  make?: string;
  model?: string;
  year?: number;
  specs?: string;
};

type BookingScreenRouteParams = {
  car?: Car;
  service?: string;
  merchantId?: string;
};

type BookingScreenRoute = RouteProp<{ Booking: BookingScreenRouteParams }, 'Booking'>;

const BookingScreen: React.FC = () => {
  const { user } = useAuthContext();
  const route = useRoute<BookingScreenRoute>();
  const navigation = useNavigation();
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [service, setService] = useState(route.params?.service || SERVICES[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const car = route.params?.car;
  const merchantId = route.params?.merchantId || '';

  const onChangeDate = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Login required', 'Please log in to book an appointment.');
      return;
    }
    if (!merchantId) {
      Alert.alert('Error', 'Merchant not specified.');
      return;
    }
    setLoading(true);
    try {
      const appointment = {
        userId: user.uid,
        merchantId,
        service: car ? car.name : service,
        car: car ? { id: car.id, name: car.name } : undefined,
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString(),
        notes,
        status: 'pending',
        createdAt: Date.now(),
      };
      const docRef = await addDoc(collection(db, 'appointments'), appointment);
      // Notify merchant if FCM token exists
      const merchantDoc = await getDoc(doc(db, 'users', merchantId));
      const merchantData = merchantDoc.data();
      if (merchantData?.expoPushToken) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'New Booking',
            body: `You have a new booking for ${appointment.service}.`,
            data: { type: 'booking', appointmentId: docRef.id },
            color: ORANGE,
          },
          trigger: null,
          to: merchantData.expoPushToken,
        } as any); // Expo client can't send push, but this is for server-side
      }
      setLoading(false);
      Alert.alert('Success', 'Booking submitted!');
      navigation.goBack();
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Failed to submit booking.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Book Appointment</Text>
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Date & Time</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.inputText}>{date.toLocaleString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={onChangeDate}
            minimumDate={new Date()}
          />
        )}
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Service</Text>
        <View style={styles.serviceRow}>
          {SERVICES.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.serviceButton, service === s && styles.serviceButtonActive]}
              onPress={() => setService(s)}
              activeOpacity={0.7}
            >
              <Text style={[styles.serviceButtonText, service === s && styles.serviceButtonTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add any notes..."
          multiline
        />
      </View>
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.7} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Book Now</Text>}
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
  formGroup: { marginHorizontal: 20, marginTop: 18 },
  label: { fontSize: 15, color: ORANGE, fontWeight: 'bold', marginBottom: 6 },
  input: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
    color: '#222',
    marginBottom: 8,
  },
  inputText: { color: '#222', fontSize: 16 },
  serviceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  serviceButton: {
    backgroundColor: '#fff',
    borderColor: ORANGE,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceButtonActive: { backgroundColor: ORANGE },
  serviceButtonText: { color: ORANGE, fontWeight: 'bold', fontSize: 14 },
  serviceButtonTextActive: { color: '#fff' },
  submitButton: {
    backgroundColor: ORANGE,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 32,
  },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default BookingScreen; 