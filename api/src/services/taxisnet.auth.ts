const TAXISNET_TOKEN_URL  = process.env.TAXISNET_TOKEN_URL  ?? 'https://www1.gsis.gr/oauth2server/oauth/token';
const TAXISNET_INFO_URL   = process.env.TAXISNET_INFO_URL   ?? 'https://www1.gsis.gr/oauth2server/userinfo';
const TAXISNET_CLIENT_ID  = process.env.TAXISNET_CLIENT_ID  ?? '';
const TAXISNET_CLIENT_SECRET = process.env.TAXISNET_CLIENT_SECRET ?? '';

interface TaxisNetUserInfo {
  afm: string;
  fullName: string;
  email: string;
}

export async function exchangeTaxisNetCode(code: string, redirectUri: string): Promise<TaxisNetUserInfo> {
  if (process.env.SOCIAL_MOCK === 'true') {
    return { afm: '123456789', fullName: 'Δοκιμαστικός Χρήστης', email: `taxisnet-${code.slice(0, 8)}@gsis.gr` };
  }

  const tokenRes = await fetch(TAXISNET_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: TAXISNET_CLIENT_ID,
      client_secret: TAXISNET_CLIENT_SECRET,
    }).toString(),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    throw new Error(`TaxisNet token exchange failed: ${text}`);
  }

  const { access_token } = await tokenRes.json() as { access_token: string };

  const infoRes = await fetch(TAXISNET_INFO_URL, {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!infoRes.ok) {
    const text = await infoRes.text();
    throw new Error(`TaxisNet userinfo failed: ${text}`);
  }

  // GSIS returns different field names depending on the scope/version
  const info = await infoRes.json() as { afm?: string; vatNumber?: string; fullName?: string; name?: string; email?: string };
  const afm = info.afm ?? info.vatNumber ?? '';
  const fullName = info.fullName ?? info.name ?? 'TaxisNet User';
  const email = info.email ?? `${afm}@taxisnet.gr`;

  return { afm, fullName, email };
}
