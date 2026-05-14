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
  phone: '(868) 786-5357',
  email: 'support@tavara.care',
  website: 'https://tavara.care',
};

const TERMS_AND_CONDITIONS = [
  'Tavara is a Care Coordination & Management Platform — not an employment or placement agency. Families engage caregivers directly; coordination fees fund platform operations.',
  'Payment is due every Friday for weekly billing, or by the 1st of each month for monthly billing.',
  'Late payment incurs a 5% fee after 3 business days past due date. Continued non-payment may result in service suspension after 7 days.',
  '💡 Complete bank transfers by Thursday to ensure Friday receipt.',
  'Operating hours: 8:00 AM – 4:00 PM. All transactions close at 4:30 PM.',
  'Holiday rates: 1.5× standard rate; Christmas Day and New Year\'s Day: 2× standard rate.',
  'Extended hours beyond the agreed schedule are billed at 1.5× the standard rate.',
  'Care escalation due to changes in condition may require a rate adjustment with prior notice.',
  'NIS (National Insurance) contributions for assigned caregivers are managed in accordance with Trinidad & Tobago regulations, with Tavara providing guidance, coordination, and support to ensure compliance. The family remains the employer of record for NIS purposes.',
  'Please send a screenshot of payment/bank transfer confirmation via WhatsApp or email.',
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
  // Only show the "Includes" details as a subtle note — no separate price box
  // The subscription amount is already in the line items table and included in the total
  if (!data.subscriptionTier || !data.subscriptionIncludes || data.subscriptionIncludes.length === 0) return '';
  return `
    <div style="padding: 8px 32px;">
      <div style="font-size: 10px; color: #666; line-height: 1.6; border-left: 3px solid #D6BCFA; padding-left: 12px;">
        <strong style="color: #555;">${data.subscriptionTier} includes:</strong> ${data.subscriptionIncludes.join(' · ')}
      </div>
    </div>
  `;
}

