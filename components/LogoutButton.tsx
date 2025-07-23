import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { signOut } from 'firebase/auth';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { auth } from '../firebase/config';

const ORANGE = '#FF8800';

type AuthStackParamList = {
  Login: undefined;
};

const LogoutButton: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Login');
    } catch (error: any) {
      // Optionally handle error
      alert('Logout failed: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleLogout} activeOpacity={0.7}>
      <Text style={styles.buttonText}>Logout</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: ORANGE,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LogoutButton; 