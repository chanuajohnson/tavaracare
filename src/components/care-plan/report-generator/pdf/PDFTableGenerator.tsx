
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { CareShift, CareTeamMemberWithProfile } from "@/types/careTypes";
import { getCaregiverName, formatTime, formatDate } from '../utils/caregiverUtils';

export const generateTablePDF = async (
  startDate: string,
  endDate: string,
  filteredShifts: CareShift[],
  careTeamMembers: CareTeamMemberWithProfile[],
  carePlanTitle: string,
  reportType: 'summary' | 'detailed'
) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text('Care Team Shift Schedule', 20, 25);
  
  // Care plan info
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Care Plan: ${carePlanTitle || 'Untitled Care Plan'}`, 20, 40);
  doc.text(`Period: ${formatDate(startDate)} - ${formatDate(endDate)}`, 20, 50);
  doc.text(`Generated on: ${format(new Date(), 'MMM d, yyyy')} at ${format(new Date(), 'h:mm a')}`, 20, 60);
  doc.text(`Total Shifts: ${filteredShifts.length}`, 20, 70);

  // Prepare table data
  const tableData = filteredShifts.map(shift => {
    try {
      return [
        formatDate(shift.startTime),
        format(new Date(shift.startTime), 'EEE'),
        `${formatTime(shift.startTime)} - ${formatTime(shift.endTime)}`,
        shift.title || 'Untitled Shift',
        getCaregiverName(shift.caregiverId, careTeamMembers),
        shift.status || 'Scheduled',
        shift.location || 'Not specified'
      ];
    } catch (err) {
      console.error('Error processing shift for table:', shift, err);
      return [
        'Invalid date',
        'N/A',
        'Invalid time',
        shift.title || 'Untitled Shift',
        getCaregiverName(shift.caregiverId, careTeamMembers),
        shift.status || 'Scheduled',
        shift.location || 'Not specified'
      ];
    }
  });

  // Add table using autoTable function
  autoTable(doc, {
    head: [['Date', 'Day', 'Time', 'Shift Title', 'Caregiver', 'Status', 'Location']],
    body: tableData,
    startY: 85,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    columnStyles: {
      0: { cellWidth: 25 }, // Date
      1: { cellWidth: 15 }, // Day
      2: { cellWidth: 30 }, // Time
      3: { cellWidth: 35 }, // Title
      4: { cellWidth: 30 }, // Caregiver
      5: { cellWidth: 20 }, // Status
      6: { cellWidth: 25 }, // Location
    },
  });

  // Add summary if detailed report
  if (reportType === 'detailed' && careTeamMembers.length > 0) {
    const finalY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 20 : 200;
    
    // Care team summary
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text('Care Team Summary', 20, finalY);
    
    const caregiverSummary = careTeamMembers.map(member => {
      const memberShifts = filteredShifts.filter(s => s.caregiverId === member.caregiverId);
      return [
        member.professionalDetails?.full_name || 'Unknown',
        member.professionalDetails?.professional_type || 'Care Professional',
        memberShifts.length.toString(),
        member.role || 'Caregiver'
      ];
    });

    autoTable(doc, {
      head: [['Name', 'Type', 'Shifts', 'Role']],
      body: caregiverSummary,
      startY: finalY + 10,
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: 255,
        fontStyle: 'bold',
      },
    });
  }
  
  return doc;
};
