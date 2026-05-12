import { create } from 'xmlbuilder2';
import type { Invoice, User } from '../types/index.js';

/**
 * Builds the XML payload required by AADE myDATA SendInvoices endpoint.
 * Spec: https://www.aade.gr/sites/default/files/2023-11/myDATA%20API%20Documentation_v1.0.9_official.pdf
 */
export function buildInvoiceXml(invoice: Invoice, issuer: User): string {
  const doc = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('InvoicesDoc', { xmlns: 'https://www.aade.gr/myDATA/invoice/v1.0' });

  const inv = doc.ele('invoice');

  // Issuer
  inv.ele('issuer')
    .ele('vatNumber').txt(issuer.afm).up()
    .ele('country').txt('GR').up()
    .ele('branch').txt('0').up();

  // Counterpart (client)
  if (invoice.clientAfm) {
    inv.ele('counterpart')
      .ele('vatNumber').txt(invoice.clientAfm).up()
      .ele('country').txt(invoice.clientCountry || 'GR').up()
      .ele('branch').txt('0').up();
  }

  // Invoice header
  inv.ele('invoiceHeader')
    .ele('series').txt(invoice.series).up()
    .ele('aa').txt(String(invoice.aa)).up()
    .ele('issueDate').txt(invoice.issueDate).up()
    .ele('invoiceType').txt(invoice.invoiceType).up()
    .ele('currency').txt(invoice.currency).up();

  // Invoice details (line items)
  invoice.lines.forEach((line, idx) => {
    inv.ele('invoiceDetails')
      .ele('lineNumber').txt(String(idx + 1)).up()
      .ele('netValue').txt(line.netValue.toFixed(2)).up()
      .ele('vatCategory').txt(vatCategoryCode(line.vatRate)).up()
      .ele('vatAmount').txt(line.vatAmount.toFixed(2)).up()
      .ele('incomeClassification')
        .ele('classificationType').txt('E3_561_007').up()
        .ele('classificationCategory').txt('category1_7').up()
        .ele('amount').txt(line.netValue.toFixed(2)).up();
  });

  // Invoice summary
  inv.ele('invoiceSummary')
    .ele('totalNetValue').txt(invoice.totalNetValue.toFixed(2)).up()
    .ele('totalVatAmount').txt(invoice.totalVatAmount.toFixed(2)).up()
    .ele('totalWithheldAmount').txt('0').up()
    .ele('totalFeesAmount').txt('0').up()
    .ele('totalStampDutyAmount').txt('0').up()
    .ele('totalOtherTaxesAmount').txt('0').up()
    .ele('totalDeductionsAmount').txt('0').up()
    .ele('totalGrossValue').txt(invoice.totalGrossValue.toFixed(2)).up()
    .ele('incomeClassification')
      .ele('classificationType').txt('E3_561_007').up()
      .ele('classificationCategory').txt('category1_7').up()
      .ele('amount').txt(invoice.totalNetValue.toFixed(2)).up();

  return doc.end({ prettyPrint: false });
}

// myDATA VAT category codes
function vatCategoryCode(rate: number): string {
  switch (rate) {
    case 24: return '1';
    case 13: return '2';
    case 6:  return '3';
    case 0:  return '7';   // 0% exempt
    default: return '1';
  }
}
