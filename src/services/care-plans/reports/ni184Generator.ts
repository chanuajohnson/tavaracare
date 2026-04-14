import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { format, getWeek } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { fetchEmployerSettings } from '@/services/care-plans/team/employerSettingsService';

/**
 * Generate NI 184 - Statement of Contribution Paid/Due
 * Fills the official NIBTT government form template with payroll data
 * 
 * NI 184 is landscape A4 (1008 x 612 PDF points)
 * Coordinate system: y=0 at top, increasing downward (pdfplumber convention)
 * pdf-lib uses y=0 at bottom, so we convert: pdfY = pageHeight - structureY
 */

// Column X positions (from structure analysis of NI184_blank.pdf)
const COL = {
  NIS_NUMBER: 58,       // Col 1: NIS Number
  SURNAME: 200,         // Col 2: Surname
  FIRST_NAME: 365,      // Col 2: First Name
  DOB_YYYY: 432,        // Col 3: DOB Year
  DOB_MM: 470,          // Col 3: DOB Month
  DOB_DD: 504,          // Col 3: DOB Day
  EMPLOYED_YYYY: 526,   // Col 4: Date Employed Year
  EMPLOYED_MM: 564,     // Col 4: Date Employed Month
  EMPLOYED_DD: 598,     // Col 4: Date Employed Day
  SALARY: 632,          // Col 5: Salary for Period
  WK1: 685,             // Col 6: Week 1
  WK2: 740,             // Col 6: Week 2
  WK3: 785,             // Col 6: Week 3
  WK4: 830,             // Col 6: Week 4
  WK5: 870,             // Col 6: Week 5
  TOTAL: 920,           // Col 7: Total Value
};

// Row Y positions (structure top values, will be converted to pdf-lib coords)
const HEADER = {
  TRADE_NAME: 78,       // Employer's Trade Name
  REG_NUMBER: 73,       // Registration Number boxes start
  SERVICE_CENTRE: 73,   // Service Centre Code
  ADDRESS: 100,         // Address line
  TELEPHONE: 105,       // Telephone
  PERIOD_FROM_YYYY: 150,
  PERIOD_FROM_MM: 152,
  PERIOD_FROM_DD: 152,
  PERIOD_TO_YYYY: 150,
  PERIOD_TO_MM: 152,
  PERIOD_TO_DD: 152,
  NUM_WEEKS: 140,
};

// Data rows start at y=228 (top of first data row), each row is 18pt tall
const DATA_ROW_START = 228;
const DATA_ROW_HEIGHT = 18;
const MAX_ROWS = 11; // 11 employee rows on the form

