import { NavigationContainer } from '@react-navigation/native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { doc, updateDoc } from 'firebase/firestore';
import React, { PropsWithChildren, useEffect, useRef } from 'react';
import { Alert, StatusBar } from 'react-native';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { db } from './firebase/config';
import RootNavigator from './navigation/RootNavigator';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const NotificationSetup: React.FC<PropsWithChildren> = ({ children }) => {
  const { user } = useAuthContext();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    (async () => {
      if (!user) return;
      let token;
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          Alert.alert('Permission required', 'Enable notifications to receive updates.');
          return;
        }
        token = (await Notifications.getExpoPushTokenAsync()).data;
        // Save token to Firestore user profile
        if (token && user.uid) {
          await updateDoc(doc(db, 'users', user.uid), { expoPushToken: token });
        }
      } else {
        Alert.alert('Must use physical device for Push Notifications');
      }
    })();

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      // Optionally show custom in-app banner/toast here
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      // Navigate to relevant screen based on notification data
    });

    return () => {
      if (notificationListener.current) Notifications.removeNotificationSubscription(notificationListener.current);
      if (responseListener.current) Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [user]);

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationSetup>
        <NavigationContainer>
          <StatusBar backgroundColor="#FF6600" barStyle="light-content" />
          <RootNavigator />
        </NavigationContainer>
      </NotificationSetup>
    </AuthProvider>
  );
} 