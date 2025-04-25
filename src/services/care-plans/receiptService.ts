
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import type { WorkLog, PayrollEntry } from './types/workLogTypes';

// Union type for receipt generation
type ReceiptEntry = WorkLog | PayrollEntry;

// Type guard to check if an entry is a WorkLog
const isWorkLog = (entry: ReceiptEntry): entry is WorkLog => {
  return 'start_time' in entry && 'end_time' in entry && 'status' in entry;
};

export const generatePayReceipt = async (entry: ReceiptEntry): Promise<string> => {
  try {
    let workLogId = '';
    let startTime: Date;
    let endTime: Date;
    let hoursWorked: number;
    let baseRate: number;
    let rateMultiplier: number;
    let appliedRate: number;
    let total: number;
    let caregiverName = 'Unknown Caregiver';

    if (isWorkLog(entry)) {
      // Handle WorkLog type
      workLogId = entry.id;
      startTime = new Date(entry.start_time);
      endTime = new Date(entry.end_time);
      hoursWorked = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      baseRate = entry.base_rate || 25;
      rateMultiplier = entry.rate_multiplier || 1;
      appliedRate = baseRate * rateMultiplier;
      total = hoursWorked * appliedRate;

      // Get the work log details with care team member info and associated profile
      const { data: workLogWithTeamMember, error: fetchError } = await supabase
        .from('work_logs')
        .select(`
          *,
          care_team_members!care_team_member_id (
            id,
            regular_rate,
            overtime_rate,
            caregiver_id,
            profiles!caregiver_id (
              full_name,
              avatar_url
            )
          )
        `)
        .eq('id', entry.id)
        .single();

      if (fetchError) throw fetchError;
      caregiverName = workLogWithTeamMember?.care_team_members?.profiles?.full_name || 'Unknown Caregiver';
    } else {
      // Handle PayrollEntry type
      workLogId = entry.work_log_id;

      // For PayrollEntry, we derive the time worked from the different hour types
      const totalHours = entry.regular_hours + (entry.overtime_hours || 0) + (entry.holiday_hours || 0);
      hoursWorked = totalHours;
      
      // Use payroll specific rates
      baseRate = entry.regular_rate;
      appliedRate = baseRate;
      total = entry.total_amount;
      
      // Get timestamp for the receipt
      startTime = entry.pay_period_start ? new Date(entry.pay_period_start) : new Date();
      endTime = entry.pay_period_end ? new Date(entry.pay_period_end) : new Date();

      // Use the caregiver name directly if available
      caregiverName = entry.caregiver_name || 'Unknown Caregiver';
    }

    // Create PDF document
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(16);
    doc.text('Pay Receipt', 105, 20, { align: 'center' });
    
    // Basic receipt details
    doc.setFontSize(10);
    doc.text([
      `Receipt #: ${workLogId.slice(0, 8)}`,
      `Date: ${format(startTime, 'MMM d, yyyy')}`,
      `Status: ${isWorkLog(entry) ? entry.status.charAt(0).toUpperCase() + entry.status.slice(1) : entry.payment_status.charAt(0).toUpperCase() + entry.payment_status.slice(1)}`,
      `Caregiver: ${caregiverName}`
    ], 20, 35);

    // Prepare table body based on entry type
    const tableBody: string[][] = [];

    if (isWorkLog(entry)) {
      // For WorkLog entries
      tableBody.push([
        'Regular Hours',
        hoursWorked.toFixed(2),
        `$${appliedRate.toFixed(2)}/hr`,
        `$${total.toFixed(2)}`
      ]);
    } else {
      // For PayrollEntry entries - show regular, overtime, and holiday hours separately
      if (entry.regular_hours > 0) {
        tableBody.push([
          'Regular Hours',
          entry.regular_hours.toFixed(2),
          `$${entry.regular_rate.toFixed(2)}/hr`,
          `$${(entry.regular_hours * entry.regular_rate).toFixed(2)}`
        ]);
      }

      if (entry.overtime_hours && entry.overtime_hours > 0 && entry.overtime_rate) {
        tableBody.push([
          'Overtime Hours',
          entry.overtime_hours.toFixed(2),
          `$${entry.overtime_rate.toFixed(2)}/hr`,
          `$${(entry.overtime_hours * entry.overtime_rate).toFixed(2)}`
        ]);
      }

      if (entry.holiday_hours && entry.holiday_hours > 0 && entry.holiday_rate) {
        tableBody.push([
          'Holiday Hours',
          entry.holiday_hours.toFixed(2),
          `$${entry.holiday_rate.toFixed(2)}/hr`,
          `$${(entry.holiday_hours * entry.holiday_rate).toFixed(2)}`
        ]);
      }

      if (entry.expense_total && entry.expense_total > 0) {
        tableBody.push([
          'Expenses',
          '',
          '',
          `$${entry.expense_total.toFixed(2)}`
        ]);
      }
    }

    // Add autoTable for hours and rates
    autoTable(doc, {
      startY: 65,
      head: [['Type', 'Hours', 'Rate', 'Amount']],
      body: tableBody,
      foot: [
        [
          'Total',
          '',
          '',
          `$${total.toFixed(2)}`
        ]
      ],
      styles: {
        cellPadding: 5,
        fontSize: 10
      },
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      footStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      }
    });

    // Generation timestamp at bottom
    const footerY = doc.internal.pageSize.height - 20;
    doc.setFontSize(8);
    doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy h:mm a')}`, 20, footerY);
    
    // Convert to data URL
    const pdfDataUrl = doc.output('datauristring');
    
    return pdfDataUrl;
  } catch (error) {
    console.error("Error generating receipt:", error);
    throw new Error('Failed to generate receipt');
  }
};

