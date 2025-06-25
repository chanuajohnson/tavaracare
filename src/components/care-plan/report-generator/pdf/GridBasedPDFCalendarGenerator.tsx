
import jsPDF from 'jspdf';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, differenceInDays, eachWeekOfInterval } from 'date-fns';
import { CareShift, CareTeamMemberWithProfile } from "@/types/careTypes";
import { getCaregiverColor, getCaregiverInitials, getCaregiverName, formatTime, formatDate, isNightShift, formatShiftTitle } from '../utils/enhancedCaregiverUtils';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface GridShift {
  shift: CareShift;
  caregiverName: string;
  caregiverInitials: string;
  color: number[];
  timeDisplay: string;
  isNight: boolean;
}

interface DayShifts {
  dayShifts: GridShift[];
  nightShifts: GridShift[];
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
  
  // Enhanced page dimensions with responsive margins
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Smart responsive margins based on page size
  const baseMargin = Math.max(15, Math.min(25, pageWidth * 0.03)); // 3% of page width, between 15-25
  const topMargin = Math.max(70, Math.min(90, pageHeight * 0.15)); // 15% of page height for header
  const bottomMargin = Math.max(30, Math.min(50, pageHeight * 0.08)); // 8% of page height for footer
  
  const availableWidth = pageWidth - (baseMargin * 2);
  const availableHeight = pageHeight - topMargin - bottomMargin;
  const columnWidth = availableWidth / 7;
  
  // Generate header
  generatePDFHeader(doc, carePlanTitle, startDate, endDate, pageWidth, baseMargin);
  
  let currentY = topMargin - 10;
  
  // Generate caregiver summary
  currentY = generateCaregiverSummary(doc, filteredShifts, careTeamMembers, currentY, baseMargin);
  
  if (daysDiff <= 7) {
    // Single week view with proper height constraints
    currentY = generateWeekGrid(doc, start, end, filteredShifts, careTeamMembers, currentY, baseMargin, columnWidth, availableHeight, topMargin);
  } else {
    // Multi-week view
    const weeks = eachWeekOfInterval({ start, end });
    
    weeks.forEach((weekStart, index) => {
      const weekEnd = endOfWeek(weekStart);
      
      if (index > 0) {
        doc.addPage('landscape');
        generatePDFHeader(doc, carePlanTitle, startDate, endDate, pageWidth, baseMargin);
        currentY = topMargin - 10;
        currentY = generateCaregiverSummary(doc, filteredShifts, careTeamMembers, currentY, baseMargin);
      }
      
      currentY = generateWeekGrid(doc, weekStart, weekEnd, filteredShifts, careTeamMembers, currentY, baseMargin, columnWidth, availableHeight, topMargin);
    });
  }
  
  // Add about section at bottom with proper positioning
  const aboutY = Math.max(currentY + 15, pageHeight - bottomMargin - 60);
  if (aboutY + 50 <= pageHeight - 10) { // Ensure it fits on page
    generateAboutSection(doc, aboutY, baseMargin);
  }
  
  return doc;
};

