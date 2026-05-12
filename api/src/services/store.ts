/**
 * In-memory store — replace each map with a real DB (Supabase/Postgres) when ready.
 * Every method is async so swapping the implementation requires no route changes.
 */
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import type { Expense, Invoice, User } from '../types/index.js';

const users   = new Map<string, User>();
const invoices = new Map<string, Invoice>();
const expenses = new Map<string, Expense>();

// ── Users ─────────────────────────────────────────────────────────────────────

export async function findUserByEmail(email: string): Promise<User | undefined> {
  return [...users.values()].find(u => u.email === email.toLowerCase());
}

export async function findUserById(id: string): Promise<User | undefined> {
  return users.get(id);
}

export async function createUser(user: User): Promise<User> {
  users.set(user.id, user);
  return user;
}

export async function updateUser(id: string, patch: Partial<User>): Promise<User | undefined> {
  const existing = users.get(id);
  if (!existing) return undefined;
  const updated = { ...existing, ...patch };
  users.set(id, updated);
  return updated;
}

// ── Invoices ──────────────────────────────────────────────────────────────────

export async function listInvoices(userId: string): Promise<Invoice[]> {
  return [...invoices.values()]
    .filter(i => i.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function findInvoice(id: string, userId: string): Promise<Invoice | undefined> {
  const inv = invoices.get(id);
  return inv?.userId === userId ? inv : undefined;
}

export async function createInvoice(invoice: Invoice): Promise<Invoice> {
  invoices.set(invoice.id, invoice);
  return invoice;
}

export async function updateInvoice(id: string, patch: Partial<Invoice>): Promise<Invoice | undefined> {
  const existing = invoices.get(id);
  if (!existing) return undefined;
  const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
  invoices.set(id, updated);
  return updated;
}

// ── Expenses ──────────────────────────────────────────────────────────────────

export async function listExpenses(userId: string): Promise<Expense[]> {
  return [...expenses.values()]
    .filter(e => e.userId === userId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function findExpense(id: string, userId: string): Promise<Expense | undefined> {
  const exp = expenses.get(id);
  return exp?.userId === userId ? exp : undefined;
}

export async function createExpense(expense: Expense): Promise<Expense> {
  expenses.set(expense.id, expense);
  return expense;
}

export async function deleteExpense(id: string, userId: string): Promise<boolean> {
  const exp = expenses.get(id);
  if (!exp || exp.userId !== userId) return false;
  expenses.delete(id);
  return true;
}

// ── Demo user (dev only) ──────────────────────────────────────────────────────

export async function seedDemoUser() {
  const email = 'demo@eleftheros.gr';
  if (await findUserByEmail(email)) return; // already seeded
  const passwordHash = await bcrypt.hash('demo1234', 10);
  const user: User = {
    id: uuid(),
    email,
    passwordHash,
    fullName: 'Γιώργης Παπαδόπουλος',
    afm: '123456789',
    createdAt: new Date().toISOString(),
  };
  await createUser(user);
  seedDemoData(user.id);
  console.log('  Demo user ready → demo@eleftheros.gr / demo1234');
}

// ── Seed (dev only) ───────────────────────────────────────────────────────────

export function seedDemoData(userId: string) {
  const now = new Date().toISOString();
  const months = ['2024-12', '2025-01', '2025-02', '2025-03', '2025-04', '2025-05'];
  const amounts = [1820, 2150, 1980, 2640, 2210, 2480];

  months.forEach((m, idx) => {
    const id = `demo-inv-${idx}`;
    invoices.set(id, {
      id,
      userId,
      clientName: ['Καππά Studio', 'Δημήτρης Παππάς', 'Aegean Tech', 'Olive & Co.', 'Καππά Studio', 'Δημήτρης Παππάς'][idx],
      clientAfm: undefined,
      clientCountry: 'GR',
      series: 'A',
      aa: idx + 1,
      issueDate: `${m}-08`,
      invoiceType: '1.1',
      currency: 'EUR',
      lines: [{
        description: 'Υπηρεσίες σχεδιασμού',
        quantity: 1,
        unitPrice: amounts[idx],
        vatRate: 24,
        netValue: amounts[idx],
        vatAmount: Math.round(amounts[idx] * 0.24 * 100) / 100,
      }],
      totalNetValue: amounts[idx],
      totalVatAmount: Math.round(amounts[idx] * 0.24 * 100) / 100,
      totalGrossValue: Math.round(amounts[idx] * 1.24 * 100) / 100,
      status: 'submitted',
      mark: `40000123456${idx}`,
      createdAt: `${m}-08T10:00:00.000Z`,
      updatedAt: `${m}-08T10:00:00.000Z`,
    });
  });

  const expData = [
    { name: 'Figma Professional', category: 'software' as const, amount: 15, date: '2025-05-06' },
    { name: 'Logitech MX Master 3', category: 'equipment' as const, amount: 119, date: '2025-05-04' },
    { name: 'Καύσιμα — πελάτης Αθήνα', category: 'transport' as const, amount: 42, date: '2025-05-03' },
    { name: 'Γραφική ύλη', category: 'office' as const, amount: 28, date: '2025-05-02' },
    { name: 'Adobe Creative Cloud', category: 'software' as const, amount: 60, date: '2025-05-01' },
  ];
  expData.forEach((e, idx) => {
    const id = `demo-exp-${idx}`;
    expenses.set(id, { ...e, id, userId, createdAt: now });
  });
}
