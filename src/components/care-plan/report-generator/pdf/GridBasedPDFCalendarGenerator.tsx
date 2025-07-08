
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
  
  // Enhanced page dimensions with optimized margins (Phase 1: Optimize Margin Calculations)
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Optimized margin calculations for better space utilization
  const baseMargin = 12; // Reduced from 15-25
  const topMargin = 50; // Reduced from 70-90
  const bottomMargin = 25; // Reduced from 30-50
  const labelWidth = 50; // Reduced from 80
  
  // Phase 2: Fix Grid Width Calculations
  const availableGridWidth = pageWidth - baseMargin * 2 - labelWidth;
  const columnWidth = availableGridWidth / 7;
  const availableHeight = pageHeight - topMargin - bottomMargin;
  
  // Generate header
  generatePDFHeader(doc, carePlanTitle, startDate, endDate, pageWidth, baseMargin);
  
  let currentY = topMargin - 10;
  
  // Generate caregiver summary
  currentY = generateCaregiverSummary(doc, filteredShifts, careTeamMembers, currentY, baseMargin);
  
  if (daysDiff <= 7) {
    // Single week view with proper height constraints
    currentY = generateWeekGrid(doc, start, end, filteredShifts, careTeamMembers, currentY, baseMargin, labelWidth, columnWidth, availableHeight, topMargin, pageHeight, bottomMargin);
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
      
      currentY = generateWeekGrid(doc, weekStart, weekEnd, filteredShifts, careTeamMembers, currentY, baseMargin, labelWidth, columnWidth, availableHeight, topMargin, pageHeight, bottomMargin);
    });
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
  labelWidth: number,
  columnWidth: number,
  availableHeight: number,
  topMargin: number,
  pageHeight: number,
  bottomMargin: number
): number => {
  const week = startOfWeek(weekStart);
  const weekDays = eachDayOfInterval({ start: week, end: addDays(week, 6) });
  
  let currentY = startY;
  
  // Phase 4: Enhanced Vertical Space Management
  const usedHeight = currentY - topMargin;
  const remainingHeight = availableHeight - usedHeight - 80; // Reserve space for about section
  const gridHeaderHeight = 25; // Height used by headers and labels
  const maxGridHeight = Math.max(150, remainingHeight - gridHeaderHeight); // Increased minimum
  const cellHeight = Math.min(35, maxGridHeight / 2); // Increased minimum cell height to 35pt
  
  // Phase 5: Content Overflow Protection - Add pagination guard
  const expectedGridHeight = gridHeaderHeight + (cellHeight * 2);
  if (currentY + expectedGridHeight > pageHeight - bottomMargin) {
    doc.addPage('landscape');
    generatePDFHeader(doc, '', '', '', doc.internal.pageSize.getWidth(), margin);
    currentY = topMargin;
  }
  
  // Draw day headers
  currentY = generateDayHeaders(doc, weekDays, currentY, margin, labelWidth, columnWidth);
  
  // Draw shift type labels
  currentY = generateShiftTypeLabels(doc, currentY, margin, labelWidth, columnWidth, cellHeight);
  
  // Draw the grid and shifts with calculated height
  currentY = generateDayNightGrid(doc, weekDays, shifts, careTeamMembers, currentY, margin, labelWidth, columnWidth, cellHeight);
  
  // Add about section at bottom with proper positioning
  const aboutY = Math.max(currentY + 15, pageHeight - bottomMargin - 60);
  if (aboutY + 50 <= pageHeight - 10) { // Ensure it fits on page
    generateAboutSection(doc, aboutY, margin);
  } else {
    // Move about section to new page if it doesn't fit
    doc.addPage('landscape');
    generateAboutSection(doc, topMargin, margin);
  }
  
  return currentY + 20;
};