const generatePDFHeader = (doc: jsPDF, carePlanTitle: string, startDate: string, endDate: string, pageWidth: number, margin: number) => {
  // Main title
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Care Team Schedule', margin, 25);
  
  // Care plan info
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  doc.text(`Care Plan: ${carePlanTitle || 'Untitled Care Plan'}`, margin, 40);
  doc.text(`Period: ${formatDate(startDate)} - ${formatDate(endDate)}`, margin, 52);
  
  // Generation timestamp - positioned responsively
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  const timestampText = `Generated on ${format(new Date(), 'MMM d, yyyy h:mm a')}`;
  const textWidth = doc.getTextWidth(timestampText);
  doc.text(timestampText, pageWidth - margin - textWidth, 40);
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
  columnWidth: number,
  availableHeight: number,
  topMargin: number
): number => {
  const week = startOfWeek(weekStart);
  const weekDays = eachDayOfInterval({ start: week, end: addDays(week, 6) });
  
  let currentY = startY;
  
  // Calculate remaining height for grid
  const usedHeight = currentY - topMargin;
  const remainingHeight = availableHeight - usedHeight - 80; // Reserve space for about section
  
  // Draw day headers
  currentY = generateDayHeaders(doc, weekDays, currentY, margin, columnWidth);
  
  // Draw shift type labels
  currentY = generateShiftTypeLabels(doc, currentY, margin, columnWidth);
  
  // Calculate cell height based on remaining space
  const gridHeaderHeight = 25; // Height used by headers and labels
  const maxGridHeight = Math.max(120, remainingHeight - gridHeaderHeight);
  const cellHeight = Math.min(70, maxGridHeight / 2); // Divide by 2 for day/night rows
  
  // Draw the grid and shifts with calculated height
  currentY = generateDayNightGrid(doc, weekDays, shifts, careTeamMembers, currentY, margin, columnWidth, cellHeight);
  
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
  const labelWidth = 80; // Space for "Day Shift"/"Night Shift" labels
  
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  
  weekDays.forEach((day, index) => {
    const x = margin + labelWidth + (index * columnWidth);
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
  doc.line(margin + labelWidth, startY + headerHeight, margin + labelWidth + gridWidth, startY + headerHeight);
  
  return startY + headerHeight;
};

const generateShiftTypeLabels = (
  doc: jsPDF,
  startY: number,
  margin: number,
  columnWidth: number
): number => {
  const labelWidth = 80;
  const rowHeight = 60; // Height for each shift type row
  
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  
  // Day Shift label
  doc.text('Day Shift', margin + 5, startY + 35);
  doc.text('(6 AM - 5 PM)', margin + 5, startY + 45);
  
  // Night Shift label  
  doc.text('Night Shift', margin + 5, startY + 35 + rowHeight);
  doc.text('(5 PM - 5 AM)', margin + 5, startY + 45 + rowHeight);
  
  // Draw horizontal separator between day and night
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  const gridWidth = columnWidth * 7;
  doc.line(margin + labelWidth, startY + rowHeight, margin + labelWidth + gridWidth, startY + rowHeight);
  
  return startY;
};

const generateDayNightGrid = (
  doc: jsPDF,
  weekDays: Date[],
  shifts: CareShift[],
  careTeamMembers: CareTeamMemberWithProfile[],
  startY: number,
  margin: number,
  columnWidth: number,
  cellHeight: number
): number => {
  const labelWidth = 80;
  const cellPadding = 4;
  
  weekDays.forEach((day, dayIndex) => {
    const isWeekend = dayIndex === 0 || dayIndex === 6;
    const x = margin + labelWidth + (dayIndex * columnWidth);
    
    // Get shifts for this day separated by type
    const dayShifts = getShiftsForDay(day, shifts, careTeamMembers);
    
    // Day shift section
    renderShiftSection(doc, dayShifts.dayShifts, x, startY, columnWidth, cellHeight, cellPadding, isWeekend, 'day');
    
    // Night shift section
    renderShiftSection(doc, dayShifts.nightShifts, x, startY + cellHeight, columnWidth, cellHeight, cellPadding, isWeekend, 'night');
    
    // Column separator
    if (dayIndex < 6) {
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(x + columnWidth, startY, x + columnWidth, startY + (cellHeight * 2));
    }
  });
  
  // Bottom border
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(1);
  const gridWidth = columnWidth * 7;
  doc.line(margin + labelWidth, startY + (cellHeight * 2), margin + labelWidth + gridWidth, startY + (cellHeight * 2));
  
  return startY + (cellHeight * 2);
};

const getShiftsForDay = (day: Date, shifts: CareShift[], careTeamMembers: CareTeamMemberWithProfile[]): DayShifts => {
  const allShifts = shifts
    .filter(shift => {
      if (!shift.startTime) return false;
      return isSameDay(new Date(shift.startTime), day);
    })
    .map(shift => ({
      shift,
      caregiverName: getCaregiverName(shift.caregiverId, careTeamMembers),
      caregiverInitials: getCaregiverInitials(shift.caregiverId, careTeamMembers),
      color: getCaregiverColor(shift.caregiverId),
      timeDisplay: `${formatTime(shift.startTime)} - ${formatTime(shift.endTime)}`,
      isNight: isNightShift(shift.startTime)
    }));
  
  return {
    dayShifts: allShifts.filter(s => !s.isNight),
    nightShifts: allShifts.filter(s => s.isNight)
  };
};

const renderShiftSection = (
  doc: jsPDF,
  sectionShifts: GridShift[],
  x: number,
  y: number,
  width: number,
  height: number,
  cellPadding: number,
  isWeekend: boolean,
  sectionType: 'day' | 'night'
) => {
  // Background color for weekends
  if (isWeekend) {
    doc.setFillColor(240, 248, 255); // bg-blue-50 equivalent
    doc.rect(x, y, width, height, 'F');
  } else {
    doc.setFillColor(250, 250, 250); // Light gray background
    doc.rect(x, y, width, height, 'F');
  }
  
  // Cell border
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.rect(x, y, width, height);
  
  if (sectionShifts.length === 0) {
    // Show plus icon placeholder
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(12);
    doc.text('+', x + (width / 2), y + (height / 2), { align: 'center' });
  } else {
    // Render shifts with enhanced positioning
    renderSectionShifts(doc, sectionShifts, x + cellPadding, y + cellPadding, width - (cellPadding * 2), height - (cellPadding * 2));
  }
};

const renderSectionShifts = (
  doc: jsPDF,
  sectionShifts: GridShift[],
  x: number,
  y: number,
  width: number,
  height: number
) => {
  const shiftHeight = 20; // Increased for better text spacing
  const shiftSpacing = 2;
  const maxVisibleShifts = Math.floor(height / (shiftHeight + shiftSpacing));
  const visibleShifts = sectionShifts.slice(0, maxVisibleShifts);
  const hasOverflow = sectionShifts.length > maxVisibleShifts;
  
  visibleShifts.forEach((gridShift, index) => {
    const shiftY = y + (index * (shiftHeight + shiftSpacing));
    
    // Shift card background with enhanced colors
    doc.setFillColor(gridShift.color[0], gridShift.color[1], gridShift.color[2]);
    doc.roundedRect(x, shiftY, width - 2, shiftHeight, 2, 2, 'F');
    
    // Add border to match UI
    const borderColor = gridShift.color.map(c => Math.max(0, c - 30)); // Darker border
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, shiftY, width - 2, shiftHeight, 2, 2, 'S');
    
    // Enhanced caregiver initials circle - FIXED TO TOP-LEFT
    const initialsRadius = 6; // Increased for better visibility
    const initialsX = x + 10;
    const initialsY = shiftY + initialsRadius + 2;
    
    // White circle background
    doc.setFillColor(255, 255, 255);
    doc.circle(initialsX, initialsY, initialsRadius, 'F');
    
    // Initials text
    doc.setTextColor(gridShift.color[0], gridShift.color[1], gridShift.color[2]);
    doc.setFontSize(6);
    doc.text(gridShift.caregiverInitials, initialsX, initialsY + 1.5, { align: 'center' });
    
    // Enhanced shift text content - adjusted positioning to avoid initials
    doc.setTextColor(100, 100, 100); // Darker text for better readability
    
    // Title with enhanced formatting
    doc.setFontSize(6.5);
    const titleText = formatShiftTitle(gridShift.shift);
    const maxTitleLength = 25; // Adjust based on available width
    const displayTitle = titleText.length > maxTitleLength ? titleText.substring(0, maxTitleLength) + '...' : titleText;
    doc.text(displayTitle, x + 20, shiftY + 7);
    
    // Time with muted styling
    doc.setFontSize(5.5);
    doc.setTextColor(130, 130, 130); // Muted color
    doc.text(gridShift.timeDisplay, x + 20, shiftY + 12);
    
    // Caregiver name
    doc.setFontSize(5.5);
    doc.setTextColor(110, 110, 110);
    const nameText = gridShift.caregiverName === 'Unassigned' ? 'Unassigned' : gridShift.caregiverName;
    const maxNameLength = 15; // Limit name length to fit
    const displayName = nameText.length > maxNameLength ? nameText.substring(0, maxNameLength) + '...' : nameText;
    doc.text(displayName, x + 20, shiftY + 17);
  });
  
  // Enhanced overflow indicator
  if (hasOverflow) {
    const overflowY = y + (maxVisibleShifts * (shiftHeight + shiftSpacing));
    if (overflowY + 8 <= y + height) { // Ensure it fits
      doc.setTextColor(120, 120, 120); // Muted color to match UI
      doc.setFontSize(5.5);
      doc.text(`+${sectionShifts.length - maxVisibleShifts} more`, x + 3, overflowY + 6);
    }
  }
};

const generateAboutSection = (doc: jsPDF, startY: number, margin: number) => {
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text('About the Schedule', margin, startY);
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  
  const aboutItems = [
    '• Different colors represent different caregivers',
    '• Weekend days are highlighted with blue background',
    '• Day shifts (6 AM - 5 PM) and night shifts (5 PM - 5 AM) are separated into different rows',
    '• Multiple shifts per time period are stacked vertically',
    '• Overflow shifts are indicated with "+X more"',
    '• Caregiver initials appear in circles at the top-left of each shift card'
  ];
  
  aboutItems.forEach((item, index) => {
    doc.text(item, margin, startY + 15 + (index * 8));
  });
};
