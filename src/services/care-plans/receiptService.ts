
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import type { WorkLog, PayrollEntry } from './types/workLogTypes';
import * as pdfjs from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

type ReceiptEntry = WorkLog | PayrollEntry;
type ReceiptFormat = 'pdf' | 'jpg';

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
    let generatedDate = new Date();

    if (isWorkLog(entry)) {
      workLogId = entry.id;
      startTime = new Date(entry.start_time);
      endTime = new Date(entry.end_time);
      hoursWorked = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      baseRate = entry.base_rate || 25;
      rateMultiplier = entry.rate_multiplier || 1;
      appliedRate = baseRate * rateMultiplier;
      total = hoursWorked * appliedRate;

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
      workLogId = entry.work_log_id;

      const totalHours = entry.regular_hours + (entry.overtime_hours || 0) + (entry.holiday_hours || 0);
      hoursWorked = totalHours;
      
      baseRate = entry.regular_rate;
      appliedRate = baseRate;
      total = entry.total_amount;
      
      startTime = entry.pay_period_start ? new Date(entry.pay_period_start) : new Date();
      endTime = entry.pay_period_end ? new Date(entry.pay_period_end) : new Date();

      caregiverName = entry.caregiver_name || 'Unknown Caregiver';
    }

    // Header Configuration
    doc.setFontSize(16);
    doc.text('Pay Receipt', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    const headerText = [
      `Receipt #: ${workLogId.slice(0, 8)}`,
      `Work Date: ${format(startTime, 'MMM d, yyyy')}${
        endTime.toDateString() !== startTime.toDateString() 
          ? ` to ${format(endTime, 'MMM d, yyyy')}`
          : ''
      }`,
      `Receipt Generated: ${format(generatedDate, 'MMM d, yyyy h:mm a')}`,
      `Status: ${isWorkLog(entry) ? entry.status.charAt(0).toUpperCase() + entry.status.slice(1) : entry.payment_status.charAt(0).toUpperCase() + entry.payment_status.slice(1)}`,
      `Caregiver: ${caregiverName}`
    ];
    doc.text(headerText, 20, 35);

    const tableBody: string[][] = [];

    if (isWorkLog(entry)) {
      tableBody.push([
        'Regular Hours',
        format(startTime, 'MMM d'),
        hoursWorked.toFixed(2),
        `$${appliedRate.toFixed(2)}/hr`,
        `$${total.toFixed(2)}`
      ]);
    } else {
      if (entry.regular_hours > 0) {
        tableBody.push([
          'Regular Hours',
          format(new Date(entry.pay_period_start || ''), 'MMM d'),
          entry.regular_hours.toFixed(2),
          `$${entry.regular_rate.toFixed(2)}/hr`,
          `$${(entry.regular_hours * entry.regular_rate).toFixed(2)}`
        ]);
      }

      if (entry.overtime_hours && entry.overtime_hours > 0 && entry.overtime_rate) {
        tableBody.push([
          'Overtime Hours',
          format(new Date(entry.pay_period_start || ''), 'MMM d'),
          entry.overtime_hours.toFixed(2),
          `$${entry.overtime_rate.toFixed(2)}/hr`,
          `$${(entry.overtime_hours * entry.overtime_rate).toFixed(2)}`
        ]);
      }

      if (entry.holiday_hours && entry.holiday_hours > 0 && entry.holiday_rate) {
        tableBody.push([
          'Holiday Hours',
          format(new Date(entry.pay_period_start || ''), 'MMM d'),
          entry.holiday_hours.toFixed(2),
          `$${entry.holiday_rate.toFixed(2)}/hr`,
          `$${(entry.holiday_hours * entry.holiday_rate).toFixed(2)}`
        ]);
      }

      if (entry.expense_total && entry.expense_total > 0) {
        tableBody.push([
          'Expenses',
          format(new Date(entry.pay_period_start || ''), 'MMM d'),
          '',
          '',
          `$${entry.expense_total.toFixed(2)}`
        ]);
      }
    }

    autoTable(doc, {
      startY: 65,
      head: [['Type', 'Date', 'Hours', 'Rate', 'Amount']],
      body: tableBody,
      foot: [
        [
          'Total',
          '',
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
      },
      didDrawPage: (data) => {
        // Footer
        const footerStr = 'Page ' + doc.internal.getCurrentPageInfo().pageNumber
        doc.setFontSize(10)
        doc.text(footerStr, data.settings.margin.left, doc.internal.pageSize.height - 10)
      }
    });

    const footerY = doc.internal.pageSize.height - 20;
    doc.setFontSize(8);
    doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy h:mm a')}`, 20, footerY);
  } catch (error) {
    console.error("Error generating receipt:", error);
    throw new Error('Failed to generate receipt');
  }
};

