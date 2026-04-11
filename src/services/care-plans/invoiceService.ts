/**
 * Tavara Care — Billing Document Service
 * Generates branded Quote, Invoice, and Receipt PDFs client-side.
 * Pipeline: Data → HTML template → html2canvas (2x) → jsPDF → browser download
 */

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { numberToWords } from '@/utils/numberToWords';
import { getNextDocumentNumber } from '@/utils/documentNumbering';

// ─── Types ───────────────────────────────────────────────────────────

export interface BillingLineItem {
  description: string;
  hoursPerWeek?: number;
  ratePerHour?: number;
  amount: number;
  note?: string; // e.g. "(included)" for NIS
}

export interface CareBillingData {
  // Family info
  familyName: string;
  familyEmail?: string;
  familyPhone?: string;
  familyAddress?: string;

  // Care recipient
  careRecipientName?: string;

  // Caregiver info
  caregiverName?: string;
  caregiverRole?: string; // e.g. "Nurse", "Caregiver"

  // Line items
  lineItems: BillingLineItem[];
  subtotal: number;
  total: number;

  // Subscription
  subscriptionTier?: string; // "Family Care"
  subscriptionRate?: string; // "$199.99/week"
  subscriptionIncludes?: string[];

  // Billing period (for invoices)
  billingPeriodStart?: Date;
  billingPeriodEnd?: Date;
  dueDate?: Date;

  // Payment info (for receipts)
  paymentMethod?: string;
  paymentDate?: Date;
  amountPaid?: number;

  // Care plan reference
  carePlanId?: string;
  carePlanTitle?: string;

  // Notes
  additionalNotes?: string[];
}

// ─── Constants ───────────────────────────────────────────────────────

const TAVARA_BLUE = '#5B8DEF';
const TAVARA_TEAL = '#0D9488';
const PAGE_WIDTH = 816; // 8.5" at 96dpi
const PAGE_HEIGHT = 1056; // 11" at 96dpi

const COMPANY_INFO = {
  name: 'Tavara.Care',
  tagline: 'It takes a village to care',
  address: 'Trinidad & Tobago',
  phone: '+1 (868) 123-4567',
  email: 'support@tavara.care',
  website: 'https://tavaracare.lovable.app',
};

const TERMS_AND_CONDITIONS = [
  'Payment is due every Friday for weekly billing, or by the 1st of each month for monthly billing.',
  'Late payment incurs a 5% fee after 3 business days past due date.',
  'Operating hours: 8:00 AM – 4:00 PM. All transactions close at 4:30 PM.',
  'Holiday rates: 1.5× standard rate; Christmas Day and New Year\'s Day: 2× standard rate.',
  'Extended hours beyond the agreed schedule are billed at 1.5× the standard rate.',
  'Care escalation due to changes in condition may require a rate adjustment with prior notice.',
  'NIS (National Insurance) contributions for the assigned caregiver are covered by Tavara.',
];

// ─── HTML Templates ─────────────────────────────────────────────────

function buildHeader(docType: string, docNumber: string, docDate: string): string {
  return `
    <div style="background: ${TAVARA_BLUE}; color: white; padding: 24px 32px; display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        <div style="font-size: 28px; font-weight: 700; letter-spacing: 1px;">TAVARA</div>
        <div style="font-size: 11px; opacity: 0.85; margin-top: 2px;">${COMPANY_INFO.tagline}</div>
        <div style="margin-top: 16px; font-size: 22px; font-weight: 600; letter-spacing: 2px;">${docType}</div>
      </div>
      <div style="text-align: right; font-size: 11px; line-height: 1.7;">
        <div style="font-weight: 600;">${COMPANY_INFO.name}</div>
        <div>${COMPANY_INFO.address}</div>
        <div>${COMPANY_INFO.phone}</div>
        <div>${COMPANY_INFO.email}</div>
        <div style="margin-top: 8px;">
          <span style="opacity: 0.8;">${docType} #:</span> <strong>${docNumber}</strong>
        </div>
        <div><span style="opacity: 0.8;">Date:</span> ${docDate}</div>
      </div>
    </div>
  `;
}

