import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { auth as authApi, setToken } from '../services/api';

// Apple Sign-In is only available on iOS native builds (not Expo Go / Android).
export const isAppleAuthAvailable = Platform.OS === 'ios';

interface Options {
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export async function signInWithApple({ onSuccess, onError }: Options) {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    const identityToken = credential.identityToken;
    if (!identityToken) { onError('Apple did not return an identity token'); return; }

    // Apple only sends the full name on the very first sign-in
    const givenName = credential.fullName?.givenName ?? '';
    const familyName = credential.fullName?.familyName ?? '';
    const name = [givenName, familyName].filter(Boolean).join(' ') || undefined;

    const res = await authApi.social({ provider: 'apple', token: identityToken, name });
    await setToken(res.token);
    onSuccess();
  } catch (e: unknown) {
    // ERR_REQUEST_CANCELED means the user dismissed the sheet — not an error
    if ((e as { code?: string }).code === 'ERR_REQUEST_CANCELED') return;
    const msg = e instanceof Error ? e.message : 'Apple sign-in failed';
    onError(msg);
  }
}
