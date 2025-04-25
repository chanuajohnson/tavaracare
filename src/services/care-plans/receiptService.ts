import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import type { WorkLog, PayrollEntry } from './types/workLogTypes';

// Union type for receipt generation
type ReceiptEntry = WorkLog | PayrollEntry;
type ReceiptFormat = 'pdf' | 'jpg';

// Type guard to check if an entry is a WorkLog
const isWorkLog = (entry: ReceiptEntry): entry is WorkLog => {
  return 'start_time' in entry && 'end_time' in entry && 'status' in entry;
};

const generateReceipt = async (doc: jsPDF, entry: ReceiptEntry | PayrollEntry[], isConsolidated = false) => {
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
  } catch (error) {
    console.error("Error generating receipt:", error);
    throw new Error('Failed to generate receipt');
  }
};

const convertPdfToJpg = async (pdfDoc: jsPDF): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const page = pdfDoc.getPage(1);
    const viewport = page.getViewport({ scale: 2 }); // Higher scale for better quality

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    const context = canvas.getContext('2d');
    if (!context) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    // Render PDF page to canvas
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };

    page.render(renderContext).promise.then(() => {
      // Convert canvas to JPG
      const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.95);
      resolve(jpgDataUrl);
    }).catch(reject);
  });
};

export const generatePayReceipt = async (
  entry: ReceiptEntry, 
  format: ReceiptFormat = 'pdf'
): Promise<string> => {
  try {
    const doc = new jsPDF();
    await generateReceipt(doc, entry);
    
    if (format === 'jpg') {
      return await convertPdfToJpg(doc);
    }
    
    return doc.output('datauristring');
  } catch (error) {
    console.error("Error generating receipt:", error);
    throw new Error('Failed to generate receipt');
  }
};

export const generateConsolidatedReceipt = async (
  entries: PayrollEntry[], 
  format: ReceiptFormat = 'pdf'
): Promise<string> => {
  try {
    if (!entries.length) {
      throw new Error('No entries provided for consolidated receipt');
    }

    const doc = new jsPDF();
    await generateReceipt(doc, entries, true);
    
    if (format === 'jpg') {
      return await convertPdfToJpg(doc);
    }
    
    return doc.output('datauristring');
  } catch (error) {
    console.error("Error generating consolidated receipt:", error);
    throw new Error('Failed to generate consolidated receipt');
  }
};
