
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

const generateReceipt = async (doc: jsPDF, entry: ReceiptEntry, isConsolidated = false) => {
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

// Separate function to handle consolidated receipts for multiple entries
const generateConsolidatedReceiptContent = async (doc: jsPDF, entries: PayrollEntry[]) => {
  try {
    if (!entries.length) {
      throw new Error('No entries provided for consolidated receipt');
    }
    
    // Get the first entry for some basic info
    const firstEntry = entries[0];
    const caregiverName = firstEntry.caregiver_name || 'Multiple Caregivers';
    
    // Calculate consolidated total
    let totalAmount = 0;
    let totalRegularHours = 0;
    let totalOvertimeHours = 0;
    let totalHolidayHours = 0;
    let totalExpenses = 0;
    
    entries.forEach(entry => {
      totalAmount += entry.total_amount;
      totalRegularHours += entry.regular_hours;
      totalOvertimeHours += entry.overtime_hours || 0;
      totalHolidayHours += entry.holiday_hours || 0;
      totalExpenses += entry.expense_total || 0;
    });
    
    // Determine date range
    let earliestDate = new Date();
    let latestDate = new Date(0);
    
    entries.forEach(entry => {
      if (entry.pay_period_start) {
        const startDate = new Date(entry.pay_period_start);
        if (startDate < earliestDate) earliestDate = startDate;
      }
      
      if (entry.pay_period_end) {
        const endDate = new Date(entry.pay_period_end);
        if (endDate > latestDate) latestDate = endDate;
      }
    });
    
    // Header
    doc.setFontSize(16);
    doc.text('Consolidated Pay Receipt', 105, 20, { align: 'center' });
    
    // Basic receipt details
    doc.setFontSize(10);
    doc.text([
      `Receipt #: CONS-${Date.now().toString().slice(-8)}`,
      `Date Range: ${format(earliestDate, 'MMM d, yyyy')} - ${format(latestDate, 'MMM d, yyyy')}`,
      `Entries: ${entries.length}`,
      `Caregiver: ${caregiverName}`
    ], 20, 35);
    
    // Prepare table body with consolidated data
    const tableBody: string[][] = [];
    
    if (totalRegularHours > 0) {
      tableBody.push([
        'Regular Hours',
        totalRegularHours.toFixed(2),
        'Various',
        `$${(totalAmount - totalExpenses).toFixed(2)}`
      ]);
    }
    
    if (totalOvertimeHours > 0) {
      tableBody.push([
        'Overtime Hours',
        totalOvertimeHours.toFixed(2),
        'Various',
        'Included in total'
      ]);
    }
    
    if (totalHolidayHours > 0) {
      tableBody.push([
        'Holiday Hours',
        totalHolidayHours.toFixed(2),
        'Various',
        'Included in total'
      ]);
    }
    
    if (totalExpenses > 0) {
      tableBody.push([
        'Expenses',
        '',
        '',
        `$${totalExpenses.toFixed(2)}`
      ]);
    }
    
    // Add summary table and capture its final Y position
    let finalY: number = 65;
    
    autoTable(doc, {
      startY: 65,
      head: [['Type', 'Hours', 'Rate', 'Amount']],
      body: tableBody,
      foot: [
        [
          'Total',
          '',
          '',
          `$${totalAmount.toFixed(2)}`
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
      },
      didDrawPage: (data) => {
        // Save the last Y position after drawing the table
        finalY = data.cursor.y;
      }
    });
    
    // Add detailed breakdown by entry
    // Use the finalY position from didDrawPage callback
    let detailStartY = finalY + 20;
    
    doc.setFontSize(12);
    doc.text('Detailed Breakdown', 105, detailStartY, { align: 'center' });
    
    const detailsBody: string[][] = [];
    
    entries.forEach((entry, index) => {
      const entryDate = entry.pay_period_start 
        ? format(new Date(entry.pay_period_start), 'MMM d, yyyy')
        : `Entry ${index + 1}`;
      
      detailsBody.push([
        entryDate,
        `${entry.regular_hours + (entry.overtime_hours || 0) + (entry.holiday_hours || 0)}h total`,
        entry.caregiver_name || 'Unknown',
        `$${entry.total_amount.toFixed(2)}`
      ]);
    });
    
    autoTable(doc, {
      startY: detailStartY + 5,
      head: [['Date', 'Hours', 'Caregiver', 'Amount']],
      body: detailsBody,
      styles: {
        cellPadding: 5,
        fontSize: 9
      },
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      }
    });
    
    // Generation timestamp at bottom
    const footerY = doc.internal.pageSize.height - 20;
    doc.setFontSize(8);
    doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy h:mm a')}`, 20, footerY);
    
  } catch (error) {
    console.error("Error generating consolidated receipt:", error);
    throw new Error('Failed to generate consolidated receipt');
  }
};

const convertPdfToJpg = async (pdfData: string): Promise<string> => {
  try {
    // Create a container to render the PDF
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    // Create an iframe to load the PDF
    const iframe = document.createElement('iframe');
    iframe.style.width = '800px';
    iframe.style.height = '1100px';
    iframe.src = pdfData;
    container.appendChild(iframe);

    // Wait for the PDF to load
    return new Promise((resolve, reject) => {
      iframe.onload = async () => {
        try {
          // Give it a moment to render
          await new Promise(r => setTimeout(r, 100));
          
          // Create a canvas and capture the iframe content
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          // Set canvas dimensions
          canvas.width = 800;
          canvas.height = 1100;
          
          // Draw the iframe content to the canvas
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Use html2canvas or similar if needed for better rendering
          // For now, just capture what's visible
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc?.body) {
              // Simple approach - just draw the white background
              const jpgData = canvas.toDataURL('image/jpeg', 0.95);
              resolve(jpgData);
            } else {
              reject(new Error('Could not access iframe content'));
            }
          } catch (e) {
            console.error('Error during canvas drawing:', e);
            // Fallback to returning the PDF if there's an error with JPG conversion
            resolve(pdfData);
          }
        } finally {
          // Clean up
          document.body.removeChild(container);
        }
      };
      
      iframe.onerror = () => {
        document.body.removeChild(container);
        reject(new Error('Failed to load PDF'));
      };
    });
  } catch (error) {
    console.error("Error converting PDF to JPG:", error);
    throw new Error('Failed to convert PDF to JPG');
  }
};

export const generatePayReceipt = async (
  entry: ReceiptEntry, 
  format: ReceiptFormat = 'pdf'
): Promise<string> => {
  try {
    const doc = new jsPDF();
    await generateReceipt(doc, entry);
    
    const pdfData = doc.output('datauristring');
    
    if (format === 'jpg') {
      return await convertPdfToJpg(pdfData);
    }
    
    return pdfData;
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
    await generateConsolidatedReceiptContent(doc, entries);
    
    const pdfData = doc.output('datauristring');
    
    if (format === 'jpg') {
      return await convertPdfToJpg(pdfData);
    }
    
    return pdfData;
  } catch (error) {
    console.error("Error generating consolidated receipt:", error);
    throw new Error('Failed to generate consolidated receipt');
  }
};
