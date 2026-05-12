import { useEffect } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { auth as authApi, setToken } from '../services/api';

WebBrowser.maybeCompleteAuthSession();

const DISCOVERY: AuthSession.DiscoveryDocument = {
  authorizationEndpoint:
    process.env.EXPO_PUBLIC_TAXISNET_AUTH_URL ??
    'https://www1.gsis.gr/oauth2server/oauth/authorize',
  tokenEndpoint:
    process.env.EXPO_PUBLIC_TAXISNET_TOKEN_URL ??
    'https://www1.gsis.gr/oauth2server/oauth/token',
};

const CLIENT_ID = process.env.EXPO_PUBLIC_TAXISNET_CLIENT_ID ?? 'dev';
const REDIRECT_URI = AuthSession.makeRedirectUri({ scheme: 'eleftheros', path: 'auth/callback' });

interface Options {
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export function useTaxisNetAuth({ onSuccess, onError }: Options) {
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      redirectUri: REDIRECT_URI,
      scopes: ['openid', 'profile'],
      usePKCE: true,
    },
    DISCOVERY,
  );

  useEffect(() => {
    if (response?.type !== 'success') return;
    const { code } = response.params;
    if (!code) { onError('No authorization code returned from TaxisNet'); return; }

    authApi.social({ provider: 'taxisnet', token: code, redirectUri: REDIRECT_URI })
      .then(async res => { await setToken(res.token); onSuccess(); })
      .catch(e => onError(e.message ?? 'TaxisNet sign-in failed'));
  }, [response]);

  return {
    promptAsync,
    disabled: !request,
  };
}
