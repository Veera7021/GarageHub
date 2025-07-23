import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import DashboardScreen from '../screens/customer/DashboardScreen';
import MarketplaceScreen from '../screens/customer/MarketplaceScreen';
import MyVehiclesScreen from '../screens/customer/MyVehiclesScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import ServicesScreen from '../screens/customer/ServicesScreen';

const Tab = createBottomTabNavigator();

const CustomerStack: React.FC = () => (
  <Tab.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#FF6600' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' as 'bold' },
      tabBarActiveTintColor: '#FF6600',
      tabBarInactiveTintColor: '#888',
      tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' as 'bold', paddingBottom: 2 },
      tabBarStyle: { backgroundColor: '#fff', paddingVertical: 4 },
    }}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Services" component={ServicesScreen} />
    <Tab.Screen name="Marketplace" component={MarketplaceScreen} />
    <Tab.Screen name="My Vehicles" component={MyVehiclesScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export default CustomerStack; 