// Function to generate consolidated receipt for multiple payroll entries
export const generateConsolidatedReceipt = async (entries: PayrollEntry[]): Promise<string> => {
  try {
    if (!entries.length) {
      throw new Error('No entries provided for consolidated receipt');
    }

    // Group entries by caregiver
    const entriesByCaregiver: { [key: string]: PayrollEntry[] } = {};
    
    entries.forEach(entry => {
      const caregiverId = entry.care_team_member_id;
      if (!entriesByCaregiver[caregiverId]) {
        entriesByCaregiver[caregiverId] = [];
      }
      entriesByCaregiver[caregiverId].push(entry);
    });

    // Create PDF document
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(16);
    doc.text('Consolidated Pay Receipt', 105, 20, { align: 'center' });
    
    // Receipt date range
    const allDates = entries
      .map(entry => entry.pay_period_start ? new Date(entry.pay_period_start) : null)
      .filter(Boolean) as Date[];
    
    const earliestDate = allDates.length ? new Date(Math.min(...allDates.map(d => d.getTime()))) : new Date();
    const latestDate = allDates.length ? new Date(Math.max(...allDates.map(d => d.getTime()))) : new Date();
    
    // Basic receipt details
    doc.setFontSize(10);
    doc.text([
      `Receipt #: CONS-${Date.now().toString().slice(-8)}`,
      `Date Range: ${format(earliestDate, 'MMM d, yyyy')} - ${format(latestDate, 'MMM d, yyyy')}`,
      `Total Entries: ${entries.length}`
    ], 20, 35);

    // Calculate the start position for the first table
    let yPosition = 50;

    // Process each caregiver's entries
    for (const caregiverId in entriesByCaregiver) {
      const caregiverEntries = entriesByCaregiver[caregiverId];
      const caregiverName = caregiverEntries[0].caregiver_name || 'Unknown Caregiver';
      
      // Add caregiver section header
      yPosition += 10;
      doc.setFontSize(12);
      doc.text(`Caregiver: ${caregiverName}`, 20, yPosition);
      yPosition += 5;
      
      // Prepare table data for this caregiver
      const tableBody: string[][] = [];
      let caregiverTotal = 0;
      
      caregiverEntries.forEach(entry => {
        const date = entry.pay_period_start ? format(new Date(entry.pay_period_start), 'MMM d, yyyy') : 'N/A';
        
        // Regular hours
        if (entry.regular_hours > 0) {
          tableBody.push([
            date,
            'Regular Hours',
            entry.regular_hours.toFixed(2),
            `$${entry.regular_rate.toFixed(2)}/hr`,
            `$${(entry.regular_hours * entry.regular_rate).toFixed(2)}`
          ]);
        }
        
        // Overtime hours
        if (entry.overtime_hours && entry.overtime_hours > 0 && entry.overtime_rate) {
          tableBody.push([
            date,
            'Overtime Hours',
            entry.overtime_hours.toFixed(2),
            `$${entry.overtime_rate.toFixed(2)}/hr`,
            `$${(entry.overtime_hours * entry.overtime_rate).toFixed(2)}`
          ]);
        }
        
        // Holiday hours
        if (entry.holiday_hours && entry.holiday_hours > 0 && entry.holiday_rate) {
          tableBody.push([
            date,
            'Holiday Hours',
            entry.holiday_hours.toFixed(2),
            `$${entry.holiday_rate.toFixed(2)}/hr`,
            `$${(entry.holiday_hours * entry.holiday_rate).toFixed(2)}`
          ]);
        }
        
        // Expenses
        if (entry.expense_total && entry.expense_total > 0) {
          tableBody.push([
            date,
            'Expenses',
            '',
            '',
            `$${entry.expense_total.toFixed(2)}`
          ]);
        }
        
        caregiverTotal += entry.total_amount;
      });
      
      // Add table for this caregiver
      autoTable(doc, {
        startY: yPosition,
        head: [['Date', 'Type', 'Hours', 'Rate', 'Amount']],
        body: tableBody,
        foot: [
          [
            '',
            'Caregiver Total',
            '',
            '',
            `$${caregiverTotal.toFixed(2)}`
          ]
        ],
        styles: {
          cellPadding: 3,
          fontSize: 9
        },
        headStyles: {
          fillColor: [200, 200, 200],
          textColor: [0, 0, 0],
          fontStyle: 'bold'
        },
        footStyles: {
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
          fontStyle: 'bold'
        }
      });
      
      // Update Y position for the next table
      // @ts-ignore - finalY is available but not in the types
      yPosition = (doc as any).lastAutoTable.finalY + 15;
      
      // Add page break if needed
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
    }
    
    // Add grand total
    const grandTotal = entries.reduce((sum, entry) => sum + entry.total_amount, 0);
    yPosition += 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Grand Total: $${grandTotal.toFixed(2)}`, 20, yPosition);
    
    // Generation timestamp at bottom
    const footerY = doc.internal.pageSize.height - 20;
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy h:mm a')}`, 20, footerY);
    
    // Convert to data URL
    const pdfDataUrl = doc.output('datauristring');
    
    return pdfDataUrl;
  } catch (error) {
    console.error("Error generating consolidated receipt:", error);
    throw new Error('Failed to generate consolidated receipt');
  }
};
