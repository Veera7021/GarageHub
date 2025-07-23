import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';
import CustomerStack from './CustomerStack';
import MerchantStack from './MerchantStack';

const Stack = createNativeStackNavigator();
const ORANGE = '#FF6600';

const RootNavigator: React.FC = () => {
  const { user, profile, loading } = useAuthContext();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color={ORANGE} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : profile?.userType === 'customer' ? (
        <Stack.Screen name="Customer" component={CustomerStack} />
      ) : profile?.userType === 'merchant' ? (
        <Stack.Screen name="Merchant" component={MerchantStack} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
      <Stack.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: ORANGE },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' as 'bold' },
          title: 'Chats',
        }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => {
          const params = route.params as { otherUserName?: string };
          return {
            headerShown: true,
            headerStyle: { backgroundColor: ORANGE },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' as 'bold' },
            title: params?.otherUserName || 'Chat',
          };
        }}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator; 