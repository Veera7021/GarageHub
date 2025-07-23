import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LogoutButton from '../../components/LogoutButton';

const DashboardScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the Dashboard!</Text>
      <LogoutButton />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF8800',
  },
});

export default DashboardScreen; 