function buildBillTo(data: CareBillingData): string {
  return `
    <div style="padding: 20px 32px; display: flex; gap: 40px;">
      <div style="flex: 1;">
        <div style="font-size: 10px; text-transform: uppercase; color: #888; letter-spacing: 1px; margin-bottom: 6px;">Bill To</div>
        <div style="font-weight: 600; font-size: 14px;">${data.familyName}</div>
        ${data.familyPhone ? `<div style="font-size: 12px; color: #555; margin-top: 2px;">${data.familyPhone}</div>` : ''}
        ${data.familyEmail ? `<div style="font-size: 12px; color: #555;">${data.familyEmail}</div>` : ''}
        ${data.familyAddress ? `<div style="font-size: 12px; color: #555; margin-top: 4px;">${data.familyAddress}</div>` : ''}
      </div>
      <div style="flex: 1;">
        ${data.careRecipientName ? `
          <div style="font-size: 10px; text-transform: uppercase; color: #888; letter-spacing: 1px; margin-bottom: 6px;">Care Recipient</div>
          <div style="font-weight: 600; font-size: 14px;">${data.careRecipientName}</div>
        ` : ''}
        ${data.caregiverName ? `
          <div style="font-size: 10px; text-transform: uppercase; color: #888; letter-spacing: 1px; margin-bottom: 6px; margin-top: 12px;">Assigned Caregiver</div>
          <div style="font-weight: 600; font-size: 14px;">${data.caregiverName}</div>
          ${data.caregiverRole ? `<div style="font-size: 12px; color: #555;">${data.caregiverRole}</div>` : ''}
        ` : ''}
      </div>
    </div>
  `;
}

