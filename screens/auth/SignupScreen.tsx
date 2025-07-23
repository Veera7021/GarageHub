import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const ORANGE = '#FF8800';

type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  SignupStep2: { email: string; password: string };
};

const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const SignupScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const handleNext = () => {
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    navigation.navigate('SignupStep2', { email, password });
  };

  const handleLoginNavigate = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Create your GarageHub Account</Text>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#aaa"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#aaa"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>
      <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.7}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.loginLink} onPress={handleLoginNavigate} activeOpacity={0.7}>
        <Text style={styles.loginLinkText}>Already have an account? <Text style={styles.loginLinkTextBold}>Log in</Text></Text>
      </TouchableOpacity>
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
  nextButton: {
    backgroundColor: ORANGE,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    alignSelf: 'center',
    marginTop: 12,
  },
  loginLinkText: {
    color: '#888',
    fontSize: 15,
  },
  loginLinkTextBold: {
    color: ORANGE,
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default SignupScreen; 