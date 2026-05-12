import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { authenticate } from '../middleware/authenticate.js';
import * as store from '../services/store.js';
import type { CreateExpenseBody, Expense } from '../types/index.js';

const router = Router();
router.use(authenticate);

// ── GET /expenses ─────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  const list = await store.listExpenses(req.user!.userId);
  res.json(list);
});

// ── POST /expenses ────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const body = req.body as CreateExpenseBody;
  const { name, category, amount, date } = body;

  if (!name || !category || amount == null || !date) {
    res.status(400).json({ error: 'name, category, amount, date are required' });
    return;
  }

  const VALID_CATS = ['software', 'equipment', 'transport', 'office', 'other'];
  if (!VALID_CATS.includes(category)) {
    res.status(400).json({ error: `category must be one of: ${VALID_CATS.join(', ')}` });
    return;
  }

  const expense: Expense = {
    id: uuid(),
    userId: req.user!.userId,
    name,
    category,
    amount: Math.round(amount * 100) / 100,
    date,
    notes: body.notes,
    createdAt: new Date().toISOString(),
  };

  await store.createExpense(expense);
  res.status(201).json(expense);
});

// ── DELETE /expenses/:id ──────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  const deleted = await store.deleteExpense(req.params.id, req.user!.userId);
  if (!deleted) { res.status(404).json({ error: 'Expense not found' }); return; }
  res.status(204).send();
});

export default router;
