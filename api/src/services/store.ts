/**
 * Supabase-backed store. Falls back to in-memory Maps when SUPABASE_URL is not set
 * (useful for unit tests or quick local runs without a DB).
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import type { Expense, Invoice, User } from '../types/index.js';

// ── Client ────────────────────────────────────────────────────────────────────

let sb: SupabaseClient | null = null;

function getDb(): SupabaseClient {
  if (!sb) {
    sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  }
  return sb;
}

const USE_DB = !!process.env.SUPABASE_URL;

// ── In-memory fallback ────────────────────────────────────────────────────────

const _users    = new Map<string, User>();
const _invoices = new Map<string, Invoice>();
const _expenses = new Map<string, Expense>();

// ── Row mappers ───────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToUser(r: any): User {
  return {
    id: r.id, email: r.email,
    passwordHash: r.password_hash ?? undefined,
    socialProvider: r.social_provider ?? undefined,
    socialId: r.social_id ?? undefined,
    fullName: r.full_name, afm: r.afm ?? '',
    doy: r.doy ?? undefined,
    businessDescription: r.business_description ?? undefined,
    address: r.address ?? undefined, phone: r.phone ?? undefined,
    createdAt: r.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToInvoice(r: any): Invoice {
  return {
    id: r.id, userId: r.user_id,
    clientName: r.client_name, clientAfm: r.client_afm ?? undefined,
    clientCountry: r.client_country,
    series: r.series, aa: r.aa,
    issueDate: r.issue_date, invoiceType: r.invoice_type,
    currency: r.currency, lines: r.lines,
    totalNetValue: Number(r.total_net_value),
    totalVatAmount: Number(r.total_vat_amount),
    totalGrossValue: Number(r.total_gross_value),
    status: r.status,
    mark: r.mark ?? undefined, uid: r.uid ?? undefined,
    authenticationCode: r.authentication_code ?? undefined,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToExpense(r: any): Expense {
  return {
    id: r.id, userId: r.user_id,
    name: r.name, category: r.category,
    amount: Number(r.amount), date: r.date,
    receiptUrl: r.receipt_url ?? undefined,
    notes: r.notes ?? undefined, createdAt: r.created_at,
  };
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function findUserByEmail(email: string): Promise<User | undefined> {
  if (!USE_DB) return [..._users.values()].find(u => u.email === email.toLowerCase());
  const { data } = await getDb().from('users').select('*').eq('email', email.toLowerCase()).maybeSingle();
  return data ? rowToUser(data) : undefined;
}

export async function findUserById(id: string): Promise<User | undefined> {
  if (!USE_DB) return _users.get(id);
  const { data } = await getDb().from('users').select('*').eq('id', id).maybeSingle();
  return data ? rowToUser(data) : undefined;
}

export async function createUser(user: User): Promise<User> {
  if (!USE_DB) { _users.set(user.id, user); return user; }
  await getDb().from('users').insert({
    id: user.id, email: user.email.toLowerCase(),
    password_hash: user.passwordHash ?? null,
    social_provider: user.socialProvider ?? null,
    social_id: user.socialId ?? null,
    full_name: user.fullName, afm: user.afm,
    doy: user.doy ?? null,
    business_description: user.businessDescription ?? null,
    address: user.address ?? null, phone: user.phone ?? null,
    created_at: user.createdAt,
  });
  return user;
}

export async function updateUser(id: string, patch: Partial<User>): Promise<User | undefined> {
  if (!USE_DB) {
    const existing = _users.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...patch };
    _users.set(id, updated);
    return updated;
  }
  const { data } = await getDb().from('users').update({
    full_name: patch.fullName, afm: patch.afm,
    doy: patch.doy ?? null,
    business_description: patch.businessDescription ?? null,
    address: patch.address ?? null, phone: patch.phone ?? null,
  }).eq('id', id).select().maybeSingle();
  return data ? rowToUser(data) : undefined;
}

// ── Invoices ──────────────────────────────────────────────────────────────────

export async function listInvoices(userId: string): Promise<Invoice[]> {
  if (!USE_DB) return [..._invoices.values()].filter(i => i.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const { data } = await getDb().from('invoices').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return (data ?? []).map(rowToInvoice);
}

export async function findInvoice(id: string, userId: string): Promise<Invoice | undefined> {
  if (!USE_DB) { const inv = _invoices.get(id); return inv?.userId === userId ? inv : undefined; }
  const { data } = await getDb().from('invoices').select('*').eq('id', id).eq('user_id', userId).maybeSingle();
  return data ? rowToInvoice(data) : undefined;
}

export async function createInvoice(invoice: Invoice): Promise<Invoice> {
  if (!USE_DB) { _invoices.set(invoice.id, invoice); return invoice; }
  await getDb().from('invoices').insert({
    id: invoice.id, user_id: invoice.userId,
    client_name: invoice.clientName, client_afm: invoice.clientAfm ?? null,
    client_country: invoice.clientCountry,
    series: invoice.series, aa: invoice.aa,
    issue_date: invoice.issueDate, invoice_type: invoice.invoiceType,
    currency: invoice.currency, lines: invoice.lines,
    total_net_value: invoice.totalNetValue,
    total_vat_amount: invoice.totalVatAmount,
    total_gross_value: invoice.totalGrossValue,
    status: invoice.status,
    mark: invoice.mark ?? null, uid: invoice.uid ?? null,
    authentication_code: invoice.authenticationCode ?? null,
    created_at: invoice.createdAt, updated_at: invoice.updatedAt,
  });
  return invoice;
}

export async function updateInvoice(id: string, patch: Partial<Invoice>): Promise<Invoice | undefined> {
  if (!USE_DB) {
    const existing = _invoices.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    _invoices.set(id, updated);
    return updated;
  }
  const { data } = await getDb().from('invoices').update({
    status: patch.status, mark: patch.mark ?? null,
    uid: patch.uid ?? null, authentication_code: patch.authenticationCode ?? null,
    updated_at: new Date().toISOString(),
  }).eq('id', id).select().maybeSingle();
  return data ? rowToInvoice(data) : undefined;
}

// ── Expenses ──────────────────────────────────────────────────────────────────

export async function listExpenses(userId: string): Promise<Expense[]> {
  if (!USE_DB) return [..._expenses.values()].filter(e => e.userId === userId).sort((a, b) => b.date.localeCompare(a.date));
  const { data } = await getDb().from('expenses').select('*').eq('user_id', userId).order('date', { ascending: false });
  return (data ?? []).map(rowToExpense);
}

export async function findExpense(id: string, userId: string): Promise<Expense | undefined> {
  if (!USE_DB) { const exp = _expenses.get(id); return exp?.userId === userId ? exp : undefined; }
  const { data } = await getDb().from('expenses').select('*').eq('id', id).eq('user_id', userId).maybeSingle();
  return data ? rowToExpense(data) : undefined;
}

export async function createExpense(expense: Expense): Promise<Expense> {
  if (!USE_DB) { _expenses.set(expense.id, expense); return expense; }
  await getDb().from('expenses').insert({
    id: expense.id, user_id: expense.userId,
    name: expense.name, category: expense.category,
    amount: expense.amount, date: expense.date,
    receipt_url: expense.receiptUrl ?? null,
    notes: expense.notes ?? null, created_at: expense.createdAt,
  });
  return expense;
}

export async function deleteExpense(id: string, userId: string): Promise<boolean> {
  if (!USE_DB) {
    const exp = _expenses.get(id);
    if (!exp || exp.userId !== userId) return false;
    _expenses.delete(id);
    return true;
  }
  const { count } = await getDb().from('expenses').delete({ count: 'exact' }).eq('id', id).eq('user_id', userId);
  return (count ?? 0) > 0;
}

// ── Seed ──────────────────────────────────────────────────────────────────────

export async function seedDemoUser() {
  const email = 'demo@eleftheros.gr';
  const existing = await findUserByEmail(email);
  if (existing) {
    if (existing.afm !== '122296889') await updateUser(existing.id, { afm: '122296889' });
    return;
  }
  const passwordHash = await bcrypt.hash('demo1234', 10);
  const user: User = { id: uuid(), email, passwordHash, fullName: 'Γιώργης Παπαδόπουλος', afm: '122296889', createdAt: new Date().toISOString() };
  await createUser(user);
  await seedDemoData(user.id);
  console.log('  Demo user ready → demo@eleftheros.gr / demo1234');
}

export async function seedDemoData(userId: string) {
  const now = new Date().toISOString();
  const months = ['2025-08', '2025-09', '2025-10', '2025-11', '2025-12', '2026-01'];
  const amounts = [1820, 2150, 1980, 2640, 2210, 2480];
  const clients = ['Καππά Studio', 'Δημήτρης Παππάς', 'Aegean Tech', 'Olive & Co.', 'Καππά Studio', 'Δημήτρης Παππάς'];

  for (let idx = 0; idx < months.length; idx++) {
    const m = months[idx];
    await createInvoice({
      id: uuid(), userId,
      clientName: clients[idx], clientAfm: undefined, clientCountry: 'GR',
      series: 'A', aa: idx + 1,
      issueDate: `${m}-08`, invoiceType: '1.1', currency: 'EUR',
      lines: [{ description: 'Υπηρεσίες σχεδιασμού', quantity: 1, unitPrice: amounts[idx], vatRate: 24, netValue: amounts[idx], vatAmount: Math.round(amounts[idx] * 0.24 * 100) / 100 }],
      totalNetValue: amounts[idx],
      totalVatAmount: Math.round(amounts[idx] * 0.24 * 100) / 100,
      totalGrossValue: Math.round(amounts[idx] * 1.24 * 100) / 100,
      status: 'submitted', mark: `40000123456${idx}`,
      createdAt: `${m}-08T10:00:00.000Z`, updatedAt: `${m}-08T10:00:00.000Z`,
    });
  }

  const expData = [
    { name: 'Figma Professional', category: 'software' as const, amount: 15, date: '2026-01-06' },
    { name: 'Logitech MX Master 3', category: 'equipment' as const, amount: 119, date: '2026-01-04' },
    { name: 'Καύσιμα — πελάτης Αθήνα', category: 'transport' as const, amount: 42, date: '2026-01-03' },
    { name: 'Γραφική ύλη', category: 'office' as const, amount: 28, date: '2026-01-02' },
    { name: 'Adobe Creative Cloud', category: 'software' as const, amount: 60, date: '2026-01-01' },
  ];
  for (const e of expData) {
    await createExpense({ ...e, id: uuid(), userId, createdAt: now });
  }
}