const generateConsolidatedReceiptContent = async (doc: jsPDF, entries: PayrollEntry[]) => {
  try {
    if (!entries.length) {
      throw new Error('No entries provided for consolidated receipt');
    }
    
    const firstEntry = entries[0];
    const caregiverName = firstEntry.caregiver_name || 'Multiple Caregivers';
    
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
    
    doc.setFontSize(16);
    doc.text('Consolidated Pay Receipt', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    const headerText = [
      `Receipt #: CONS-${Date.now().toString().slice(-8)}`,
      `Date Range: ${format(earliestDate, 'MMM d, yyyy')} - ${format(latestDate, 'MMM d, yyyy')}`,
      `Receipt Generated: ${format(new Date(), 'MMM d, yyyy h:mm a')}`,
      `Entries: ${entries.length}`,
      `Caregiver: ${caregiverName}`
    ];
    doc.text(headerText, 20, 35);
    
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
        finalY = data.cursor.y;
      }
    });
    
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
        entry.caregiver_name || 'Unknown',
        `${entry.regular_hours + (entry.overtime_hours || 0) + (entry.holiday_hours || 0)}h total`,
        `$${entry.total_amount.toFixed(2)}`
      ]);
    });
    
    autoTable(doc, {
      startY: detailStartY + 5,
      head: [['Work Date', 'Caregiver', 'Hours', 'Amount']],
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
    console.log('Starting PDF to JPG conversion with PDF.js');
    
    const base64Content = pdfData.split(',')[1];
    if (!base64Content) {
      console.error('Invalid PDF data URL format');
      return pdfData;
    }
    
    const binaryData = atob(base64Content);
    const bytes = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      bytes[i] = binaryData.charCodeAt(i);
    }
    
    const loadingTask = pdfjs.getDocument({ data: bytes });
    const pdf = await loadingTask.promise;
    console.log(`PDF loaded successfully. Number of pages: ${pdf.numPages}`);
    
    const page = await pdf.getPage(1);
    
    const scale = 2.0;
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    const context = canvas.getContext('2d');
    if (!context) {
      console.error('Could not get canvas context');
      return pdfData;
    }
    
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    
    await page.render(renderContext).promise;
    console.log('PDF page rendered successfully');
    
    try {
      const jpgData = canvas.toDataURL('image/jpeg', 0.95);
      console.log('Canvas converted to JPG successfully');
      return jpgData;
    } catch (error) {
      console.error('Error converting canvas to JPG:', error);
      return pdfData;
    }
  } catch (error) {
    console.error('Error in PDF to JPG conversion:', error);
    return pdfData;
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
      console.log('Converting PDF to JPG...');
      const jpgData = await convertPdfToJpg(pdfData);
      console.log('JPG conversion complete');
      return jpgData;
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
      console.log('Converting consolidated PDF to JPG...');
      const jpgData = await convertPdfToJpg(pdfData);
      console.log('Consolidated JPG conversion complete');
      return jpgData;
    }
    
    return pdfData;
  } catch (error) {
    console.error("Error generating consolidated receipt:", error);
    throw new Error('Failed to generate consolidated receipt');
  }
};

