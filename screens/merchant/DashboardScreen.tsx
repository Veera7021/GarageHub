import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const DashboardScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Merchant Dashboard</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  text: { fontSize: 24, fontWeight: 'bold', color: '#FF8800' },
});

export default DashboardScreen; 