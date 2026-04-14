import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { format, eachMonthOfInterval } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { fetchEmployerSettings } from '@/services/care-plans/team/employerSettingsService';

/**
 * Generate NI 187 - Summary of Contributions Due/In Arrears
 * Fills the official NIBTT government form template with payroll data
 * 
 * NI 187 is portrait (612 x 792 PDF points), 2 pages
 * Coordinate system: structure Y is top-down, pdf-lib Y is bottom-up
 */

// Page 1 coordinate map (from structure analysis)
const P1 = {
  // Section A - Employer Information
  TRADE_NAME_X: 160,
  TRADE_NAME_Y: 147,
  ADDRESS_X: 85,
  ADDRESS_Y: 178,
  REG_NO_X: 477,
  REG_NO_Y: 206,
  TELEPHONE_X: 112,
  TELEPHONE_Y: 227,
  
  // Contribution Period
  PERIOD_FROM_YYYY_X: 315,
  PERIOD_FROM_MM_X: 362,
  PERIOD_FROM_DD_X: 396,
  PERIOD_Y: 265,
  PERIOD_TO_YYYY_X: 468,
  PERIOD_TO_MM_X: 515,
  PERIOD_TO_DD_X: 549,
  
  // Number of employees
  NUM_EMPLOYEES_X: 505,
  NUM_EMPLOYEES_Y: 289,
  
  // Section B - Value of Contributions Payable
  // $ column starts ~234, c column ~279
  SECTION_B_DOLLARS_X: 220,
  SECTION_B_CENTS_X: 270,
  BALANCE_BF_Y: 342,
  CONTRIBUTIONS_DUE_Y: 363,
  PENALTY_Y: 381,
  INTEREST_Y: 401,
  TOTAL_AMOUNT_DUE_Y: 422,
  AMOUNT_PAID_Y: 443,
  BALANCE_CF_Y: 464,
  
  // Section C - Method of Payment
  CASH_DOLLARS_X: 500,
  CASH_CENTS_X: 545,
  CASH_Y: 363,
  CHEQUE_DOLLARS_X: 500,
  CHEQUE_CENTS_X: 545,
  CHEQUE_Y: 395,
  TOTAL_PAYMENT_DOLLARS_X: 500,
  TOTAL_PAYMENT_CENTS_X: 545,
  TOTAL_PAYMENT_Y: 425,
  
  // Section D - Certificate
  NAME_X: 70,
  NAME_Y: 576,
  POSITION_X: 100,
  POSITION_Y: 632,
  DATE_YYYY_X: 423,
  DATE_MM_X: 470,
  DATE_DD_X: 504,
  DATE_Y: 642,
};

// Page 2 - Section F monthly breakdown
const P2 = {
  // Column X positions
  FROM_X: 45,
  TO_X: 130,
  CONTRIB_DOLLARS_X: 210,
  CONTRIB_CENTS_X: 260,
  PENALTY_DOLLARS_X: 300,
  PENALTY_CENTS_X: 345,
  INTEREST_DOLLARS_X: 385,
  INTEREST_CENTS_X: 430,
  TOTAL_DOLLARS_X: 465,
  TOTAL_CENTS_X: 510,
  NUM_EMPLOYEES_X: 555,
  
  // First data row Y and row height
  FIRST_ROW_Y: 103,
  ROW_HEIGHT: 17.3,
  MAX_ROWS: 20,
};

interface NI187ManualFields {
  balanceBf?: number;
  penalty?: number;
  interest?: number;
  paymentMethod?: 'cash' | 'cheque';
}

