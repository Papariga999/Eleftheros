/**
 * Central API client for the Eleftheros backend.
 * Set API_BASE_URL in your .env / app.config.js to point at the running server.
 * Falls back to localhost:3001 for local development.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

// ── Token helpers ─────────────────────────────────────────────────────────────

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem('authToken');
}

export async function setToken(token: string): Promise<void> {
  return AsyncStorage.setItem('authToken', token);
}

export async function clearToken(): Promise<void> {
  return AsyncStorage.removeItem('authToken');
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = await getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, body.error ?? 'Unknown error');
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface PublicUser {
  id: string;
  email: string;
  fullName: string;
  afm: string;
  doy?: string;
  businessDescription?: string;
  address?: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: PublicUser;
}

export const auth = {
  register: (body: { email: string; password: string; fullName: string; afm: string }) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(body) }, false),

  login: (body: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }, false),

  social: (body: { provider: 'google' | 'apple' | 'taxisnet'; token: string; name?: string; redirectUri?: string }) =>
    request<AuthResponse>('/auth/social', { method: 'POST', body: JSON.stringify(body) }, false),

  me: () => request<PublicUser>('/auth/me'),
};

// ── Invoices ──────────────────────────────────────────────────────────────────

export type InvoiceStatus = 'draft' | 'submitted' | 'cancelled';
export type VatRate = 0 | 13 | 24;

export interface Invoice {
  id: string;
  clientName: string;
  clientAfm?: string;
  clientCountry: string;
  series: string;
  aa: number;
  issueDate: string;
  invoiceType: string;
  currency: string;
  lines: { description: string; quantity: number; unitPrice: number; vatRate: VatRate; netValue: number; vatAmount: number }[];
  totalNetValue: number;
  totalVatAmount: number;
  totalGrossValue: number;
  status: InvoiceStatus;
  mark?: string;
  uid?: string;
  authenticationCode?: string;
  createdAt: string;
}

export interface CreateInvoiceBody {
  clientName: string;
  clientAfm?: string;
  issueDate: string;
  invoiceType?: string;
  lines: { description: string; quantity?: number; unitPrice: number; vatRate: VatRate }[];
}

export const invoices = {
  list: () => request<Invoice[]>('/invoices'),
  get: (id: string) => request<Invoice>(`/invoices/${id}`),
  create: (body: CreateInvoiceBody) =>
    request<Invoice>('/invoices', { method: 'POST', body: JSON.stringify(body) }),
  submit: (id: string) =>
    request<Invoice>(`/invoices/${id}/submit`, { method: 'POST' }),
  cancel: (id: string) =>
    request<Invoice>(`/invoices/${id}/cancel`, { method: 'POST' }),
};

// ── Expenses ──────────────────────────────────────────────────────────────────

export type ExpenseCategory = 'software' | 'equipment' | 'transport' | 'office' | 'other';

export interface Expense {
  id: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface CreateExpenseBody {
  name: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  notes?: string;
}

export const expenses = {
  list: () => request<Expense[]>('/expenses'),
  create: (body: CreateExpenseBody) =>
    request<Expense>('/expenses', { method: 'POST', body: JSON.stringify(body) }),
  delete: (id: string) => request<void>(`/expenses/${id}`, { method: 'DELETE' }),
};

// ── Tax ───────────────────────────────────────────────────────────────────────

export interface TaxOverview {
  year: number;
  monthlyRevenue: { month: string; amount: number }[];
  totalRevenue: number;
  estimatedIncomeTax: number;
  efkaMonthly: number;
  yearProgressDays: number;
  vatAlerts: { period: string; dueDate: string; amount: number; daysRemaining: number }[];
}

export const tax = {
  overview: (year?: number) =>
    request<TaxOverview>(`/tax/overview${year ? `?year=${year}` : ''}`),
};
