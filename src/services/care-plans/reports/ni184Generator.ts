import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { format, getWeek, startOfWeek, addWeeks, isWithinInterval } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { fetchEmployerSettings } from '@/services/care-plans/team/employerSettingsService';

/**
 * Generate NI 184 - Statement of Contribution Paid/Due
 * Fills the official NIBTT government form template with payroll data
 * 
 * The NI 184 blank template has MediaBox [0,0,612,1008] with /Rotate=90.
 * pdfplumber sees it as landscape 1008×612 (visual space).
 * pdf-lib draws in the unrotated mediabox space, so text appears rotated.
 * 
 * FIX: We embed the template page into a NEW unrotated landscape page (1008×612).
 * Then all coordinates from pdfplumber's structure analysis work directly:
 *   pdfLibY = visualHeight - structureY - fontSize
 * where visualHeight = 612 (the actual page height of the new unrotated page).
 */

// Visual page dimensions (landscape, post-normalization)
const PAGE_WIDTH = 1008;
const PAGE_HEIGHT = 612;

// Column X positions (from pdfplumber structure extraction of NI184_blank.pdf)
const COL = {
  NIS_NUMBER: 67,        // Col 1: NIS Number
  SURNAME: 202,          // Col 2: Surname
  FIRST_NAME: 363,       // Col 2: First Name
  DOB_YYYY: 430,         // Col 3: DOB Year
  DOB_MM: 469,           // Col 3: DOB Month
  DOB_DD: 502,           // Col 3: DOB Day
  EMPLOYED_YYYY: 524,    // Col 4: Date Employed Year
  EMPLOYED_MM: 563,      // Col 4: Date Employed Month
  EMPLOYED_DD: 596,      // Col 4: Date Employed Day
  SALARY: 643,           // Col 5: Salary for Period ($)
  WK1: 685,              // Col 6: Week 1 ($)
  WK2: 739,              // Col 6: Week 2 ($)
  WK3: 784,              // Col 6: Week 3 ($)
  WK4: 829,              // Col 6: Week 4 ($)
  WK5: 869,              // Col 6: Week 5 ($)
  TOTAL: 940,            // Col 7: Total Value ($)
};

// Header Y positions (pdfplumber top-down coordinates)
const HEADER = {
  TRADE_NAME_X: 112,
  TRADE_NAME_Y: 78,
  REG_NUMBER_X: 595,
  REG_NUMBER_Y: 73,
  SERVICE_CENTRE_X: 805,
  SERVICE_CENTRE_Y: 73,
  ADDRESS_X: 100,
  ADDRESS_Y: 100,
  TELEPHONE_X: 770,
  TELEPHONE_Y: 105,
  PERIOD_FROM_YYYY_X: 141,
  PERIOD_FROM_MM_X: 188,
  PERIOD_FROM_DD_X: 227,
  PERIOD_TO_YYYY_X: 294,
  PERIOD_TO_MM_X: 341,
  PERIOD_TO_DD_X: 380,
  PERIOD_Y: 152,
  NUM_WEEKS_X: 533,
  NUM_WEEKS_Y: 141,
};

// Data rows: first row starts at y=225 (top of row boundary), each row is 18pt
const DATA_ROW_START = 225;
const DATA_ROW_HEIGHT = 18;
const MAX_ROWS = 11;

// Footer positions
const FOOTER = {
  TOTAL_EMPLOYEES_X: 155,
  TOTAL_EMPLOYEES_Y: 429,
  TOTAL_CONTRIBUTIONS_X: 869,
  TOTAL_CONTRIBUTIONS_Y: 433,
  DATE_YYYY_X: 875,
  DATE_MM_X: 920,
  DATE_DD_X: 950,
  DATE_Y: 568,
};

