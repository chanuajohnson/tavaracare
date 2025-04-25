import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import type { WorkLog, WorkLogExpense } from './types/workLogTypes';

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

  // Determine rate based on rate_type
  const regularRate = Number(teamMember?.regular_rate) || 15;
  const overtimeRate = Number(teamMember?.overtime_rate) || regularRate * 1.5;
  const holidayRate = regularRate * 2;
  
  let appliedRate = regularRate;
  let rateType = 'Regular';
  
  if (workLog.rate_type === 'overtime' || workLogData?.rate_type === 'overtime') {
    appliedRate = overtimeRate;
    rateType = 'Overtime';
  } else if (workLog.rate_type === 'holiday' || workLogData?.rate_type === 'holiday') {
    appliedRate = holidayRate;
    rateType = 'Holiday';
  }
  
  // Use base_rate and rate_multiplier if available
  const baseRate = workLog.base_rate || 25;
  const rateMultiplier = workLog.rate_multiplier || 1;
  
  const appliedRate = baseRate * rateMultiplier;
  
  // Determine rate type based on multiplier
  let rateType = 'Regular';
  if (rateMultiplier === 1.5) rateType = 'Overtime';
  if (rateMultiplier === 2) rateType = 'Double Time';
  if (rateMultiplier === 3) rateType = 'Triple Time';

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
