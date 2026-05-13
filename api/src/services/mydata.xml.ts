import { create } from 'xmlbuilder2';
import type { Invoice, User } from '../types/index.js';

/**
 * Builds the XML payload required by AADE myDATA SendInvoices endpoint.
 * Spec: https://www.aade.gr/sites/default/files/2023-11/myDATA%20API%20Documentation_v1.0.9_official.pdf
 *
 * Namespace rules (confirmed from firebed/aade-mydata reference implementation):
 *   - Main invoice ns:  http://  (NOT https)
 *   - Classification ns: https:// (intentional inconsistency in AADE spec)
 *   - "incomeClassificaton" is an official AADE typo (missing 'i') — preserve exactly.
 */
export function buildInvoiceXml(invoice: Invoice, issuer: User): string {
  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('InvoicesDoc', {
      // Main invoice namespace uses http:// — classification namespaces use https://
      'xmlns': 'http://www.aade.gr/myDATA/invoice/v1.0',
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'xmlns:icls': 'https://www.aade.gr/myDATA/incomeClassificaton/v1.0',
    });

  const inv = root.ele('invoice');

  // Issuer
  const issuerEl = inv.ele('issuer');
  issuerEl.ele('vatNumber').txt(issuer.afm);
  issuerEl.ele('country').txt('GR');
  issuerEl.ele('branch').txt('0');

  // Counterpart — include only when client AFM is known (B2B)
  if (invoice.clientAfm) {
    const cp = inv.ele('counterpart');
    cp.ele('vatNumber').txt(invoice.clientAfm);
    cp.ele('country').txt(invoice.clientCountry || 'GR');
    cp.ele('branch').txt('0');
  }

  // Invoice header
  const hdr = inv.ele('invoiceHeader');
  hdr.ele('series').txt(invoice.series);
  hdr.ele('aa').txt(String(invoice.aa));
  hdr.ele('issueDate').txt(invoice.issueDate);
  hdr.ele('invoiceType').txt(invoice.invoiceType);
  hdr.ele('currency').txt(invoice.currency);

  // Invoice details (one element per line item)
  invoice.lines.forEach((line, idx) => {
    const det = inv.ele('invoiceDetails');
    det.ele('lineNumber').txt(String(idx + 1));
    det.ele('netValue').txt(line.netValue.toFixed(2));
    det.ele('vatCategory').txt(vatCategoryCode(line.vatRate));
    det.ele('vatAmount').txt(line.vatAmount.toFixed(2));

    const cls = det.ele('icls:incomeClassification');
    cls.ele('icls:classificationType').txt('E3_561_007');
    cls.ele('icls:classificationCategory').txt('category1_7');
    cls.ele('icls:amount').txt(line.netValue.toFixed(2));
  });

  // Invoice summary
  const sum = inv.ele('invoiceSummary');
  sum.ele('totalNetValue').txt(invoice.totalNetValue.toFixed(2));
  sum.ele('totalVatAmount').txt(invoice.totalVatAmount.toFixed(2));
  sum.ele('totalWithheldAmount').txt('0.00');
  sum.ele('totalFeesAmount').txt('0.00');
  sum.ele('totalStampDutyAmount').txt('0.00');
  sum.ele('totalOtherTaxesAmount').txt('0.00');
  sum.ele('totalDeductionsAmount').txt('0.00');
  sum.ele('totalGrossValue').txt(invoice.totalGrossValue.toFixed(2));

  const sumCls = sum.ele('icls:incomeClassification');
  sumCls.ele('icls:classificationType').txt('E3_561_007');
  sumCls.ele('icls:classificationCategory').txt('category1_7');
  sumCls.ele('icls:amount').txt(invoice.totalNetValue.toFixed(2));

  return root.end({ prettyPrint: false });
}

// myDATA VAT category codes (per spec table)
function vatCategoryCode(rate: number): string {
  switch (rate) {
    case 24: return '1';
    case 13: return '2';
    case 6:  return '3';
    case 0:  return '7';  // exempt
    default: return '1';
  }
}
