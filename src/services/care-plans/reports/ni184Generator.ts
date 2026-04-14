import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, startOfWeek, endOfWeek, getWeek } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { fetchEmployerSettings } from '@/services/care-plans/team/employerSettingsService';
import type { EmployerSettings } from '@/types/careTypes';

interface NI184Employee {
  nisNumber: string;
  fullName: string;
  dateOfBirth: string;
  dateEmployed: string;
  salary: number;
  weeklyContributions: { week: number; employee: number; employer: number }[];
  totalEmployee: number;
  totalEmployer: number;
}

/**
 * Generate NI 184 - Statement of Contribution Paid/Due
 * Per-employee detail for a given month
 */
export const generateNI184Report = async (
  carePlanId: string,
  familyId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<string | null> => {
  try {
    // Fetch employer settings
    const employer = await fetchEmployerSettings(familyId);

    // Fetch NIS-registered care team members
    const { data: members, error: membersError } = await supabase
      .from('care_team_members')
      .select('*, profiles:caregiver_id(full_name)')
      .eq('care_plan_id', carePlanId)
      .eq('is_nis_registered', true);

    if (membersError) throw membersError;
    if (!members || members.length === 0) {
      return null;
    }

    // Fetch payroll entries for the period
    const { data: entries, error: entriesError } = await supabase
      .from('payroll_entries')
      .select('*')
      .eq('care_plan_id', carePlanId)
      .gte('pay_period_start', periodStart.toISOString())
      .lte('pay_period_start', periodEnd.toISOString())
      .eq('nis_applicable', true);

    if (entriesError) throw entriesError;

    // Build employee data
    const employees: NI184Employee[] = members.map((m: any) => {
      const memberEntries = (entries || []).filter((e: any) => e.care_team_member_id === m.id);
      
      // Group by ISO week
      const weekMap = new Map<number, { employee: number; employer: number }>();
      let totalSalary = 0;

      for (const entry of memberEntries) {
        const entryDate = new Date(entry.pay_period_start || entry.created_at);
        const weekNum = getWeek(entryDate, { weekStartsOn: 1 });
        const existing = weekMap.get(weekNum) || { employee: 0, employer: 0 };
        existing.employee += entry.employee_contribution || 0;
        existing.employer += entry.employer_contribution || 0;
        weekMap.set(weekNum, existing);
        totalSalary += entry.gross_pay || entry.total_amount || 0;
      }

      const weeklyContributions = Array.from(weekMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([week, vals]) => ({ week, ...vals }));

      return {
        nisNumber: m.nis_number || 'N/A',
        fullName: m.profiles?.full_name || m.display_name || 'Unknown',
        dateOfBirth: m.date_of_birth ? format(new Date(m.date_of_birth), 'dd/MM/yyyy') : 'N/A',
        dateEmployed: m.date_employed ? format(new Date(m.date_employed), 'dd/MM/yyyy') : 'N/A',
        salary: totalSalary,
        weeklyContributions,
        totalEmployee: weeklyContributions.reduce((sum, w) => sum + w.employee, 0),
        totalEmployer: weeklyContributions.reduce((sum, w) => sum + w.employer, 0),
      };
    });

    // Generate PDF
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(14);
    doc.text('NI 184 - Statement of Contribution Paid/Due', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(9);
    doc.text('National Insurance Board of Trinidad & Tobago', pageWidth / 2, 21, { align: 'center' });

    // Employer details
    doc.setFontSize(10);
    let y = 30;
    doc.text(`Trade Name: ${employer?.tradeName || '___________'}`, 14, y);
    doc.text(`Registration No: ${employer?.employerRegistrationNumber || '___________'}`, 120, y);
    doc.text(`Service Centre: ${employer?.serviceCentreCode || '___________'}`, 220, y);
    y += 6;
    doc.text(`Address: ${employer?.address || '___________'}`, 14, y);
    doc.text(`Phone: ${employer?.phone || '___________'}`, 220, y);
    y += 6;
    doc.text(`Contribution Period: ${format(periodStart, 'dd/MM/yyyy')} to ${format(periodEnd, 'dd/MM/yyyy')}`, 14, y);

    // Table
    const maxWeeks = Math.max(...employees.map(e => e.weeklyContributions.length), 1);
    const weekHeaders = Array.from({ length: Math.min(maxWeeks, 5) }, (_, i) => `Week ${i + 1}`);

    const tableHeaders = [
      'NIS Number',
      'Name (Surname First)',
      'DOB',
      'Date Employed',
      'Salary',
      ...weekHeaders.map(w => `${w}\nEE / ER`),
      'Total EE',
      'Total ER',
    ];

    const tableBody = employees.map(emp => {
      const weekCells = Array.from({ length: Math.min(maxWeeks, 5) }, (_, i) => {
        const w = emp.weeklyContributions[i];
        return w ? `$${w.employee.toFixed(2)}\n$${w.employer.toFixed(2)}` : '-';
      });

      return [
        emp.nisNumber,
        emp.fullName,
        emp.dateOfBirth,
        emp.dateEmployed,
        `$${emp.salary.toFixed(2)}`,
        ...weekCells,
        `$${emp.totalEmployee.toFixed(2)}`,
        `$${emp.totalEmployer.toFixed(2)}`,
      ];
    });

    autoTable(doc, {
      head: [tableHeaders],
      body: tableBody,
      startY: y + 8,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], fontSize: 7 },
    });

    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    return url;
  } catch (error) {
    console.error('Error generating NI 184 report:', error);
    return null;
  }
};
