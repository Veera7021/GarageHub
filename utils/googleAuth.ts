import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import * as React from 'react';

WebBrowser.maybeCompleteAuthSession();

const auth = getAuth();

export function useGoogleSignIn() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: 'YOUR_GOOGLE_CLIENT_ID',
    iosClientId: '', // Optional: add your iOS client ID
    androidClientId: '', // Optional: add your Android client ID
    webClientId: 'YOUR_GOOGLE_CLIENT_ID',
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.authentication?.idToken;
      if (idToken) {
        const credential = GoogleAuthProvider.credential(idToken);
        signInWithCredential(auth, credential);
      }
    }
  }, [response]);

  return { promptAsync };
} 