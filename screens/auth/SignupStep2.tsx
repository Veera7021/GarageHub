import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const ORANGE = '#FF8800';

type AuthStackParamList = {
  Signup: undefined;
  SignupStep2: { email: string; password: string };
  SignupStep3: { email: string; password: string; fullName: string; phone: string; userType: 'customer' | 'merchant' };
};

const userTypes = [
  { label: 'Customer', value: 'customer' },
  { label: 'Merchant', value: 'merchant' },
];

const SignupStep2: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const route = useRoute<RouteProp<AuthStackParamList, 'SignupStep2'>>();
  const { email, password } = route.params || {};

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState<'customer' | 'merchant'>('customer');

  const handleNext = () => {
    if (!fullName.trim()) {
      Alert.alert('Missing Name', 'Please enter your full name.');
      return;
    }
    if (!/^\d{10,}$/.test(phone)) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number.');
      return;
    }
    if (!email || !password) {
      Alert.alert('Error', 'Missing email or password from previous step.');
      navigation.navigate('Signup');
      return;
    }
    navigation.navigate('SignupStep3', { email, password, fullName, phone, userType });
  };

  const handleBack = () => {
    navigation.navigate('Signup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Tell us about yourself</Text>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Full Name"
          placeholderTextColor="#aaa"
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
        />
        <TextInput
          placeholder="Phone Number"
          placeholderTextColor="#aaa"
          style={styles.input}
          keyboardType="number-pad"
          value={phone}
          onChangeText={text => setPhone(text.replace(/[^0-9]/g, ''))}
          maxLength={15}
        />
        <View style={styles.userTypeContainer}>
          {userTypes.map(type => (
            <TouchableOpacity
              key={type.value}
              style={styles.radioRow}
              onPress={() => setUserType(type.value as 'customer' | 'merchant')}
              activeOpacity={0.7}
            >
              <View style={[styles.radioOuter, userType === type.value && styles.radioOuterSelected]}>
                {userType === type.value && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioLabel}>{type.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.7}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: ORANGE,
    alignSelf: 'center',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderColor: ORANGE,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#222',
    backgroundColor: '#fff',
  },
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  radioOuterSelected: {
    borderColor: ORANGE,
    backgroundColor: '#fff',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: ORANGE,
  },
  radioLabel: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  backButton: {
    backgroundColor: '#fff',
    borderColor: ORANGE,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  backButtonText: {
    color: ORANGE,
    fontSize: 18,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: ORANGE,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SignupStep2; 