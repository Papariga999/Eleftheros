// ── Auth ─────────────────────────────────────────────────────────────────────

export type SocialProvider = 'google' | 'apple' | 'taxisnet';

export interface User {
  id: string;
  email: string;
  passwordHash?: string;           // absent for social-only accounts
  socialProvider?: SocialProvider;
  socialId?: string;
  fullName: string;
  afm: string;          // Greek VAT ID (9 digits)
  doy?: string;         // Tax office
  businessDescription?: string;
  address?: string;
  phone?: string;
  createdAt: string;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  afm: string;
}

// ── Invoices ─────────────────────────────────────────────────────────────────

export type InvoiceStatus = 'draft' | 'submitted' | 'cancelled';
export type VatRate = 0 | 13 | 24;

export interface InvoiceLine {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: VatRate;
  netValue: number;
  vatAmount: number;
}

export interface Invoice {
  id: string;
  userId: string;
  // Client
  clientName: string;
  clientAfm?: string;
  clientCountry: string;
  // Invoice header
  series: string;
  aa: number;
  issueDate: string;           // ISO date
  invoiceType: string;         // myDATA invoice type code, e.g. "1.1"
  currency: string;            // "EUR"
  // Lines
  lines: InvoiceLine[];
  // Totals (computed)
  totalNetValue: number;
  totalVatAmount: number;
  totalGrossValue: number;
  // myDATA response
  status: InvoiceStatus;
  mark?: string;               // MARK number from AADE
  uid?: string;                // UID from AADE
  authenticationCode?: string; // from AADE
  // Meta
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceBody {
  clientName: string;
  clientAfm?: string;
  clientCountry?: string;
  issueDate: string;
  invoiceType?: string;
  lines: {
    description: string;
    quantity?: number;
    unitPrice: number;
    vatRate: VatRate;
  }[];
}

// ── Expenses ─────────────────────────────────────────────────────────────────

export type ExpenseCategory = 'software' | 'equipment' | 'transport' | 'office' | 'other';

export interface Expense {
  id: string;
  userId: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  date: string;         // ISO date
  receiptUrl?: string;
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

// ── Tax ──────────────────────────────────────────────────────────────────────

export interface MonthlyRevenue {
  month: string;        // "YYYY-MM"
  amount: number;
}

export interface TaxOverview {
  year: number;
  monthlyRevenue: MonthlyRevenue[];
  totalRevenue: number;
  estimatedIncomeTax: number;
  efkaMonthly: number;
  yearProgressDays: number;
  vatAlerts: VatAlert[];
}

export interface VatAlert {
  period: string;
  dueDate: string;
  amount: number;
  daysRemaining: number;
}

// ── myDATA API ───────────────────────────────────────────────────────────────

export interface MyDataInvoiceResponse {
  index: number;
  invoiceUid: string;
  invoiceMark: string;
  authenticationCode: string;
  cancellationMark?: string;
  statusCode: string;
  errors?: { message: string; code: string }[];
}

export interface MyDataResponse {
  invoicesRegistrationNumber: MyDataInvoiceResponse[];
}
