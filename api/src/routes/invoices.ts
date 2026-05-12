import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { authenticate } from '../middleware/authenticate.js';
import { cancelInvoice, sendInvoice } from '../services/mydata.client.js';
import * as store from '../services/store.js';
import type { CreateInvoiceBody, Invoice, InvoiceLine } from '../types/index.js';

const router = Router();
router.use(authenticate);

// ── GET /invoices ─────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  const list = await store.listInvoices(req.user!.userId);
  res.json(list);
});

// ── GET /invoices/:id ─────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  const inv = await store.findInvoice(req.params.id, req.user!.userId);
  if (!inv) { res.status(404).json({ error: 'Invoice not found' }); return; }
  res.json(inv);
});

// ── POST /invoices ─────────────────────────────────────────────────────────────
// Creates a draft invoice and submits it to myDATA in one step.
router.post('/', async (req, res) => {
  const body = req.body as CreateInvoiceBody;
  const userId = req.user!.userId;

  if (!body.clientName || !body.issueDate || !Array.isArray(body.lines) || body.lines.length === 0) {
    res.status(400).json({ error: 'clientName, issueDate, and at least one line are required' });
    return;
  }

  const user = await store.findUserById(userId);
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }

  // Compute line-level amounts
  const lines: InvoiceLine[] = body.lines.map(l => {
    const qty = l.quantity ?? 1;
    const net = Math.round(l.unitPrice * qty * 100) / 100;
    const vat = Math.round(net * (l.vatRate / 100) * 100) / 100;
    return {
      description: l.description,
      quantity: qty,
      unitPrice: l.unitPrice,
      vatRate: l.vatRate,
      netValue: net,
      vatAmount: vat,
    };
  });

  const totalNet = lines.reduce((s, l) => s + l.netValue, 0);
  const totalVat = lines.reduce((s, l) => s + l.vatAmount, 0);
  const now = new Date().toISOString();

  // Determine next series number for this user
  const existing = await store.listInvoices(userId);
  const aa = existing.filter(i => i.series === 'A').length + 1;

  const invoice: Invoice = {
    id: uuid(),
    userId,
    clientName: body.clientName,
    clientAfm: body.clientAfm,
    clientCountry: body.clientCountry ?? 'GR',
    series: 'A',
    aa,
    issueDate: body.issueDate,
    invoiceType: body.invoiceType ?? '1.1',
    currency: 'EUR',
    lines,
    totalNetValue: Math.round(totalNet * 100) / 100,
    totalVatAmount: Math.round(totalVat * 100) / 100,
    totalGrossValue: Math.round((totalNet + totalVat) * 100) / 100,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };

  // Submit to myDATA
  try {
    const { mark, uid, authenticationCode } = await sendInvoice(invoice, user);
    invoice.status = 'submitted';
    invoice.mark = mark;
    invoice.uid = uid;
    invoice.authenticationCode = authenticationCode;
  } catch (err) {
    // Save as draft so the user can retry
    await store.createInvoice(invoice);
    res.status(502).json({ error: (err as Error).message, invoice });
    return;
  }

  await store.createInvoice(invoice);
  res.status(201).json(invoice);
});

// ── POST /invoices/:id/cancel ─────────────────────────────────────────────────
router.post('/:id/cancel', async (req, res) => {
  const inv = await store.findInvoice(req.params.id, req.user!.userId);
  if (!inv) { res.status(404).json({ error: 'Invoice not found' }); return; }
  if (inv.status !== 'submitted' || !inv.mark) {
    res.status(400).json({ error: 'Only submitted invoices with a MARK can be cancelled' });
    return;
  }

  try {
    const { cancellationMark } = await cancelInvoice(inv.mark);
    const updated = await store.updateInvoice(inv.id, {
      status: 'cancelled',
      mark: cancellationMark,
    });
    res.json(updated);
  } catch (err) {
    res.status(502).json({ error: (err as Error).message });
  }
});

export default router;
