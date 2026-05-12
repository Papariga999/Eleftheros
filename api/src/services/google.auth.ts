interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
}

export async function verifyGoogleToken(idToken: string): Promise<GoogleUserInfo> {
  if (process.env.SOCIAL_MOCK === 'true') {
    const parts = idToken.split('.');
    if (parts.length === 3) {
      try {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
        return { sub: payload.sub ?? 'mock-google-sub', email: payload.email ?? 'mock@google.com', name: payload.name ?? 'Mock User' };
      } catch { /* fall through to defaults */ }
    }
    return { sub: `mock-${idToken.slice(0, 12)}`, email: 'mock-google@example.com', name: 'Mock Google User' };
  }

  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
  if (!res.ok) throw new Error('Invalid Google ID token');
  const data = await res.json() as { sub: string; email: string; name: string; email_verified: string };
  if (!data.email_verified || data.email_verified === 'false') throw new Error('Google email not verified');
  return { sub: data.sub, email: data.email, name: data.name };
}
