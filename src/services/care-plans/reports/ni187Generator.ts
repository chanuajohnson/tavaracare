import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, eachMonthOfInterval } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { fetchEmployerSettings } from '@/services/care-plans/team/employerSettingsService';

/**
 * Generate NI 187 - Summary of Contributions Due/In Arrears
 * Employer-level summary for a given period
 */
export const generateNI187Report = async (
  carePlanId: string,
  familyId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<string | null> => {
  try {
    const employer = await fetchEmployerSettings(familyId);

    // Count NIS-registered employees
    const { count: employeeCount } = await supabase
      .from('care_team_members')
      .select('*', { count: 'exact', head: true })
      .eq('care_plan_id', carePlanId)
      .eq('is_nis_registered', true);

    // Fetch payroll entries for the period
    const { data: entries, error } = await supabase
      .from('payroll_entries')
      .select('*')
      .eq('care_plan_id', carePlanId)
      .gte('pay_period_start', periodStart.toISOString())
      .lte('pay_period_start', periodEnd.toISOString())
      .eq('nis_applicable', true);

    if (error) throw error;

    const allEntries = entries || [];
    const totalEmployeeContrib = allEntries.reduce((s, e) => s + (e.employee_contribution || 0), 0);
    const totalEmployerContrib = allEntries.reduce((s, e) => s + (e.employer_contribution || 0), 0);
    const totalContributions = totalEmployeeContrib + totalEmployerContrib;
    const totalPaid = allEntries
      .filter((e: any) => e.payment_status === 'paid')
      .reduce((s, e) => s + (e.employee_contribution || 0) + (e.employer_contribution || 0), 0);
    const balance = totalContributions - totalPaid;

    // Monthly breakdown (Section F)
    const months = eachMonthOfInterval({ start: periodStart, end: periodEnd });
    const monthlyBreakdown = months.map(monthStart => {
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      const monthEntries = allEntries.filter((e: any) => {
        const d = new Date(e.pay_period_start || e.created_at);
        return d >= monthStart && d <= monthEnd;
      });
      const ee = monthEntries.reduce((s, e) => s + (e.employee_contribution || 0), 0);
      const er = monthEntries.reduce((s, e) => s + (e.employer_contribution || 0), 0);
      return {
        month: format(monthStart, 'MMMM yyyy'),
        employeeContrib: ee,
        employerContrib: er,
        total: ee + er,
      };
    });

    // Generate PDF
    const doc = new jsPDF('portrait', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(14);
    doc.text('NI 187 - Summary of Contributions Due/In Arrears', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(9);
    doc.text('National Insurance Board of Trinidad & Tobago', pageWidth / 2, 21, { align: 'center' });

    // Section A: Employer Details
    let y = 32;
    doc.setFontSize(11);
    doc.text('Section A: Employer Details', 14, y);
    doc.setFontSize(9);
    y += 7;
    doc.text(`Trade Name: ${employer?.tradeName || '___________'}`, 14, y);
    y += 5;
    doc.text(`Registration No: ${employer?.employerRegistrationNumber || '___________'}`, 14, y);
    doc.text(`Service Centre: ${employer?.serviceCentreCode || '___________'}`, 110, y);
    y += 5;
    doc.text(`Address: ${employer?.address || '___________'}`, 14, y);
    y += 5;
    doc.text(`Phone: ${employer?.phone || '___________'}`, 14, y);

    // Section B: Summary
    y += 10;
    doc.setFontSize(11);
    doc.text('Section B: Summary of Contributions', 14, y);
    y += 3;

    autoTable(doc, {
      startY: y,
      head: [['Description', 'Amount (TTD)']],
      body: [
        ['Contribution Period', `${format(periodStart, 'dd/MM/yyyy')} to ${format(periodEnd, 'dd/MM/yyyy')}`],
        ['Number of Employees', String(employeeCount || 0)],
        ['Total Employee Contributions', `$${totalEmployeeContrib.toFixed(2)}`],
        ['Total Employer Contributions', `$${totalEmployerContrib.toFixed(2)}`],
        ['Total Contributions Due', `$${totalContributions.toFixed(2)}`],
        ['Penalty', '$0.00'],
        ['Interest', '$0.00'],
        ['Grand Total', `$${totalContributions.toFixed(2)}`],
        ['Amount Paid', `$${totalPaid.toFixed(2)}`],
        ['Balance Outstanding', `$${balance.toFixed(2)}`],
      ],
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
      columnStyles: { 1: { halign: 'right' } },
    });

    // Section F: Monthly Breakdown
    const finalY = (doc as any).lastAutoTable?.finalY || y + 80;
    doc.setFontSize(11);
    doc.text('Section F: Monthly Breakdown', 14, finalY + 10);

    autoTable(doc, {
      startY: finalY + 14,
      head: [['Month', 'Employee (TTD)', 'Employer (TTD)', 'Total (TTD)']],
      body: monthlyBreakdown.map(m => [
        m.month,
        `$${m.employeeContrib.toFixed(2)}`,
        `$${m.employerContrib.toFixed(2)}`,
        `$${m.total.toFixed(2)}`,
      ]),
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
    });

    const blob = doc.output('blob');
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error generating NI 187 report:', error);
    return null;
  }
};
