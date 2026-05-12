interface AppleUserInfo {
  sub: string;
  email: string;
}

export function verifyAppleToken(identityToken: string): AppleUserInfo {
  // Decode the JWT payload (base64url, middle segment)
  const parts = identityToken.split('.');
  if (parts.length !== 3) throw new Error('Invalid Apple identity token format');

  let payload: { sub?: string; email?: string; aud?: string };
  try {
    payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
  } catch {
    throw new Error('Failed to decode Apple identity token');
  }

  if (process.env.NODE_ENV === 'production' && process.env.SOCIAL_MOCK !== 'true') {
    // In production, aud should match your app's bundle ID
    const expected = process.env.APPLE_BUNDLE_ID;
    if (expected && payload.aud !== expected) {
      throw new Error('Apple token audience mismatch');
    }
    // Full signature verification with Apple JWKS is out of scope here;
    // integrate `apple-signin-auth` npm package when going to production.
  }

  const sub = payload.sub ?? '';
  const email = payload.email ?? `${sub}@privaterelay.appleid.com`;
  return { sub, email };
}
