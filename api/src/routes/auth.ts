import bcrypt from 'bcryptjs';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import * as store from '../services/store.js';
import { seedDemoData } from '../services/store.js';
import { verifyGoogleToken } from '../services/google.auth.js';
import { verifyAppleToken } from '../services/apple.auth.js';
import { exchangeTaxisNetCode } from '../services/taxisnet.auth.js';
import type { AuthTokenPayload, SocialProvider, User } from '../types/index.js';

const router = Router();

// ── POST /auth/register ───────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { email, password, fullName, afm } = req.body as {
    email?: string; password?: string; fullName?: string; afm?: string;
  };

  if (!email || !password || !fullName || !afm) {
    res.status(400).json({ error: 'email, password, fullName, afm are required' });
    return;
  }
  if (!/^\d{9}$/.test(afm)) {
    res.status(400).json({ error: 'afm must be exactly 9 digits' });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'password must be at least 8 characters' });
    return;
  }

  const existing = await store.findUserByEmail(email);
  if (existing) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user: User = {
    id: uuid(),
    email: email.toLowerCase(),
    passwordHash,
    fullName,
    afm,
    createdAt: new Date().toISOString(),
  };

  await store.createUser(user);

  // Seed demo invoices + expenses so the dashboard is not empty on first login
  if (process.env.NODE_ENV !== 'production') {
    seedDemoData(user.id);
  }

  const token = signToken(user);
  res.status(201).json({ token, user: publicUser(user) });
});

// ── POST /auth/login ──────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }

  const user = await store.findUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  if (!user.passwordHash) {
    res.status(401).json({ error: 'This account uses social sign-in. Please use Google, Apple, or TaxisNet.' });
    return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

// ── POST /auth/social ─────────────────────────────────────────────────────────
// Accepts Google ID token, Apple identity token, or TaxisNet auth code.
// Creates account on first sign-in; returns JWT on every call.
router.post('/social', async (req, res) => {
  const { provider, token, name, redirectUri } = req.body as {
    provider?: string; token?: string; name?: string; redirectUri?: string;
  };

  if (!provider || !token) {
    res.status(400).json({ error: 'provider and token are required' });
    return;
  }

  let socialId: string;
  let email: string;
  let fullName: string;
  let afm = '';

  try {
    if (provider === 'google') {
      const info = await verifyGoogleToken(token);
      socialId = `google:${info.sub}`;
      email = info.email;
      fullName = info.name;
    } else if (provider === 'apple') {
      const info = verifyAppleToken(token);
      socialId = `apple:${info.sub}`;
      email = info.email;
      fullName = name ?? 'Apple User';
    } else if (provider === 'taxisnet') {
      const info = await exchangeTaxisNetCode(token, redirectUri ?? '');
      socialId = `taxisnet:${info.afm}`;
      email = info.email;
      fullName = info.fullName;
      afm = info.afm;
    } else {
      res.status(400).json({ error: 'Unknown provider. Use google, apple, or taxisnet' });
      return;
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Social auth failed';
    res.status(401).json({ error: msg });
    return;
  }

  let user = await store.findUserByEmail(email);
  if (!user) {
    user = await store.createUser({
      id: uuid(),
      email: email.toLowerCase(),
      passwordHash: undefined,
      socialProvider: provider as SocialProvider,
      socialId,
      fullName,
      afm,
      createdAt: new Date().toISOString(),
    });
    if (process.env.NODE_ENV !== 'production') {
      seedDemoData(user.id);
    }
  }

  const jwtToken = signToken(user);
  res.json({ token: jwtToken, user: publicUser(user) });
});

// ── GET /auth/me ──────────────────────────────────────────────────────────────
router.get('/me', async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) { res.status(401).json({ error: 'Unauthorized' }); return; }
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET!) as AuthTokenPayload;
    const user = await store.findUserById(payload.userId);
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json(publicUser(user));
  } catch {
    res.status(401).json({ error: 'Token invalid or expired' });
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function signToken(user: User): string {
  const payload: AuthTokenPayload = { userId: user.id, email: user.email, afm: user.afm };
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']) ?? '7d',
  });
}

function publicUser(user: User) {
  const { passwordHash: _, ...pub } = user;
  return pub;
}

export default router;
