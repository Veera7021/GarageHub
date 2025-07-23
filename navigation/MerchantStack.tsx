import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import AppointmentsScreen from '../screens/merchant/AppointmentsScreen';
import BookingDetailsScreen from '../screens/merchant/BookingDetailsScreen';
import CarFormScreen from '../screens/merchant/CarFormScreen';
import DashboardScreen from '../screens/merchant/DashboardScreen';
import ProfileScreen from '../screens/merchant/ProfileScreen';
import ServicesScreen from '../screens/merchant/ServicesScreen';
import ServiceTeamManagementScreen from '../screens/merchant/ServiceTeamManagementScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ORANGE = '#FF6600';

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: ORANGE },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' as 'bold' },
      tabBarActiveTintColor: ORANGE,
      tabBarInactiveTintColor: '#888',
      tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' as 'bold', paddingBottom: 2 },
      tabBarStyle: { backgroundColor: '#fff', paddingVertical: 4 },
    }}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Services" component={ServicesScreen} />
    <Tab.Screen name="Appointments" component={AppointmentsScreen} />
    <Tab.Screen name="Service/Team Management" component={ServiceTeamManagementScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const MerchantStack: React.FC = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Tabs"
      component={TabNavigator}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="CarForm"
      component={CarFormScreen}
      options={{
        headerStyle: { backgroundColor: ORANGE },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' as 'bold' },
        title: 'Car Form',
      }}
    />
    <Stack.Screen
      name="BookingDetails"
      component={BookingDetailsScreen}
      options={{
        headerStyle: { backgroundColor: ORANGE },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' as 'bold' },
        title: 'Booking Details',
      }}
    />
  </Stack.Navigator>
);

export default MerchantStack; 