export const generateNI184Report = async (
  carePlanId: string,
  familyId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<string | null> => {
  try {
    // Fetch data in parallel
    const [employer, membersResult, entriesResult] = await Promise.all([
      fetchEmployerSettings(familyId),
      supabase
        .from('care_team_members')
        .select('*, profiles:caregiver_id(full_name)')
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

    if (membersResult.error) throw membersResult.error;
    if (entriesResult.error) throw entriesResult.error;

    const members = membersResult.data || [];
    const entries = entriesResult.data || [];

    if (members.length === 0) {
      return null;
    }

    // Load blank NI 184 PDF template
    const templateResponse = await fetch('/forms/NI184_blank.pdf');
    const templateBytes = await templateResponse.arrayBuffer();
    const templateDoc = await PDFDocument.load(templateBytes);

    // Create a NEW document with an unrotated landscape page
    const pdfDoc = await PDFDocument.create();
    
    // Embed the rotated template page into the new document
    const [embeddedPage] = await pdfDoc.embedPages(templateDoc.getPages());
    
    // Add a fresh landscape page (no rotation)
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    
    // Draw the embedded template onto the new page
    // The embedded page handles the rotation internally
    page.drawPage(embeddedPage, {
      x: 0,
      y: 0,
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
    });

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 7;

    // Helper: convert pdfplumber top-down Y to pdf-lib bottom-up Y
    const drawText = (text: string, x: number, structY: number, size = fontSize) => {
      const pdfY = PAGE_HEIGHT - structY - size;
      page.drawText(text, { x, y: pdfY, size, font, color: rgb(0, 0, 0) });
    };

    // === HEADER SECTION ===
    drawText(employer?.tradeName || '', HEADER.TRADE_NAME_X, HEADER.TRADE_NAME_Y);
    
    if (employer?.employerRegistrationNumber) {
      drawText(employer.employerRegistrationNumber, HEADER.REG_NUMBER_X, HEADER.REG_NUMBER_Y);
    }
    
    if (employer?.serviceCentreCode) {
      drawText(employer.serviceCentreCode, HEADER.SERVICE_CENTRE_X, HEADER.SERVICE_CENTRE_Y);
    }
    
    drawText(employer?.address || '', HEADER.ADDRESS_X, HEADER.ADDRESS_Y);
    
    if (employer?.phone) {
      drawText(employer.phone, HEADER.TELEPHONE_X, HEADER.TELEPHONE_Y);
    }

    // Contribution Period
    drawText(format(periodStart, 'yyyy'), HEADER.PERIOD_FROM_YYYY_X, HEADER.PERIOD_Y);
    drawText(format(periodStart, 'MM'), HEADER.PERIOD_FROM_MM_X, HEADER.PERIOD_Y);
    drawText(format(periodStart, 'dd'), HEADER.PERIOD_FROM_DD_X, HEADER.PERIOD_Y);
    drawText(format(periodEnd, 'yyyy'), HEADER.PERIOD_TO_YYYY_X, HEADER.PERIOD_Y);
    drawText(format(periodEnd, 'MM'), HEADER.PERIOD_TO_MM_X, HEADER.PERIOD_Y);
    drawText(format(periodEnd, 'dd'), HEADER.PERIOD_TO_DD_X, HEADER.PERIOD_Y);

    // Number of weeks
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const numWeeks = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / msPerWeek);
    drawText(String(numWeeks), HEADER.NUM_WEEKS_X, HEADER.NUM_WEEKS_Y);

    // === EMPLOYEE DATA ROWS ===
    let totalContributions = 0;

    // Build ordered week slots for the period (chronological WK1..WK5)
    const periodWeekSlots: { start: Date; end: Date; weekNum: number }[] = [];
    let weekCursor = startOfWeek(periodStart, { weekStartsOn: 1 });
    while (weekCursor <= periodEnd && periodWeekSlots.length < 5) {
      const weekEnd = new Date(weekCursor.getTime() + 6 * 24 * 60 * 60 * 1000);
      periodWeekSlots.push({
        start: weekCursor,
        end: weekEnd,
        weekNum: getWeek(weekCursor, { weekStartsOn: 1 }),
      });
      weekCursor = addWeeks(weekCursor, 1);
    }

    members.slice(0, MAX_ROWS).forEach((member: any, rowIndex: number) => {
      // Center text vertically in the 18pt row: offset by ~6pt from top
      const rowY = DATA_ROW_START + (rowIndex * DATA_ROW_HEIGHT) + 6;

      const memberEntries = entries.filter((e: any) => e.care_team_member_id === member.id);

      // NIS Number
      drawText(member.nis_number || '', COL.NIS_NUMBER, rowY);

      // Name (Surname, First Name)
      const fullName = member.profiles?.full_name || member.display_name || '';
      const nameParts = fullName.trim().split(' ');
      const surname = nameParts.length > 1 ? nameParts.slice(-1).join(' ') : fullName;
      const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : '';
      drawText(surname.toUpperCase(), COL.SURNAME, rowY);
      drawText(firstName.toUpperCase(), COL.FIRST_NAME, rowY);

      // Date of Birth
      if (member.date_of_birth) {
        const dob = new Date(member.date_of_birth);
        drawText(format(dob, 'yyyy'), COL.DOB_YYYY, rowY);
        drawText(format(dob, 'MM'), COL.DOB_MM, rowY);
        drawText(format(dob, 'dd'), COL.DOB_DD, rowY);
      }

      // Date Employed
      if (member.date_employed) {
        const de = new Date(member.date_employed);
        drawText(format(de, 'yyyy'), COL.EMPLOYED_YYYY, rowY);
        drawText(format(de, 'MM'), COL.EMPLOYED_MM, rowY);
        drawText(format(de, 'dd'), COL.EMPLOYED_DD, rowY);
      }

      // Salary for period
      const totalSalary = memberEntries.reduce(
        (s: number, e: any) => s + (e.gross_pay || e.total_amount || 0), 0
      );
      drawText(totalSalary.toFixed(2), COL.SALARY, rowY);

      // Weekly contributions - chronological ordering using period week slots
      const weekCols = [COL.WK1, COL.WK2, COL.WK3, COL.WK4, COL.WK5];
      let empTotal = 0;

      periodWeekSlots.forEach((slot, i) => {
        const slotContrib = memberEntries
          .filter((e: any) => {
            const entryDate = new Date(e.pay_period_start || e.created_at);
            return getWeek(entryDate, { weekStartsOn: 1 }) === slot.weekNum;
          })
          .reduce((s: number, e: any) => 
            s + (e.employee_contribution || 0) + (e.employer_contribution || 0), 0
          );

        if (slotContrib > 0) {
          drawText(slotContrib.toFixed(2), weekCols[i], rowY);
          empTotal += slotContrib;
        }
      });

      // Total value for this employee
      drawText(empTotal.toFixed(2), COL.TOTAL, rowY);
      totalContributions += empTotal;
    });

    // === FOOTER ===
    drawText(String(members.length), FOOTER.TOTAL_EMPLOYEES_X, FOOTER.TOTAL_EMPLOYEES_Y);
    drawText(totalContributions.toFixed(2), FOOTER.TOTAL_CONTRIBUTIONS_X, FOOTER.TOTAL_CONTRIBUTIONS_Y);

    // Date
    const today = new Date();
    drawText(format(today, 'yyyy'), FOOTER.DATE_YYYY_X, FOOTER.DATE_Y);
    drawText(format(today, 'MM'), FOOTER.DATE_MM_X, FOOTER.DATE_Y);
    drawText(format(today, 'dd'), FOOTER.DATE_DD_X, FOOTER.DATE_Y);

    // Generate output
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([new Uint8Array(pdfBytes) as unknown as BlobPart], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error generating NI 184 report:', error);
    return null;
  }
};
