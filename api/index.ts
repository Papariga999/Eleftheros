// Vercel serverless entry point — exports the Express app
import type { Request, Response } from 'express';
import app from './src/app.js';
import { seedDemoUser } from './src/services/store.js';

// Module-level promise — starts immediately on cold start.
// Each request awaits it so the first login never races the seed.
const ready = seedDemoUser().catch(console.error);

export default async function handler(req: Request, res: Response) {
  await ready;
  return app(req, res);
}