function buildBankDetailsSection(): string {
  return `
    <div style="padding: 12px 32px;">
      <div style="background: #EBF8FF; border: 1px solid #BEE3F8; border-radius: 6px; padding: 14px 18px;">
        <div style="font-size: 11px; font-weight: 700; color: #2B6CB0; margin-bottom: 8px;">💳 Payment Details — Bank Transfer</div>
        <div style="display: flex; gap: 32px; font-size: 11px; color: #333;">
          <div>
            <div><strong>Bank:</strong> First Citizens Bank, Point Lisas</div>
            <div><strong>Account:</strong> 2991223</div>
          </div>
          <div>
            <div><strong>Name:</strong> Chanua Johnson</div>
            <div><strong>Type:</strong> Savings</div>
          </div>
        </div>
        <div style="font-size: 10px; color: #555; margin-top: 8px; font-style: italic;">
          💡 Complete transactions by Thursday to ensure Friday receipt. Send screenshot of payment/bank transfer via WhatsApp or email to confirm.
        </div>
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
      ${buildBankDetailsSection()}
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
      ${buildBankDetailsSection()}
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
  // Use provided paymentDate (the actual day the payment was made), NOT today.
  const paymentDate = data.paymentDate ? format(data.paymentDate, 'MMMM d, yyyy') : docDate;
  const amountInWords = numberToWords(amountPaid);
  const isPartial = data.amountPaid !== undefined && Math.abs(data.amountPaid - data.total) > 0.005;

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
            <div style="font-size: 12px; color: #555;">Amount Paid${isPartial ? ' <span style="color:#B7791F; font-style:italic;">(partial payment)</span>' : ''}</div>
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
      ${data.lineItems && data.lineItems.length > 0 ? `
        <div style="padding: 0 32px 4px;">
          <div style="font-size: 11px; font-weight: 700; color: #333; text-transform: uppercase; letter-spacing: 0.5px;">Services Covered by This Payment</div>
        </div>
        ${buildLineItemsTable(data)}
      ` : ''}
      ${data.subscriptionTier ? buildSubscriptionSection(data) : ''}
      ${buildFooter('Thank you for your payment!')}
    </div>
  `;

  await renderHTMLToPDF(html, `Receipt_${docNumber}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

/**
 * Helper to build default billing data for a standard care arrangement
 * Family-facing rate: $40/hr (Standard), 40hrs/wk
 */
export function buildDefaultCareBillingData(
  overrides: Partial<CareBillingData> & { familyName: string; additionalLineItems?: BillingLineItem[] }
): CareBillingData {
  const caregiverRate = 40;
  const hoursPerWeek = 40;
  const caregiverTotal = caregiverRate * hoursPerWeek;
  const defaultSubscriptionRate = 699; // Active Care Management weekly

  const additionalItems = overrides.additionalLineItems || [];
  const hasServiceSelections = additionalItems.length > 0;

  // Detect subscription item from approved service selections
  let detectedSubscriptionRate: number | null = null;
  let detectedSubscriptionLabel: string | null = null;
  const nonSubscriptionItems: BillingLineItem[] = [];

  for (const item of additionalItems) {
    const desc = item.description.toLowerCase();
    if (desc.includes('care management') || desc.includes('active care management') || desc.includes('premium care management')) {
      detectedSubscriptionRate = item.amount;
      detectedSubscriptionLabel = item.description.replace(/\s*\[.*?\]\s*/g, '').trim();
    } else {
      nonSubscriptionItems.push(item);
    }
  }

  // If service selections are provided, use them as primary line items (no hardcoded defaults)
  const baseLineItems: BillingLineItem[] = overrides.lineItems || 
    (hasServiceSelections 
      ? [] // Don't add hardcoded defaults when we have real service data
      : [
          {
            description: 'Standard Weekly Care — Caregiver (40 hrs/wk)',
            hoursPerWeek,
            ratePerHour: caregiverRate,
            amount: caregiverTotal,
          },
          {
            description: 'Active Care Management — Care Coordination',
            amount: defaultSubscriptionRate,
            note: '(weekly)',
          },
        ]);

  // If subscription detected from approved services, add it as a proper line item
  if (detectedSubscriptionRate !== null && detectedSubscriptionRate > 0) {
    // Clean label: strip [Discounted from ...] and [WAIVED ...] annotations
    const cleanLabel = (detectedSubscriptionLabel || 'Active Care Management')
      .replace(/\s*\[Discounted from[^\]]*\]/gi, '')
      .replace(/\s*\[WAIVED[^\]]*\]/gi, '')
      .trim();
    baseLineItems.push({
      description: cleanLabel.includes('Care Coordination') ? cleanLabel : `${cleanLabel} — Care Coordination`,
      amount: detectedSubscriptionRate,
      note: '(weekly)',
    });
  }


  const allLineItems = [...baseLineItems, ...nonSubscriptionItems];
  console.log('[invoiceService] Line items for document:', allLineItems.map(i => `${i.description}: $${i.amount}`));

  // Calculate totals from actual line items
  const calculatedSubtotal = allLineItems.reduce((sum, item) => sum + item.amount, 0);
  const finalSubtotal = overrides.subtotal ?? calculatedSubtotal;
  const finalTotal = overrides.total ?? calculatedSubtotal;

  // Determine subscription display rate from detected data or override
  const displaySubscriptionRate = detectedSubscriptionRate !== null
    ? `$${detectedSubscriptionRate.toFixed(0)}/week`
    : (overrides.subscriptionRate || `$${defaultSubscriptionRate}/week`);

  return {
    familyName: overrides.familyName,
    familyEmail: overrides.familyEmail,
    familyPhone: overrides.familyPhone,
    familyAddress: overrides.familyAddress,
    careRecipientName: overrides.careRecipientName,
    caregiverName: overrides.caregiverName,
    caregiverRole: overrides.caregiverRole || 'Nurse',
    lineItems: allLineItems,
    subtotal: finalSubtotal,
    total: finalTotal,
    subscriptionTier: overrides.subscriptionTier || 'Active Care Management',
    subscriptionRate: displaySubscriptionRate,
    subscriptionIncludes: overrides.subscriptionIncludes || [
      'Dedicated care coordinator',
      'Caregiver replacement guarantee (within coordinated pool)',
      'Care needs change management',
      'Weekly billing management',
      'NIS compliance guidance and coordination',
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
      'NIS (National Insurance) contributions for assigned caregivers are managed in accordance with Trinidad & Tobago regulations, with Tavara providing guidance, coordination, and support to ensure compliance.',
      'Tavara provides continuity of care — if your assigned caregiver is unavailable, a qualified replacement will be provided at no extra charge within the coordinated care team pool.',
      'Rate adjustments may apply if care needs change (e.g., disease progression, additional services).',
    ],
  };
}
