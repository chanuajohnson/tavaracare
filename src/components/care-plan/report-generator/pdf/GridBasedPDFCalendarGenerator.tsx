
import jsPDF from 'jspdf';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, differenceInDays, eachWeekOfInterval } from 'date-fns';
import { CareShift, CareTeamMemberWithProfile } from "@/types/careTypes";
import { getCaregiverColor, getCaregiverInitials, getCaregiverName, formatTime, formatDate } from '../utils/caregiverUtils';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface GridShift {
  shift: CareShift;
  caregiverName: string;
  caregiverInitials: string;
  color: number[];
  timeDisplay: string;
}

export const generateGridBasedCalendarPDF = async (
  startDate: string,
  endDate: string,
  filteredShifts: CareShift[],
  careTeamMembers: CareTeamMemberWithProfile[],
  carePlanTitle: string
) => {
  const doc = new jsPDF('landscape');
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = differenceInDays(end, start);
  
  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const availableWidth = pageWidth - (margin * 2);
  const columnWidth = availableWidth / 7;
  
  // Generate header
  generatePDFHeader(doc, carePlanTitle, startDate, endDate, pageWidth);
  
  let currentY = 70;
  
  // Generate caregiver summary
  currentY = generateCaregiverSummary(doc, filteredShifts, careTeamMembers, currentY, margin);
  
  if (daysDiff <= 7) {
    // Single week view
    currentY = generateWeekGrid(doc, start, end, filteredShifts, careTeamMembers, currentY, margin, columnWidth);
  } else {
    // Multi-week view
    const weeks = eachWeekOfInterval({ start, end });
    
    weeks.forEach((weekStart, index) => {
      const weekEnd = endOfWeek(weekStart);
      
      if (index > 0) {
        doc.addPage('landscape');
        generatePDFHeader(doc, carePlanTitle, startDate, endDate, pageWidth);
        currentY = 70;
        currentY = generateCaregiverSummary(doc, filteredShifts, careTeamMembers, currentY, margin);
      }
      
      currentY = generateWeekGrid(doc, weekStart, weekEnd, filteredShifts, careTeamMembers, currentY, margin, columnWidth);
    });
  }
  
  // Add about section at bottom
  generateAboutSection(doc, currentY, margin);
  
  return doc;
};

