import { useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { auth as authApi, setToken } from '../services/api';

// Required so the browser tab can redirect back into the app
WebBrowser.maybeCompleteAuthSession();

interface Options {
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export function useGoogleAuth({ onSuccess, onError }: Options) {
  // Pass a placeholder so the hook doesn't throw when credentials are not yet configured.
  // The button is hidden via `configured` below when no real ID is set.
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? 'unconfigured',
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  const configured = !!(
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
  );

  useEffect(() => {
    if (response?.type !== 'success') return;
    const { id_token, access_token } = response.params;
    const token = id_token ?? access_token;
    if (!token) { onError('No token returned from Google'); return; }

    authApi.social({ provider: 'google', token })
      .then(async res => { await setToken(res.token); onSuccess(); })
      .catch(e => onError(e.message ?? 'Google sign-in failed'));
  }, [response]);

  return {
    promptAsync,
    disabled: !request || !configured,
    configured,
  };
}
