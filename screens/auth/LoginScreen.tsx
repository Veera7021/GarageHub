import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useGoogleSignIn } from '../../utils/googleAuth';

const ORANGE = '#FF8800';

type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const { promptAsync } = useGoogleSignIn();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const handleLogin = async () => {
    await login(email, password);
    if (error) {
      Alert.alert('Login Failed', error);
    } else {
      Alert.alert('Login Success');
    }
  };

  const handleSignupNavigate = () => {
    navigation.navigate('Signup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>GarageHub</Text>
      <Text style={styles.subtitle}>Welcome back! Please log in.</Text>
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
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading} activeOpacity={0.7}>
        <Text style={styles.loginButtonText}>{loading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>
      <View style={styles.socialContainer}>
        <TouchableOpacity style={styles.socialButton} onPress={() => promptAsync()} activeOpacity={0.7}>
          <AntDesign name="google" size={24} color={ORANGE} />
          <Text style={styles.socialText}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
          <AntDesign name="apple1" size={24} color={ORANGE} />
          <Text style={styles.socialText}>Apple</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>
      <View style={styles.bottomTextContainer}>
        <Text style={styles.bottomText}>Don't have an account? </Text>
        <TouchableOpacity onPress={handleSignupNavigate} activeOpacity={0.7}>
          <Text style={styles.signUpText}>Sign up</Text>
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
    fontSize: 32,
    fontWeight: 'bold',
    color: ORANGE,
    alignSelf: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    alignSelf: 'center',
    marginBottom: 32,
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
  loginButton: {
    backgroundColor: ORANGE,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ORANGE,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 4,
    backgroundColor: '#fff',
  },
  socialText: {
    color: ORANGE,
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
  forgotText: {
    color: ORANGE,
    alignSelf: 'center',
    marginBottom: 32,
    fontWeight: '500',
  },
  bottomTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
  },
  bottomText: {
    color: '#888',
    fontSize: 15,
  },
  signUpText: {
    color: ORANGE,
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default LoginScreen; 