const generateDayHeaders = (
  doc: jsPDF,
  weekDays: Date[],
  startY: number,
  margin: number,
  labelWidth: number,
  columnWidth: number
): number => {
  const headerHeight = 25;
  
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  
  weekDays.forEach((day, index) => {
    // Phase 2: Ensure X positioning matches grid calculations
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
  labelWidth: number,
  columnWidth: number,
  cellHeight: number
): number => {
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  
  // Day Shift label
  doc.text('Day Shift', margin + 5, startY + (cellHeight / 2) + 2);
  doc.setFontSize(8);
  doc.text('(6 AM - 5 PM)', margin + 5, startY + (cellHeight / 2) + 10);
  
  // Night Shift label  
  doc.setFontSize(10);
  doc.text('Night Shift', margin + 5, startY + cellHeight + (cellHeight / 2) + 2);
  doc.setFontSize(8);
  doc.text('(5 PM - 6 AM)', margin + 5, startY + cellHeight + (cellHeight / 2) + 10);
  
  // Draw horizontal separator between day and night
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  const gridWidth = columnWidth * 7;
  doc.line(margin + labelWidth, startY + cellHeight, margin + labelWidth + gridWidth, startY + cellHeight);
  
  return startY;
};

const generateDayNightGrid = (
  doc: jsPDF,
  weekDays: Date[],
  shifts: CareShift[],
  careTeamMembers: CareTeamMemberWithProfile[],
  startY: number,
  margin: number,
  labelWidth: number,
  columnWidth: number,
  cellHeight: number
): number => {
  const cellPadding = 2; // Reduced padding for better space utilization
  
  weekDays.forEach((day, dayIndex) => {
    const isWeekend = dayIndex === 0 || dayIndex === 6;
    // Phase 2: Ensure X positioning matches grid calculations
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
  // Phase 3: Optimize Shift Card Rendering
  const shiftHeight = 18; // Optimized for better fit
  const shiftSpacing = 1; // Reduced spacing
  const maxVisibleShifts = Math.floor(height / (shiftHeight + shiftSpacing));
  const visibleShifts = sectionShifts.slice(0, maxVisibleShifts);
  const hasOverflow = sectionShifts.length > maxVisibleShifts;
  
  visibleShifts.forEach((gridShift, index) => {
    const shiftY = y + (index * (shiftHeight + shiftSpacing));
    
    // Phase 3: Increase card width slightly
    const cardWidth = width - 1; // Increased from width - 2
    
    // Shift card background with enhanced colors
    doc.setFillColor(gridShift.color[0], gridShift.color[1], gridShift.color[2]);
    doc.roundedRect(x, shiftY, cardWidth, shiftHeight, 2, 2, 'F');
    
    // Add border to match UI
    const borderColor = gridShift.color.map(c => Math.max(0, c - 30)); // Darker border
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, shiftY, cardWidth, shiftHeight, 2, 2, 'S');
    
    // Phase 5: Enhanced caregiver initials circle with bounds checking
    const initialsRadius = 5; // Optimized for 18pt card height
    const initialsX = x + 8;
    const initialsY = shiftY + initialsRadius + 2;
    
    // Ensure initials circle stays within card boundaries
    if (initialsX + initialsRadius <= x + cardWidth && initialsY + initialsRadius <= shiftY + shiftHeight) {
      // White circle background
      doc.setFillColor(255, 255, 255);
      doc.circle(initialsX, initialsY, initialsRadius, 'F');
      
      // Initials text
      doc.setTextColor(gridShift.color[0], gridShift.color[1], gridShift.color[2]);
      doc.setFontSize(5);
      doc.text(gridShift.caregiverInitials, initialsX, initialsY + 1.5, { align: 'center' });
    }
    
    // Phase 3: Adjust text positioning and use smaller fonts
    const textX = x + 16; // Adjusted from x + 20
    
    // Title with enhanced formatting and smart truncation
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(6); // Reduced from 6.5
    const titleText = formatShiftTitle(gridShift.shift);
    const maxTitleLength = 20; // Adjusted for narrower cards
    const displayTitle = titleText.length > maxTitleLength ? titleText.substring(0, maxTitleLength) + '...' : titleText;
    
    // Phase 5: Add bounds checking for text
    if (textX + doc.getTextWidth(displayTitle) <= x + cardWidth) {
      doc.text(displayTitle, textX, shiftY + 6);
    }
    
    // Time with muted styling
    doc.setFontSize(4.5); // Reduced from 5.5
    doc.setTextColor(130, 130, 130);
    if (textX + doc.getTextWidth(gridShift.timeDisplay) <= x + cardWidth) {
      doc.text(gridShift.timeDisplay, textX, shiftY + 10);
    }
    
    // Caregiver name
    doc.setFontSize(4); // Reduced from 5.5
    doc.setTextColor(110, 110, 110);
    const nameText = gridShift.caregiverName === 'Unassigned' ? 'Unassigned' : gridShift.caregiverName;
    const maxNameLength = 12; // Reduced for smaller font
    const displayName = nameText.length > maxNameLength ? nameText.substring(0, maxNameLength) + '...' : nameText;
    
    if (textX + doc.getTextWidth(displayName) <= x + cardWidth) {
      doc.text(displayName, textX, shiftY + 14);
    }
  });
  
  // Phase 5: Enhanced overflow indicator with bounds checking
  if (hasOverflow) {
    const overflowY = y + (maxVisibleShifts * (shiftHeight + shiftSpacing));
    if (overflowY + 8 <= y + height) { // Ensure it fits
      doc.setTextColor(120, 120, 120); // Muted color to match UI
      doc.setFontSize(4.5); // Reduced font size
      const overflowText = `+${sectionShifts.length - maxVisibleShifts} more`;
      doc.text(overflowText, x + 3, overflowY + 6);
    }
  }
};

const generateAboutSection = (doc: jsPDF, startY: number, margin: number) => {
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text('About the Schedule', margin, startY);
  
  doc.setFontSize(8); // Reduced font size for better fit
  doc.setTextColor(100, 100, 100);
  
  const aboutItems = [
    '• Different colors represent different caregivers',
    '• Weekend days are highlighted with blue background',
    '• Day shifts (6 AM - 5 PM) and night shifts (5 PM - 6 AM) are separated into different rows',
    '• Multiple shifts per time period are stacked vertically',
    '• Overflow shifts are indicated with "+X more"',
    '• Caregiver initials appear in circles at the left of each shift card'
  ];
  
  aboutItems.forEach((item, index) => {
    doc.text(item, margin, startY + 15 + (index * 7)); // Reduced line spacing
  });
};
