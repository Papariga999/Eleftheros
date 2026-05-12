import { parseStringPromise } from 'xml2js';
import type { Invoice, MyDataResponse, User } from '../types/index.js';
import { buildInvoiceXml } from './mydata.xml.js';

const BASE_URL = process.env.MYDATA_BASE_URL ?? 'https://mydataapidev.aade.gr/myDATA';
const USER_ID = process.env.MYDATA_USER_ID ?? '';
const SUB_KEY = process.env.MYDATA_SUBSCRIPTION_KEY ?? '';
const MOCK = process.env.MYDATA_MOCK === 'true';

function headers(): Record<string, string> {
  return {
    'Content-Type': 'application/xml',
    'aade-user-id': USER_ID,
    'Ocp-Apim-Subscription-Key': SUB_KEY,
  };
}

// ── Submit a new invoice ──────────────────────────────────────────────────────

export async function sendInvoice(invoice: Invoice, issuer: User): Promise<{
  mark: string;
  uid: string;
  authenticationCode: string;
}> {
  if (MOCK) return mockSendInvoice(invoice);

  const xml = buildInvoiceXml(invoice, issuer);
  const res = await fetch(`${BASE_URL}/SendInvoices`, {
    method: 'POST',
    headers: headers(),
    body: xml,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`myDATA SendInvoices error ${res.status}: ${text}`);
  }

  const raw = await res.text();
  const parsed = await parseStringPromise(raw, { explicitArray: false });
  const entry = parsed?.ResponseDoc?.response;

  if (!entry || entry.statusCode !== 'Success') {
    const errMsg = entry?.errors?.error?.message ?? 'Unknown myDATA error';
    throw new Error(`myDATA rejected invoice: ${errMsg}`);
  }

  return {
    mark: entry.invoiceMark,
    uid: entry.invoiceUid,
    authenticationCode: entry.authenticationCode,
  };
}

// ── Fetch submitted invoices for a given AFM ──────────────────────────────────

export async function requestMyInvoices(afm: string, dateFrom?: string, dateTo?: string): Promise<MyDataResponse> {
  if (MOCK) return mockRequestInvoices();

  const params = new URLSearchParams({ vatNumber: afm });
  if (dateFrom) params.set('dateFrom', dateFrom);
  if (dateTo)   params.set('dateTo', dateTo);

  const res = await fetch(`${BASE_URL}/RequestMyInvoices?${params}`, {
    method: 'GET',
    headers: headers(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`myDATA RequestMyInvoices error ${res.status}: ${text}`);
  }

  const raw = await res.text();
  const parsed = await parseStringPromise(raw, { explicitArray: false });
  return parsed as MyDataResponse;
}

// ── Cancel an invoice by MARK ─────────────────────────────────────────────────

export async function cancelInvoice(mark: string): Promise<{ cancellationMark: string }> {
  if (MOCK) return { cancellationMark: `C${mark}` };

  const res = await fetch(`${BASE_URL}/CancelInvoice?mark=${mark}`, {
    method: 'POST',
    headers: headers(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`myDATA CancelInvoice error ${res.status}: ${text}`);
  }

  const raw = await res.text();
  const parsed = await parseStringPromise(raw, { explicitArray: false });
  return { cancellationMark: parsed?.ResponseDoc?.response?.cancellationMark ?? '' };
}

// ── Mock helpers ──────────────────────────────────────────────────────────────

function mockSendInvoice(invoice: Invoice) {
  const mark = String(Math.floor(Math.random() * 9_000_000_000) + 1_000_000_000);
  const uid = `${invoice.issueDate.replace(/-/g, '')}${mark}`;
  console.log(`[myDATA mock] SendInvoice → MARK ${mark}`);
  return { mark, uid, authenticationCode: `AUTH${mark.slice(0, 6)}` };
}

function mockRequestInvoices(): MyDataResponse {
  return {
    invoicesRegistrationNumber: [
      { index: 1, invoiceUid: 'MOCK001', invoiceMark: '400001234567', authenticationCode: 'AUTH001', statusCode: 'Success' },
      { index: 2, invoiceUid: 'MOCK002', invoiceMark: '400001234568', authenticationCode: 'AUTH002', statusCode: 'Success' },
    ],
  };
}
