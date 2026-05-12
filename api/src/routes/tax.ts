import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import * as store from '../services/store.js';
import type { TaxOverview } from '../types/index.js';

const router = Router();
router.use(authenticate);

// ── GET /tax/overview ─────────────────────────────────────────────────────────
// Computes tax overview from stored invoices.
router.get('/overview', async (req, res) => {
  const year = Number(req.query.year ?? new Date().getFullYear());
  const invoices = await store.listInvoices(req.user!.userId);

  // Group revenue by month for the requested year
  const monthMap = new Map<string, number>();
  for (const inv of invoices) {
    if (inv.status === 'cancelled') continue;
    const ym = inv.issueDate.slice(0, 7); // "YYYY-MM"
    if (!ym.startsWith(String(year))) continue;
    monthMap.set(ym, (monthMap.get(ym) ?? 0) + inv.totalNetValue);
  }

  // Fill all 12 months (0 if no invoices)
  const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
    const m = String(i + 1).padStart(2, '0');
    const key = `${year}-${m}`;
    return { month: key, amount: monthMap.get(key) ?? 0 };
  });

  const totalRevenue = monthlyRevenue.reduce((s, m) => s + m.amount, 0);

  // Greek income tax — simplified progressive scale 2025
  const estimatedIncomeTax = greekIncomeTax(totalRevenue);

  // EFKA — category 2 (freelancer, < 5 years)
  const efkaMonthly = 237;

  // Days into year
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const yearProgressDays = Math.floor((now.getTime() - startOfYear.getTime()) / 86_400_000) + 1;

  // VAT alert: Q2 due date (simplified — real deadlines depend on AADEcalendar)
  const dueDate = `${year}-05-22`;
  const daysRemaining = Math.floor((new Date(dueDate).getTime() - now.getTime()) / 86_400_000);

  const overview: TaxOverview = {
    year,
    monthlyRevenue,
    totalRevenue,
    estimatedIncomeTax,
    efkaMonthly,
    yearProgressDays,
    vatAlerts: daysRemaining > 0 ? [{
      period: 'Q1',
      dueDate,
      amount: 0,  // TODO: compute from actual VAT collected
      daysRemaining,
    }] : [],
  };

  res.json(overview);
});

// ── Greek income tax (freelancer — simplified 2025 scale) ─────────────────────
function greekIncomeTax(annualIncome: number): number {
  const brackets = [
    { limit: 10_000, rate: 0.09 },
    { limit: 20_000, rate: 0.22 },
    { limit: 30_000, rate: 0.28 },
    { limit: 40_000, rate: 0.36 },
    { limit: Infinity, rate: 0.44 },
  ];

  let tax = 0;
  let remaining = annualIncome;
  let prev = 0;

  for (const { limit, rate } of brackets) {
    if (remaining <= 0) break;
    const slice = Math.min(remaining, limit - prev);
    tax += slice * rate;
    remaining -= slice;
    prev = limit;
  }

  // Freelancer surcharge: +50% on computed tax if income > 10,000
  if (annualIncome > 10_000) tax *= 1.5;

  return Math.round(tax);
}

export default router;
