import cors from 'cors';
import express from 'express';
import authRouter from './routes/auth.js';
import expensesRouter from './routes/expenses.js';
import invoicesRouter from './routes/invoices.js';
import taxRouter from './routes/tax.js';

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) { cb(null, true); return; }
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) { cb(null, true); return; }
    // In dev, allow any localhost port (Expo picks a free port, so it varies)
    if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      cb(null, true); return;
    }
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ ok: true, env: process.env.NODE_ENV }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/auth',     authRouter);
app.use('/invoices', invoicesRouter);
app.use('/expenses', expensesRouter);
app.use('/tax',      taxRouter);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

export default app;
