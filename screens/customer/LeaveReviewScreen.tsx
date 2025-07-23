import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuthContext } from '../../context/AuthContext';
import { db } from '../../firebase/config';

const ORANGE = '#FF6600';

const MAX_STARS = 5;

// Route params
interface LeaveReviewParams {
  appointmentId: string;
  merchantId: string;
  serviceName: string;
}

type LeaveReviewRoute = RouteProp<{ LeaveReview: LeaveReviewParams }, 'LeaveReview'>;

const LeaveReviewScreen: React.FC = () => {
  const { user } = useAuthContext();
  const route = useRoute<LeaveReviewRoute>();
  const navigation = useNavigation();
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleStarPress = (star: number) => {
    setRating(star);
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Login required', 'Please log in to leave a review.');
      return;
    }
    if (!rating) {
      Alert.alert('Rating required', 'Please select a star rating.');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        appointmentId: route.params.appointmentId,
        merchantId: route.params.merchantId,
        userId: user.uid,
        serviceName: route.params.serviceName,
        rating,
        review,
        timestamp: Date.now(),
      });
      setLoading(false);
      Alert.alert('Thank you!', 'Your review has been submitted.');
      navigation.goBack();
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Failed to submit review.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Leave a Review</Text></View>
      <Text style={styles.label}>Service: {route.params.serviceName}</Text>
      <View style={styles.starsRow}>
        {[...Array(MAX_STARS)].map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => handleStarPress(i + 1)}
            activeOpacity={0.7}
          >
            <Text style={[styles.star, rating > i ? styles.starActive : styles.starInactive]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        style={styles.input}
        value={review}
        onChangeText={setReview}
        placeholder="Write your review..."
        placeholderTextColor="#aaa"
        multiline
        numberOfLines={4}
      />
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.7} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Submit Review</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  header: {
    backgroundColor: '#fff',
    paddingTop: 24,
    paddingBottom: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ORANGE,
    letterSpacing: 1,
  },
  label: { fontSize: 16, color: ORANGE, fontWeight: 'bold', marginBottom: 12 },
  starsRow: { flexDirection: 'row', marginBottom: 18 },
  star: { fontSize: 32, marginHorizontal: 4 },
  starActive: { color: ORANGE },
  starInactive: { color: '#eee' },
  input: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
    color: '#222',
    marginBottom: 18,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: ORANGE,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default LeaveReviewScreen; 