
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import type { WorkLog, WorkLogExpense, PayrollEntry } from './types/workLogTypes';

// Add the missing type for jspdf-autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generatePayReceipt = async (workLog: WorkLog): Promise<string> => {
  // Get the care team member details
  const { data: teamMember, error: teamMemberError } = await supabase
    .from('care_team_members')
    .select('regular_rate, overtime_rate')
    .eq('id', workLog.care_team_member_id)
    .single();

  if (teamMemberError) {
    console.error('Error fetching care team member:', teamMemberError);
    throw new Error('Failed to generate receipt: Could not fetch care team member details');
  }

  // Calculate hours worked
  const startTime = new Date(workLog.start_time);
  const endTime = new Date(workLog.end_time);
  const hoursWorked = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  
  // Get rate information from work log
  const { data: workLogData, error: workLogError } = await supabase
    .from('work_logs')
    .select('rate_type')
    .eq('id', workLog.id)
    .single();

  if (workLogError && workLogError.code !== 'PGRST116') {
    console.error('Error fetching work log:', workLogError);
  }

  // Use base_rate and rate_multiplier from the work log
  const baseRate = workLog.base_rate || 25;
  const rateMultiplier = workLog.rate_multiplier || 1;
  
  const appliedRate = baseRate * rateMultiplier;
  
  // Determine rate type based on multiplier
  let rateType = 'Regular';
  if (rateMultiplier === 0.5) rateType = 'Shadow Day';
  else if (rateMultiplier === 1.5) rateType = 'Overtime';
  else if (rateMultiplier === 2) rateType = 'Double Time';
  else if (rateMultiplier === 3) rateType = 'Triple Time';
  else if (rateMultiplier === 0.75) rateType = 'Shadow Day on Holiday';

  // Calculate total for hours
  const hoursTotal = hoursWorked * appliedRate;
  
  // Calculate total for expenses
  const expensesTotal = workLog.expenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
  
  // Calculate grand total
  const grandTotal = hoursTotal + expensesTotal;

  // Create PDF document
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(20);
  doc.text('Pay Receipt', 105, 20, { align: 'center' });
  
  // Add receipt details
  doc.setFontSize(12);
  doc.text(`Caregiver: ${workLog.caregiver_name || 'Unknown'}`, 20, 40);
  doc.text(`Date: ${format(startTime, 'MMM d, yyyy')}`, 20, 50);
  doc.text(`Time: ${format(startTime, 'h:mm a')} - ${format(endTime, 'h:mm a')}`, 20, 60);
  doc.text(`Status: ${workLog.status.charAt(0).toUpperCase() + workLog.status.slice(1)}`, 20, 70);
  
  // Add hours and rate table
  doc.autoTable({
    startY: 80,
    head: [['Description', 'Hours', 'Rate', 'Total']],
    body: [
      [
        `Care work (${rateType} rate)`,
        hoursWorked.toFixed(1) + ' hrs',
        '$' + appliedRate.toFixed(2) + '/hr',
        '$' + hoursTotal.toFixed(2)
      ]
    ]
  });
  
  // Add expenses table if there are any
  if (workLog.expenses && workLog.expenses.length > 0) {
    const expensesTableY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFontSize(14);
    doc.text('Expenses', 20, expensesTableY);
    
    const expenseRows = workLog.expenses.map((expense: WorkLogExpense) => [
      expense.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      expense.description,
      '$' + Number(expense.amount).toFixed(2)
    ]);
    
    doc.autoTable({
      startY: expensesTableY + 10,
      head: [['Category', 'Description', 'Amount']],
      body: expenseRows
    });
    
    // Add total row for expenses
    doc.autoTable({
      startY: (doc as any).lastAutoTable.finalY + 5,
      body: [['', 'Total Expenses', '$' + expensesTotal.toFixed(2)]],
      styles: { fontStyle: 'bold' },
      theme: 'plain'
    });
  }
  
  // Add grand total
  const grandTotalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  doc.text('Grand Total:', 140, grandTotalY);
  doc.setFontSize(16);
  doc.text('$' + grandTotal.toFixed(2), 180, grandTotalY, { align: 'right' });
  
  // Add notes
  if (workLog.notes) {
    const notesY = grandTotalY + 20;
    doc.setFontSize(14);
    doc.text('Notes:', 20, notesY);
    doc.setFontSize(12);
    doc.text(workLog.notes, 20, notesY + 10);
  }
  
  // Add footer
  const footerY = doc.internal.pageSize.height - 20;
  doc.setFontSize(10);
  doc.text('This is an automatically generated receipt.', 105, footerY, { align: 'center' });
  doc.text(`Generated on: ${format(new Date(), 'MMM d, yyyy h:mm a')}`, 105, footerY + 5, { align: 'center' });
  
  // Convert to data URL
  const pdfDataUrl = doc.output('datauristring');
  
  return pdfDataUrl;
};