function buildLineItemsTable(data: CareBillingData): string {
  const rows = data.lineItems.map((item, i) => `
    <tr style="background: ${i % 2 === 0 ? '#FAFAFA' : '#FFFFFF'};">
      <td style="padding: 10px 12px; font-size: 12px; border-bottom: 1px solid #EEE;">
        ${item.description}
        ${item.note ? `<span style="color: #888; font-style: italic;"> ${item.note}</span>` : ''}
      </td>
      <td style="padding: 10px 12px; font-size: 12px; text-align: center; border-bottom: 1px solid #EEE;">
        ${item.hoursPerWeek != null ? `${item.hoursPerWeek} hrs/wk` : '—'}
      </td>
      <td style="padding: 10px 12px; font-size: 12px; text-align: right; border-bottom: 1px solid #EEE;">
        ${item.ratePerHour != null ? `$${item.ratePerHour.toFixed(2)}/hr` : '—'}
      </td>
      <td style="padding: 10px 12px; font-size: 12px; text-align: right; border-bottom: 1px solid #EEE; font-weight: 500;">
        $${item.amount.toFixed(2)}
      </td>
    </tr>
  `).join('');

  return `
    <div style="padding: 0 32px; margin-top: 8px;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: ${TAVARA_BLUE}; color: white;">
            <th style="padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Description</th>
            <th style="padding: 10px 12px; text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Hours</th>
            <th style="padding: 10px 12px; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Rate</th>
            <th style="padding: 10px 12px; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      <div style="display: flex; justify-content: flex-end; margin-top: 0;">
        <div style="width: 250px;">
          <div style="display: flex; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid #EEE; font-size: 12px;">
            <span>Subtotal</span>
            <span>$${data.subtotal.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 12px; background: ${TAVARA_BLUE}; color: white; font-weight: 700; font-size: 14px;">
            <span>Total (TTD)</span>
            <span>$${data.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function buildSubscriptionSection(data: CareBillingData): string {
  if (!data.subscriptionTier) return '';
  return `
    <div style="padding: 16px 32px;">
      <div style="background: #F0EDFA; border-left: 4px solid ${TAVARA_BLUE}; padding: 14px 18px; border-radius: 0 6px 6px 0;">
        <div style="font-size: 12px; font-weight: 700; color: ${TAVARA_BLUE};">Subscription: ${data.subscriptionTier} — ${data.subscriptionRate || ''}</div>
        ${data.subscriptionIncludes && data.subscriptionIncludes.length > 0 ? `
          <div style="font-size: 11px; color: #555; margin-top: 6px;">
            <strong>Includes:</strong> ${data.subscriptionIncludes.join(' · ')}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function buildTermsSection(terms: string[]): string {
  return `
    <div style="padding: 16px 32px;">
      <div style="font-size: 11px; font-weight: 700; color: #333; margin-bottom: 6px;">Terms & Conditions</div>
      <div style="font-size: 10px; color: #666; line-height: 1.6;">
        ${terms.map((t, i) => `<div>${i + 1}. ${t}</div>`).join('')}
      </div>
    </div>
  `;
}

function buildFooter(message: string): string {
  return `
    <div style="position: absolute; bottom: 0; left: 0; right: 0; background: #F8F8F8; padding: 14px 32px; border-top: 1px solid #EEE; display: flex; justify-content: space-between; align-items: center;">
      <div style="font-size: 10px; color: #888;">
        ${COMPANY_INFO.name} · ${COMPANY_INFO.email} · ${COMPANY_INFO.phone}
      </div>
      <div style="font-size: 10px; color: ${TAVARA_BLUE}; font-weight: 600;">
        ${message}
      </div>
    </div>
  `;
}

// ─── PDF Generation Pipeline ────────────────────────────────────────

async function renderHTMLToPDF(htmlContent: string, filename: string): Promise<void> {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = `${PAGE_WIDTH}px`;
  container.style.minHeight = `${PAGE_HEIGHT}px`;
  container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  container.style.background = '#FFFFFF';
  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      width: PAGE_WIDTH,
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'letter',
    });

    const pdfWidth = 8.5;
    const pdfHeight = (canvas.height / canvas.width) * pdfWidth;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    pdf.save(filename);
  } finally {
    document.body.removeChild(container);
  }
}

// ─── Public API ──────────────────────────────────────────────────────

export async function generateQuotePDF(data: CareBillingData): Promise<void> {
  const docNumber = await getNextDocumentNumber('QUOTE');
  const docDate = format(new Date(), 'MMMM d, yyyy');
  const validUntil = format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'MMMM d, yyyy');

  const html = `
    <div style="position: relative; min-height: ${PAGE_HEIGHT}px;">
      ${buildHeader('QUOTE', docNumber, docDate)}
      ${buildBillTo(data)}
      ${data.carePlanTitle ? `
        <div style="padding: 0 32px 8px; font-size: 12px; color: #555;">
          <strong>Care Plan:</strong> ${data.carePlanTitle}
        </div>
      ` : ''}
      ${buildLineItemsTable(data)}
      ${buildSubscriptionSection(data)}
      ${data.additionalNotes && data.additionalNotes.length > 0 ? `
        <div style="padding: 8px 32px;">
          <div style="font-size: 11px; font-weight: 700; color: #333; margin-bottom: 4px;">Notes</div>
          <div style="font-size: 10px; color: #666; line-height: 1.6;">
            ${data.additionalNotes.map(n => `<div>• ${n}</div>`).join('')}
          </div>
        </div>
      ` : ''}
      ${buildTermsSection(TERMS_AND_CONDITIONS)}
      ${buildFooter(`This quote is valid until ${validUntil}`)}
    </div>
  `;

  await renderHTMLToPDF(html, `Quote_${docNumber}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

export async function generateInvoicePDF(data: CareBillingData): Promise<void> {
  const docNumber = await getNextDocumentNumber('INV');
  const docDate = format(new Date(), 'MMMM d, yyyy');
  const periodStart = data.billingPeriodStart ? format(data.billingPeriodStart, 'MMM d, yyyy') : '—';
  const periodEnd = data.billingPeriodEnd ? format(data.billingPeriodEnd, 'MMM d, yyyy') : '—';
  const dueDate = data.dueDate ? format(data.dueDate, 'MMMM d, yyyy') : 'Upon receipt';

  const html = `
    <div style="position: relative; min-height: ${PAGE_HEIGHT}px;">
      ${buildHeader('INVOICE', docNumber, docDate)}
      ${buildBillTo(data)}
      <div style="padding: 0 32px 12px; display: flex; gap: 40px;">
        <div style="font-size: 12px; color: #555;">
          <strong>Billing Period:</strong> ${periodStart} — ${periodEnd}
        </div>
        <div style="font-size: 12px; color: #555;">
          <strong>Due Date:</strong> <span style="color: #C53030; font-weight: 600;">${dueDate}</span>
        </div>
      </div>
      ${data.carePlanTitle ? `
        <div style="padding: 0 32px 8px; font-size: 12px; color: #555;">
          <strong>Care Plan:</strong> ${data.carePlanTitle}
        </div>
      ` : ''}
      ${buildLineItemsTable(data)}
      ${buildSubscriptionSection(data)}
      ${data.additionalNotes && data.additionalNotes.length > 0 ? `
        <div style="padding: 8px 32px;">
          <div style="font-size: 11px; font-weight: 700; color: #333; margin-bottom: 4px;">Notes</div>
          <div style="font-size: 10px; color: #666; line-height: 1.6;">
            ${data.additionalNotes.map(n => `<div>• ${n}</div>`).join('')}
          </div>
        </div>
      ` : ''}
      ${buildTermsSection(TERMS_AND_CONDITIONS)}
      ${buildFooter('Thank you for choosing Tavara Care')}
    </div>
  `;

  await renderHTMLToPDF(html, `Invoice_${docNumber}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

export async function generateReceiptPDF(data: CareBillingData): Promise<void> {
  const docNumber = await getNextDocumentNumber('RECEIPT');
  const docDate = format(new Date(), 'MMMM d, yyyy');
  const amountPaid = data.amountPaid ?? data.total;
  const paymentDate = data.paymentDate ? format(data.paymentDate, 'MMMM d, yyyy') : docDate;
  const amountInWords = numberToWords(amountPaid);

  const html = `
    <div style="position: relative; min-height: ${PAGE_HEIGHT}px;">
      ${buildHeader('RECEIPT', docNumber, docDate)}
      ${buildBillTo(data)}
      <div style="padding: 20px 32px;">
        <div style="background: #F0FAF0; border: 1px solid #C6F6D5; border-radius: 8px; padding: 20px;">
          <div style="text-align: center; margin-bottom: 16px;">
            <div style="font-size: 14px; color: #2F855A; font-weight: 700;">PAYMENT RECEIVED</div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <div style="font-size: 12px; color: #555;">Receipt Number</div>
            <div style="font-size: 12px; font-weight: 600;">${docNumber}</div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <div style="font-size: 12px; color: #555;">Amount Paid</div>
            <div style="font-size: 16px; font-weight: 700; color: ${TAVARA_BLUE};">TTD $${amountPaid.toFixed(2)}</div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <div style="font-size: 12px; color: #555;">Amount in Words</div>
            <div style="font-size: 11px; font-style: italic; max-width: 350px; text-align: right;">${amountInWords}</div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <div style="font-size: 12px; color: #555;">Payment Method</div>
            <div style="font-size: 12px; font-weight: 600;">${data.paymentMethod || 'Bank Transfer'}</div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <div style="font-size: 12px; color: #555;">Payment Date</div>
            <div style="font-size: 12px; font-weight: 600;">${paymentDate}</div>
          </div>
          ${data.carePlanTitle ? `
            <div style="display: flex; justify-content: space-between;">
              <div style="font-size: 12px; color: #555;">Care Plan</div>
              <div style="font-size: 12px; font-weight: 600;">${data.carePlanTitle}</div>
            </div>
          ` : ''}
        </div>
      </div>
      ${data.subscriptionTier ? buildSubscriptionSection(data) : ''}
      <div style="padding: 30px 32px;">
        <div style="display: flex; justify-content: flex-end;">
          <div style="text-align: center;">
            <div style="border-top: 1px solid #333; width: 200px; margin-bottom: 4px;"></div>
            <div style="font-size: 10px; color: #888;">Authorized Signature</div>
          </div>
        </div>
      </div>
      ${buildFooter('Thank you for your payment!')}
    </div>
  `;

  await renderHTMLToPDF(html, `Receipt_${docNumber}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

/**
 * Helper to build default billing data for a standard care arrangement
 * e.g., Anna Maria's case: $35/hr nurse + $5/hr platform = $40/hr, 40hrs/wk
 */
export function buildDefaultCareBillingData(overrides: Partial<CareBillingData> & { familyName: string }): CareBillingData {
  const nurseRate = 35;
  const hoursPerWeek = 40;
  const nursingTotal = nurseRate * hoursPerWeek;
  const subscriptionRate = 199.99; // Family Care weekly

  return {
    familyName: overrides.familyName,
    familyEmail: overrides.familyEmail,
    familyPhone: overrides.familyPhone,
    familyAddress: overrides.familyAddress,
    careRecipientName: overrides.careRecipientName,
    caregiverName: overrides.caregiverName,
    caregiverRole: overrides.caregiverRole || 'Nurse',
    lineItems: overrides.lineItems || [
      {
        description: 'Standard Weekly Care — Nursing (40 hrs/wk)',
        hoursPerWeek,
        ratePerHour: nurseRate,
        amount: nursingTotal,
      },
      {
        description: 'Family Care Plan — Care Management & Coordination',
        amount: subscriptionRate,
        note: '(weekly)',
      },
    ],
    subtotal: overrides.subtotal ?? (nursingTotal + subscriptionRate),
    total: overrides.total ?? (nursingTotal + subscriptionRate),
    subscriptionTier: overrides.subscriptionTier || 'Family Care',
    subscriptionRate: overrides.subscriptionRate || '$199.99/week',
    subscriptionIncludes: overrides.subscriptionIncludes || [
      'Dedicated care coordinator',
      'Caregiver replacement guarantee',
      'Care needs change management',
      'Weekly billing management',
      'NIS compliance coverage',
    ],
    carePlanId: overrides.carePlanId,
    carePlanTitle: overrides.carePlanTitle,
    billingPeriodStart: overrides.billingPeriodStart,
    billingPeriodEnd: overrides.billingPeriodEnd,
    dueDate: overrides.dueDate,
    paymentMethod: overrides.paymentMethod,
    paymentDate: overrides.paymentDate,
    amountPaid: overrides.amountPaid,
    additionalNotes: overrides.additionalNotes || [
      'NIS (National Insurance) contributions for the assigned caregiver are included and covered by Tavara as required by Trinidad & Tobago law.',
      'Tavara provides continuity of care — if your assigned caregiver is unavailable, a qualified replacement will be provided at no extra charge.',
      'Rate adjustments may apply if care needs change (e.g., disease progression, additional services).',
    ],
  };
}