// Footer
const FOOTER = {
  TOTAL_EMPLOYEES: 432,  // y position
  TOTAL_CONTRIBUTIONS: 437,
  PREPARED_BY: 568,
  DATE_YYYY: 568,
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

    // Load blank NI 184 PDF
    const templateResponse = await fetch('/forms/NI184_blank.pdf');
    const templateBytes = await templateResponse.arrayBuffer();
    const pdfDoc = await PDFDocument.load(templateBytes);
    const page = pdfDoc.getPages()[0];
    const { width: mediaboxWidth, height: mediaboxHeight } = page.getSize();
    const rotation = page.getRotation().angle;
    // NI 184 has /Rotate=90: mediabox is portrait (612x1008) but displayed landscape
    // pdf-lib drawText uses the visual coordinate system where height = mediaboxWidth for rotated pages
    const visualHeight = (rotation === 90 || rotation === 270) ? mediaboxWidth : mediaboxHeight;
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 7;

    // Helper: convert structure Y (top-down) to pdf-lib Y (bottom-up)
    const drawText = (text: string, x: number, structY: number, size = fontSize) => {
      const pdfY = visualHeight - structY - size;
      page.drawText(text, { x, y: pdfY, size, font, color: rgb(0, 0, 0) });
    };

    // === HEADER SECTION ===
    // Trade Name
    drawText(employer?.tradeName || '', 112, HEADER.TRADE_NAME);
    
    // Registration Number
    if (employer?.employerRegistrationNumber) {
      drawText(employer.employerRegistrationNumber, 595, HEADER.REG_NUMBER);
    }
    
    // Service Centre Code
    if (employer?.serviceCentreCode) {
      drawText(employer.serviceCentreCode, 805, HEADER.SERVICE_CENTRE);
    }
    
    // Address
    drawText(employer?.address || '', 100, HEADER.ADDRESS);
    
    // Telephone
    if (employer?.phone) {
      drawText(employer.phone, 770, HEADER.TELEPHONE);
    }

    // Contribution Period
    const fromYear = format(periodStart, 'yyyy');
    const fromMonth = format(periodStart, 'MM');
    const fromDay = format(periodStart, 'dd');
    const toYear = format(periodEnd, 'yyyy');
    const toMonth = format(periodEnd, 'MM');
    const toDay = format(periodEnd, 'dd');

    drawText(fromYear, 134, HEADER.PERIOD_FROM_YYYY);
    drawText(fromMonth, 183, HEADER.PERIOD_FROM_MM);
    drawText(fromDay, 223, HEADER.PERIOD_FROM_DD);
    drawText(toYear, 287, HEADER.PERIOD_TO_YYYY);
    drawText(toMonth, 336, HEADER.PERIOD_TO_MM);
    drawText(toDay, 376, HEADER.PERIOD_TO_DD);

    // Number of weeks
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const numWeeks = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / msPerWeek);
    drawText(String(numWeeks), 545, HEADER.NUM_WEEKS);

    // === EMPLOYEE DATA ROWS ===
    let totalContributions = 0;

    members.slice(0, MAX_ROWS).forEach((member: any, rowIndex: number) => {
      const rowY = DATA_ROW_START + (rowIndex * DATA_ROW_HEIGHT) + 4; // +4 for vertical centering

      // Get this member's payroll entries
      const memberEntries = entries.filter((e: any) => e.care_team_member_id === member.id);

      // NIS Number
      drawText(member.nis_number || '', COL.NIS_NUMBER, rowY);

      // Name (Surname, First Name)
      const fullName = member.profiles?.full_name || member.display_name || '';
      const nameParts = fullName.split(' ');
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
      const totalSalary = memberEntries.reduce((s: number, e: any) => s + (e.gross_pay || e.total_amount || 0), 0);
      drawText(totalSalary.toFixed(2), COL.SALARY, rowY);

      // Weekly contribution breakdown
      const weekMap = new Map<number, number>();
      for (const entry of memberEntries) {
        const entryDate = new Date(entry.pay_period_start || entry.created_at);
        const weekNum = getWeek(entryDate, { weekStartsOn: 1 });
        const existing = weekMap.get(weekNum) || 0;
        const contribTotal = (entry.employee_contribution || 0) + (entry.employer_contribution || 0);
        weekMap.set(weekNum, existing + contribTotal);
      }

      const weeklyValues = Array.from(weekMap.values()).sort();
      const weekCols = [COL.WK1, COL.WK2, COL.WK3, COL.WK4, COL.WK5];
      weeklyValues.slice(0, 5).forEach((val, i) => {
        drawText(val.toFixed(2), weekCols[i], rowY);
      });

      // Total value for this employee
      const empTotal = weeklyValues.reduce((s, v) => s + v, 0);
      drawText(empTotal.toFixed(2), COL.TOTAL, rowY);
      totalContributions += empTotal;
    });

    // === FOOTER ===
    // Total employees
    drawText(String(members.length), 155, FOOTER.TOTAL_EMPLOYEES);

    // Total value of contributions
    drawText(totalContributions.toFixed(2), 870, FOOTER.TOTAL_CONTRIBUTIONS);

    // Date (bottom right)
    const today = new Date();
    drawText(format(today, 'yyyy'), 875, FOOTER.DATE_YYYY);
    drawText(format(today, 'MM'), 920, FOOTER.DATE_YYYY);
    drawText(format(today, 'dd'), 950, FOOTER.DATE_YYYY);

    // Generate output
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error generating NI 184 report:', error);
    return null;
  }
};