const generatePDFHeader = (doc: jsPDF, carePlanTitle: string, startDate: string, endDate: string, pageWidth: number) => {
  // Main title
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Care Team Schedule', 20, 25);
  
  // Care plan info
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  doc.text(`Care Plan: ${carePlanTitle || 'Untitled Care Plan'}`, 20, 40);
  doc.text(`Week of ${formatDate(startDate)}`, 20, 52);
  
  // Generation timestamp
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated on ${format(new Date(), 'MMM d, yyyy h:mm a')}`, pageWidth - 120, 40);
};

const generateCaregiverSummary = (
  doc: jsPDF, 
  shifts: CareShift[], 
  careTeamMembers: CareTeamMemberWithProfile[], 
  startY: number, 
  margin: number
): number => {
  // Count shifts by caregiver (mirroring ShiftCalendar logic)
  const shiftsByCaregiver = careTeamMembers.map(member => {
    const count = shifts.filter(s => s.caregiverId === member.caregiverId).length;
    return {
      caregiverId: member.caregiverId,
      name: member.professionalDetails?.full_name || "Unknown",
      count
    };
  }).filter(item => item.count > 0);
  
  if (shiftsByCaregiver.length === 0) return startY + 10;
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  
  let summaryText = shiftsByCaregiver.map((item, index) => 
    `${item.name}: ${item.count} shifts`
  ).join(' • ');
  
  doc.text(summaryText, margin, startY + 10);
  
  return startY + 25;
};

const generateWeekGrid = (
  doc: jsPDF,
  weekStart: Date,
  weekEnd: Date,
  shifts: CareShift[],
  careTeamMembers: CareTeamMemberWithProfile[],
  startY: number,
  margin: number,
  columnWidth: number
): number => {
  const week = startOfWeek(weekStart);
  const weekDays = eachDayOfInterval({ start: week, end: addDays(week, 6) });
  
  let currentY = startY;
  
  // Draw day headers (mirroring ShiftCalendar format)
  currentY = generateDayHeaders(doc, weekDays, currentY, margin, columnWidth);
  
  // Draw the grid and shifts
  currentY = generateDayGrid(doc, weekDays, shifts, careTeamMembers, currentY, margin, columnWidth);
  
  return currentY + 20;
};

const generateDayHeaders = (
  doc: jsPDF,
  weekDays: Date[],
  startY: number,
  margin: number,
  columnWidth: number
): number => {
  const headerHeight = 25;
  
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  
  weekDays.forEach((day, index) => {
    const x = margin + (index * columnWidth);
    const centerX = x + (columnWidth / 2);
    
    // Day name and date (like "Mon 24")
    const dayText = `${format(day, 'EEE')} ${format(day, 'd')}`;
    
    doc.text(dayText, centerX, startY + 15, { align: 'center' });
    
    // Draw column separator lines
    if (index > 0) {
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(x, startY, x, startY + headerHeight);
    }
  });
  
  // Bottom border for headers
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(1);
  const gridWidth = columnWidth * 7;
  doc.line(margin, startY + headerHeight, margin + gridWidth, startY + headerHeight);
  
  return startY + headerHeight;
};

const generateDayGrid = (
  doc: jsPDF,
  weekDays: Date[],
  shifts: CareShift[],
  careTeamMembers: CareTeamMemberWithProfile[],
  startY: number,
  margin: number,
  columnWidth: number
): number => {
  const cellHeight = 90; // Increased height to accommodate multiple shifts
  const cellPadding = 4;
  
  weekDays.forEach((day, dayIndex) => {
    const isWeekend = dayIndex === 0 || dayIndex === 6;
    const x = margin + (dayIndex * columnWidth);
    
    // Background color for weekends (mirroring ShiftCalendar)
    if (isWeekend) {
      doc.setFillColor(240, 248, 255); // bg-blue-50 equivalent
      doc.rect(x, startY, columnWidth, cellHeight, 'F');
    } else {
      doc.setFillColor(250, 250, 250); // Light gray background
      doc.rect(x, startY, columnWidth, cellHeight, 'F');
    }
    
    // Cell border
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.rect(x, startY, columnWidth, cellHeight);
    
    // Get shifts for this day
    const dayShifts = getShiftsForDay(day, shifts, careTeamMembers);
    
    if (dayShifts.length === 0) {
      // Show plus icon placeholder (simplified)
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(16);
      doc.text('+', x + (columnWidth / 2), startY + (cellHeight / 2), { align: 'center' });
    } else {
      // Render shifts (limit to 3 visible, show overflow)
      renderDayShifts(doc, dayShifts, x + cellPadding, startY + cellPadding, columnWidth - (cellPadding * 2), cellHeight - (cellPadding * 2));
    }
    
    // Column separator
    if (dayIndex < 6) {
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(x + columnWidth, startY, x + columnWidth, startY + cellHeight);
    }
  });
  
  return startY + cellHeight;
};

const getShiftsForDay = (day: Date, shifts: CareShift[], careTeamMembers: CareTeamMemberWithProfile[]): GridShift[] => {
  return shifts
    .filter(shift => {
      if (!shift.startTime) return false;
      return isSameDay(new Date(shift.startTime), day);
    })
    .map(shift => ({
      shift,
      caregiverName: getCaregiverName(shift.caregiverId, careTeamMembers),
      caregiverInitials: getCaregiverInitials(shift.caregiverId, careTeamMembers),
      color: getCaregiverColor(shift.caregiverId),
      timeDisplay: `${formatTime(shift.startTime)} - ${formatTime(shift.endTime)}`
    }));
};

const renderDayShifts = (
  doc: jsPDF,
  dayShifts: GridShift[],
  x: number,
  y: number,
  width: number,
  height: number
) => {
  const shiftHeight = 20;
  const shiftSpacing = 2;
  const maxVisibleShifts = Math.floor((height - 10) / (shiftHeight + shiftSpacing));
  const visibleShifts = dayShifts.slice(0, maxVisibleShifts);
  const hasOverflow = dayShifts.length > maxVisibleShifts;
  
  visibleShifts.forEach((gridShift, index) => {
    const shiftY = y + (index * (shiftHeight + shiftSpacing));
    
    // Shift card background (mirroring ShiftCalendar styling)
    doc.setFillColor(gridShift.color[0], gridShift.color[1], gridShift.color[2]);
    doc.roundedRect(x, shiftY, width - 2, shiftHeight, 2, 2, 'F');
    
    // Add slight border
    doc.setDrawColor(gridShift.color[0] - 20, gridShift.color[1] - 20, gridShift.color[2] - 20);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, shiftY, width - 2, shiftHeight, 2, 2, 'S');
    
    // Shift text content
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    
    // Title
    const titleText = gridShift.shift.title || 'Shift';
    doc.text(titleText, x + 2, shiftY + 6);
    
    // Time
    doc.setFontSize(7);
    doc.setTextColor(240, 240, 240);
    doc.text(gridShift.timeDisplay, x + 2, shiftY + 12);
    
    // Caregiver initials (small circle on right)
    const initialsX = x + width - 15;
    doc.setFillColor(255, 255, 255);
    doc.circle(initialsX, shiftY + 10, 6, 'F');
    doc.setTextColor(gridShift.color[0], gridShift.color[1], gridShift.color[2]);
    doc.setFontSize(6);
    doc.text(gridShift.caregiverInitials, initialsX, shiftY + 12, { align: 'center' });
    
    // Caregiver name
    doc.setTextColor(240, 240, 240);
    doc.setFontSize(6);
    const nameText = gridShift.caregiverName === 'Unassigned' ? 'Unassigned' : gridShift.caregiverName;
    doc.text(nameText, x + 2, shiftY + 17);
  });
  
  // Overflow indicator
  if (hasOverflow) {
    const overflowY = y + (maxVisibleShifts * (shiftHeight + shiftSpacing));
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(7);
    doc.text(`+${dayShifts.length - maxVisibleShifts} more`, x + 2, overflowY + 8);
  }
};

const generateAboutSection = (doc: jsPDF, startY: number, margin: number) => {
  const aboutY = startY + 20;
  
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text('About the Schedule', margin, aboutY);
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  
  const aboutItems = [
    '• Different colors represent different caregivers',
    '• Weekend days are highlighted with blue background',
    '• Multiple shifts per day are stacked vertically',
    '• Overflow shifts are indicated with "+X more"',
    '• Caregiver initials appear in circles on each shift card'
  ];
  
  aboutItems.forEach((item, index) => {
    doc.text(item, margin, aboutY + 15 + (index * 10));
  });
};