// New function to generate a combined payroll receipt for a date range
export const generatePayrollReport = async (
  carePlanId: string,
  caregiverName?: string,
  dateRange?: { from?: Date; to?: Date }
): Promise<string> => {
  try {
    // Fetch payroll entries
    const entries = await fetchPayrollEntries(carePlanId);
    
    // Filter entries if needed
    const filteredEntries = entries.filter(entry => {
      // Filter by caregiver name
      const matchesCaregiverFilter = !caregiverName || 
        entry.caregiver_name?.toLowerCase().includes(caregiverName.toLowerCase());
        
      // Date range filter logic
      let withinDateRange = true;
      const entryDate = entry.entered_at ? new Date(entry.entered_at) : 
                      entry.created_at ? new Date(entry.created_at) : null;
      
      if (entryDate && dateRange?.from) {
        withinDateRange = withinDateRange && entryDate >= dateRange.from;
      }
      
      if (entryDate && dateRange?.to) {
        // Add one day to include entries on the end date
        const endDate = new Date(dateRange.to);
        endDate.setDate(endDate.getDate() + 1);
        withinDateRange = withinDateRange && entryDate < endDate;
      }
      
      return matchesCaregiverFilter && withinDateRange;
    });

    if (filteredEntries.length === 0) {
      throw new Error('No payroll entries found for the selected criteria');
    }

    // Create PDF document
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.text('Payroll Report', 105, 20, { align: 'center' });
    
    // Add report details
    doc.setFontSize(12);
    doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy')}`, 20, 30);
    
    if (caregiverName) {
      doc.text(`Caregiver: ${caregiverName}`, 20, 40);
    }
    
    if (dateRange?.from && dateRange?.to) {
      doc.text(`Period: ${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`, 20, 50);
    }
    
    // Prepare data for the table
    const tableHeaders = ['Caregiver', 'Date', 'Hours', 'Rate', 'Total'];
    const tableRows = filteredEntries.map(entry => {
      const entryDate = entry.entered_at ? format(new Date(entry.entered_at), 'MM/dd/yyyy') : 
                      entry.created_at ? format(new Date(entry.created_at), 'MM/dd/yyyy') : 'N/A';
      
      let hoursText = '';
      if (entry.regular_hours > 0) hoursText += `Reg: ${entry.regular_hours}h `;
      if (entry.overtime_hours && entry.overtime_hours > 0) hoursText += `OT: ${entry.overtime_hours}h `;
      if (entry.holiday_hours && entry.holiday_hours > 0) hoursText += `Hol: ${entry.holiday_hours}h `;
      if (entry.shadow_hours && entry.shadow_hours > 0) hoursText += `Shadow: ${entry.shadow_hours}h `;
      
      return [
        entry.caregiver_name || 'Unknown',
        entryDate,
        hoursText.trim(),
        `$${entry.regular_rate.toFixed(2)}/hr`,
        `$${entry.total_amount.toFixed(2)}`
      ];
    });
    
    // Add the table to the PDF
    doc.autoTable({
      startY: 60,
      head: [tableHeaders],
      body: tableRows,
      theme: 'striped'
    });
    
    // Calculate totals
    const totalAmount = filteredEntries.reduce((sum, entry) => sum + entry.total_amount, 0);
    
    // Add total to the PDF
    const totalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text('Total Amount:', 140, totalY);
    doc.setFontSize(16);
    doc.text('$' + totalAmount.toFixed(2), 180, totalY, { align: 'right' });
    
    // Add footer
    const footerY = doc.internal.pageSize.height - 20;
    doc.setFontSize(10);
    doc.text('This is an automatically generated payroll report.', 105, footerY, { align: 'center' });
    
    // Convert to data URL
    const pdfDataUrl = doc.output('datauristring');
    
    return pdfDataUrl;
  } catch (error) {
    console.error('Error generating payroll report:', error);
    throw new Error('Failed to generate payroll report');
  }
};

// Separate function to fetch payroll entries for the report
const fetchPayrollEntries = async (carePlanId: string): Promise<PayrollEntry[]> => {
  try {
    const { data: entries, error } = await supabase
      .from('payroll_entries')
      .select(`
        *,
        care_team_members:care_team_member_id (
          display_name
        )
      `)
      .eq('care_plan_id', carePlanId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    if (entries.length > 0) {
      return entries.map(entry => {        
        return {
          ...entry,
          caregiver_name: entry.care_team_members?.display_name || 'Unknown',
          payment_status: ['pending', 'approved', 'paid'].includes(entry.payment_status) 
            ? entry.payment_status as 'pending' | 'approved' | 'paid'
            : 'pending'
        };
      });
    }
    
    return [] as PayrollEntry[];
  } catch (error) {
    console.error("Error fetching payroll entries:", error);
    throw new Error("Failed to load payroll entries");
  }
};