export const generateNI187Report = async (
  carePlanId: string,
  familyId: string,
  periodStart: Date,
  periodEnd: Date,
  manualFields?: NI187ManualFields
): Promise<string | null> => {
  try {
    // Fetch data in parallel
    const [employer, countResult, entriesResult] = await Promise.all([
      fetchEmployerSettings(familyId),
      supabase
        .from('care_team_members')
        .select('*', { count: 'exact', head: true })
        .eq('care_plan_id', carePlanId)
        .eq('is_nis_registered', true),
      supabase
        .from('payroll_entries')
        .select('*')
        .eq('care_plan_id', carePlanId)
        .gte('pay_period_start', periodStart.toISOString())
        .lte('pay_period_start', periodEnd.toISOString())
        .eq('nis_applicable', true),
    ]);

    if (entriesResult.error) throw entriesResult.error;

    const employeeCount = countResult.count || 0;
    const allEntries = entriesResult.data || [];

    // Load blank NI 187 PDF (2 pages)
    const templateResponse = await fetch('/forms/NI187_blank.pdf');
    const templateBytes = await templateResponse.arrayBuffer();
    const pdfDoc = await PDFDocument.load(templateBytes);
    const pages = pdfDoc.getPages();
    const page1 = pages[0];
    const page2 = pages.length > 1 ? pages[1] : null;
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 8;

    const drawOnPage = (page: any, text: string, x: number, structY: number, size = fontSize) => {
      const { height: pageHeight } = page.getSize();
      const pdfY = pageHeight - structY - size;
      page.drawText(String(text), { x, y: pdfY, size, font, color: rgb(0, 0, 0) });
    };

    // Helper to split dollars and cents
    const splitAmount = (amount: number): [string, string] => {
      const parts = amount.toFixed(2).split('.');
      return [parts[0], parts[1]];
    };

    // === PAGE 1: SECTIONS A-E ===
    
    // Section A: Employer Information
    drawOnPage(page1, employer?.tradeName || '', P1.TRADE_NAME_X, P1.TRADE_NAME_Y);
    drawOnPage(page1, employer?.address || '', P1.ADDRESS_X, P1.ADDRESS_Y);
    
    if (employer?.employerRegistrationNumber) {
      drawOnPage(page1, employer.employerRegistrationNumber, P1.REG_NO_X, P1.REG_NO_Y);
    }
    if (employer?.phone) {
      drawOnPage(page1, employer.phone, P1.TELEPHONE_X, P1.TELEPHONE_Y);
    }

    // Contribution Period
    drawOnPage(page1, format(periodStart, 'yyyy'), P1.PERIOD_FROM_YYYY_X, P1.PERIOD_Y);
    drawOnPage(page1, format(periodStart, 'MM'), P1.PERIOD_FROM_MM_X, P1.PERIOD_Y);
    drawOnPage(page1, format(periodStart, 'dd'), P1.PERIOD_FROM_DD_X, P1.PERIOD_Y);
    drawOnPage(page1, format(periodEnd, 'yyyy'), P1.PERIOD_TO_YYYY_X, P1.PERIOD_Y);
    drawOnPage(page1, format(periodEnd, 'MM'), P1.PERIOD_TO_MM_X, P1.PERIOD_Y);
    drawOnPage(page1, format(periodEnd, 'dd'), P1.PERIOD_TO_DD_X, P1.PERIOD_Y);

    // Number of employees
    drawOnPage(page1, String(employeeCount), P1.NUM_EMPLOYEES_X, P1.NUM_EMPLOYEES_Y);

    // Section B: Value of Contributions Payable
    const balanceBf = manualFields?.balanceBf || 0;
    const totalEmployeeContrib = allEntries.reduce((s, e) => s + (e.employee_contribution || 0), 0);
    const totalEmployerContrib = allEntries.reduce((s, e) => s + (e.employer_contribution || 0), 0);
    const contributionsDue = totalEmployeeContrib + totalEmployerContrib;
    const penalty = manualFields?.penalty || 0;
    const interest = manualFields?.interest || 0;
    const totalAmountDue = balanceBf + contributionsDue + penalty + interest;
    const totalPaid = allEntries
      .filter((e: any) => e.payment_status === 'paid')
      .reduce((s, e) => s + (e.employee_contribution || 0) + (e.employer_contribution || 0), 0);
    const balanceCf = totalAmountDue - totalPaid;

    // Draw Section B values
    const sectionBValues: [number, number][] = [
      [P1.BALANCE_BF_Y, balanceBf],
      [P1.CONTRIBUTIONS_DUE_Y, contributionsDue],
      [P1.PENALTY_Y, penalty],
      [P1.INTEREST_Y, interest],
      [P1.TOTAL_AMOUNT_DUE_Y, totalAmountDue],
      [P1.AMOUNT_PAID_Y, totalPaid],
      [P1.BALANCE_CF_Y, balanceCf],
    ];

    sectionBValues.forEach(([y, amount]) => {
      const [dollars, cents] = splitAmount(amount);
      drawOnPage(page1, dollars, P1.SECTION_B_DOLLARS_X, y);
      drawOnPage(page1, cents, P1.SECTION_B_CENTS_X, y);
    });

    // Section C: Method of Payment
    const paymentMethod = manualFields?.paymentMethod || 'cheque';
    if (paymentMethod === 'cash') {
      const [d, c] = splitAmount(totalPaid);
      drawOnPage(page1, d, P1.CASH_DOLLARS_X, P1.CASH_Y);
      drawOnPage(page1, c, P1.CASH_CENTS_X, P1.CASH_Y);
    } else {
      const [d, c] = splitAmount(totalPaid);
      drawOnPage(page1, d, P1.CHEQUE_DOLLARS_X, P1.CHEQUE_Y);
      drawOnPage(page1, c, P1.CHEQUE_CENTS_X, P1.CHEQUE_Y);
    }
    // Total payment
    const [totalD, totalC] = splitAmount(totalPaid);
    drawOnPage(page1, totalD, P1.TOTAL_PAYMENT_DOLLARS_X, P1.TOTAL_PAYMENT_Y);
    drawOnPage(page1, totalC, P1.TOTAL_PAYMENT_CENTS_X, P1.TOTAL_PAYMENT_Y);

    // Section D: Certificate - Date
    const today = new Date();
    drawOnPage(page1, format(today, 'yyyy'), P1.DATE_YYYY_X, P1.DATE_Y);
    drawOnPage(page1, format(today, 'MM'), P1.DATE_MM_X, P1.DATE_Y);
    drawOnPage(page1, format(today, 'dd'), P1.DATE_DD_X, P1.DATE_Y);

    // === PAGE 2: SECTION F - Monthly Breakdown ===
    if (page2) {
      const months = eachMonthOfInterval({ start: periodStart, end: periodEnd });
      
      months.slice(0, P2.MAX_ROWS).forEach((monthStart, rowIndex) => {
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
        const rowY = P2.FIRST_ROW_Y + (rowIndex * P2.ROW_HEIGHT) + 4;

        // Filter entries for this month
        const monthEntries = allEntries.filter((e: any) => {
          const d = new Date(e.pay_period_start || e.created_at);
          return d >= monthStart && d <= monthEnd;
        });

        const monthContrib = monthEntries.reduce((s, e) => 
          s + (e.employee_contribution || 0) + (e.employer_contribution || 0), 0);
        const monthEmployees = new Set(monthEntries.map((e: any) => e.care_team_member_id)).size;

        // From / To dates
        drawOnPage(page2, format(monthStart, 'yy/MM/dd'), P2.FROM_X, rowY, 7);
        drawOnPage(page2, format(monthEnd, 'yy/MM/dd'), P2.TO_X, rowY, 7);

        // Contributions Due
        const [cd, cc] = splitAmount(monthContrib);
        drawOnPage(page2, cd, P2.CONTRIB_DOLLARS_X, rowY, 7);
        drawOnPage(page2, cc, P2.CONTRIB_CENTS_X, rowY, 7);

        // Penalty & Interest (0 unless manually entered)
        drawOnPage(page2, '0', P2.PENALTY_DOLLARS_X, rowY, 7);
        drawOnPage(page2, '00', P2.PENALTY_CENTS_X, rowY, 7);
        drawOnPage(page2, '0', P2.INTEREST_DOLLARS_X, rowY, 7);
        drawOnPage(page2, '00', P2.INTEREST_CENTS_X, rowY, 7);

        // Total
        const [td, tc] = splitAmount(monthContrib);
        drawOnPage(page2, td, P2.TOTAL_DOLLARS_X, rowY, 7);
        drawOnPage(page2, tc, P2.TOTAL_CENTS_X, rowY, 7);

        // Number of employees
        drawOnPage(page2, String(monthEmployees), P2.NUM_EMPLOYEES_X, rowY, 7);
      });
    }

    // Generate output
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([new Uint8Array(pdfBytes) as any], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error generating NI 187 report:', error);
    return null;
  }
};
