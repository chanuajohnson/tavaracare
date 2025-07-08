
import jsPDF from 'jspdf';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, differenceInDays, eachWeekOfInterval } from 'date-fns';
import { CareShift } from "@/types/careTypes";
import { getCaregiverColor, getCaregiverInitials, getCaregiverName, formatTime, formatDate, isNightShift } from '../utils/caregiverUtils';

export const generateCalendarPDF = async (
  startDate: string,
  endDate: string,
  filteredShifts: CareShift[],
  carePlanTitle: string
) => {
  const doc = new jsPDF('landscape');
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = differenceInDays(end, start);
  
  // Header
  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.text('Care Team Schedule Calendar', 20, 25);
  
  // Care plan info
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Care Plan: ${carePlanTitle || 'Untitled Care Plan'}`, 20, 35);
  doc.text(`Period: ${formatDate(startDate)} - ${formatDate(endDate)}`, 20, 42);
  doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy h:mm a')}`, 20, 49);

  // Add caregiver legend in top right
  generateCaregiverLegendTopRight(doc, filteredShifts);
  
  let currentY = 60;
  
  if (daysDiff <= 7) {
    // Single week view
    currentY = generateEnhancedWeeklyCalendar(doc, start, end, filteredShifts, currentY);
  } else if (daysDiff <= 14) {
    // Multi-week view - generate separate pages for each week
    const weeks = eachWeekOfInterval({ start, end });
    
    weeks.forEach((weekStart, index) => {
      const weekEnd = endOfWeek(weekStart);
      
      if (index > 0) {
        doc.addPage('landscape');
        generateCaregiverLegendTopRight(doc, filteredShifts);
        currentY = 60;
        
        // Add header for subsequent pages
        doc.setFontSize(18);
        doc.setTextColor(40);
        doc.text('Care Team Schedule Calendar', 20, 25);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Care Plan: ${carePlanTitle || 'Untitled Care Plan'}`, 20, 35);
        doc.text(`Week ${index + 1} of ${weeks.length}`, 20, 42);
      }
      
      currentY = generateEnhancedWeeklyCalendar(doc, weekStart, weekEnd, filteredShifts, currentY);
    });
  } else if (daysDiff <= 31) {
    // Monthly view  
    currentY = generateEnhancedMonthlyCalendar(doc, start, end, filteredShifts, currentY);
  } else {
    // Multi-month view - generate multiple monthly calendars
    let currentStart = startOfMonth(start);
    const finalEnd = endOfMonth(end);
    
    while (currentStart <= finalEnd) {
      const monthEnd = endOfMonth(currentStart);
      currentY = generateEnhancedMonthlyCalendar(doc, currentStart, monthEnd, filteredShifts, currentY);
      currentStart = addDays(monthEnd, 1);
      
      // Add new page if needed for multi-month
      if (currentStart <= finalEnd) {
        doc.addPage('landscape');
        generateCaregiverLegendTopRight(doc, filteredShifts);
        currentY = 60;
      }
    }
  }
  
  return doc;
};

const generateCaregiverLegendTopRight = (doc: jsPDF, shifts: CareShift[]) => {
  const uniqueCaregivers = [...new Set(shifts.map(s => s.caregiverId).filter(Boolean))];
  const pageWidth = doc.internal.pageSize.getWidth();
  const legendStartX = pageWidth - 120; // Moved further left to avoid overlap
  let currentY = 25;
  
  // Legend header
  doc.setFontSize(10);
  doc.setTextColor(40);
  doc.text('Caregiver Legend', legendStartX, currentY);
  currentY += 8;
  
  uniqueCaregivers.forEach((caregiverId) => {
    const color = getCaregiverColor(caregiverId);
    const name = getCaregiverName(caregiverId, []);
    const initials = getCaregiverInitials(caregiverId, []);
    
    // Draw color box
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(legendStartX, currentY - 3, 4, 4, 'F');
    
    // Draw caregiver info
    doc.setFontSize(8);
    doc.setTextColor(40);
    doc.text(`${initials} - ${name.substring(0, 15)}`, legendStartX + 8, currentY);
    
    currentY += 6;
  });
  
  // Add shift type legend
  currentY += 3;
  doc.setFontSize(9);
  doc.setTextColor(40);
  doc.text('Shift Types:', legendStartX, currentY);
  currentY += 6;
  
  // Day shift indicator
  doc.setFillColor(100, 100, 100);
  doc.circle(legendStartX + 2, currentY - 1, 1.5, 'F');
  doc.setFontSize(7);
  doc.text('Day Shift', legendStartX + 8, currentY);
  currentY += 5;
  
  // Night shift indicator
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.5);
  doc.circle(legendStartX + 2, currentY - 1, 1.5);
  doc.text('Night Shift', legendStartX + 8, currentY);
};

const generateEnhancedWeeklyCalendar = (doc: jsPDF, start: Date, end: Date, shifts: CareShift[], startY: number) => {
  const weekStart = startOfWeek(start);
  const weekDays = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });
  
  // Use full page width for calendar - landscape is ~800 points wide
  const pageWidth = doc.internal.pageSize.getWidth();
  const legendWidth = 120;
  const availableWidth = pageWidth - 40 - legendWidth; // 20 margin on each side + legend space
  const cellWidth = availableWidth / 7; // Distribute evenly across 7 days
  const cellHeight = 100; // Increased height for better visibility
  const headerHeight = 20;
  
  // Draw week header
  doc.setFontSize(14);
  doc.setTextColor(40);
  doc.text(`Week of ${format(weekStart, 'MMM d, yyyy')}`, 20, startY);
  
  let currentY = startY + 20;
  
  // Draw day headers
  doc.setFontSize(12);
  doc.setTextColor(60);
  weekDays.forEach((day, index) => {
    const x = 20 + (index * cellWidth);
    doc.text(format(day, 'EEE'), x + 5, currentY + 12);
    doc.text(format(day, 'd'), x + 5, currentY + 22);
    
    // Draw cell border
    doc.setDrawColor(200, 200, 200);
    doc.rect(x, currentY, cellWidth, cellHeight);
  });
  
  // Draw shifts with day/night differentiation
  weekDays.forEach((day, dayIndex) => {
    const dayShifts = shifts.filter(shift => isSameDay(new Date(shift.startTime), day));
    const x = 20 + (dayIndex * cellWidth);
    
    // Separate day and night shifts
    const dayShiftsFiltered = dayShifts.filter(shift => !isNightShift(shift.startTime));
    const nightShiftsFiltered = dayShifts.filter(shift => isNightShift(shift.startTime));
    
    // Draw day shifts in top half
    let dayShiftY = currentY + headerHeight + 5;
    dayShiftsFiltered.slice(0, 2).forEach((shift) => {
      const color = getCaregiverColor(shift.caregiverId);
      const initials = getCaregiverInitials(shift.caregiverId, []);
      
      // Draw shift rectangle with better sizing
      const rectWidth = cellWidth - 8;
      const rectHeight = 15;
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(x + 4, dayShiftY, rectWidth, rectHeight, 'F');
      
      // Draw time and caregiver with better font size
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text(`${formatTime(shift.startTime).slice(0, 5)}`, x + 6, dayShiftY + 5);
      doc.text(initials, x + 6, dayShiftY + 11);
      
      // Draw solid circle for day shift
      doc.setFillColor(255, 255, 255);
      doc.circle(x + cellWidth - 10, dayShiftY + 7, 1.5, 'F');
      
      dayShiftY += 18;
    });
    
    // Draw night shifts in bottom half
    let nightShiftY = currentY + headerHeight + 45;
    nightShiftsFiltered.slice(0, 2).forEach((shift) => {
      const color = getCaregiverColor(shift.caregiverId);
      const initials = getCaregiverInitials(shift.caregiverId, []);
      
      // Draw shift rectangle
      const rectWidth = cellWidth - 8;
      const rectHeight = 15;
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(x + 4, nightShiftY, rectWidth, rectHeight, 'F');
      
      // Draw time and caregiver
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text(`${formatTime(shift.startTime).slice(0, 5)}`, x + 6, nightShiftY + 5);
      doc.text(initials, x + 6, nightShiftY + 11);
      
      // Draw hollow circle for night shift
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(1);
      doc.circle(x + cellWidth - 10, nightShiftY + 7, 1.5);
      
      nightShiftY += 18;
    });
    
    // Show overflow count if needed
    const totalShifts = dayShifts.length;
    if (totalShifts > 4) {
      doc.setFontSize(6);
      doc.setTextColor(100);
      doc.text(`+${totalShifts - 4} more`, x + 4, currentY + cellHeight - 8);
    }
  });
  
  return currentY + cellHeight + 20;
};

const generateEnhancedMonthlyCalendar = (doc: jsPDF, start: Date, end: Date, shifts: CareShift[], startY: number) => {
  const monthStart = startOfMonth(start);
  const monthEnd = endOfMonth(end);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  // Use full page width for monthly calendar
  const pageWidth = doc.internal.pageSize.getWidth();
  const legendWidth = 120;
  const availableWidth = pageWidth - 40 - legendWidth;
  const cellWidth = availableWidth / 7;
  const cellHeight = 35; // Slightly larger for monthly view
  
  // Draw month header
  doc.setFontSize(16);
  doc.setTextColor(40);
  doc.text(format(monthStart, 'MMMM yyyy'), 20, startY);
  
  let currentY = startY + 25;
  
  // Draw day of week headers
  doc.setFontSize(10);
  doc.setTextColor(60);
  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayHeaders.forEach((day, index) => {
    doc.text(day, 20 + (index * cellWidth) + 5, currentY + 10);
  });
  
  currentY += 15;
  
  // Draw calendar grid
  let weekCount = 0;
  for (let i = 0; i < allDays.length; i += 7) {
    const weekDays = allDays.slice(i, i + 7);
    
    weekDays.forEach((day, dayIndex) => {
      const x = 20 + (dayIndex * cellWidth);
      const y = currentY + (weekCount * cellHeight);
      
      // Draw cell border
      doc.setDrawColor(200, 200, 200);
      doc.rect(x, y, cellWidth, cellHeight);
      
      // Draw date number
      doc.setFontSize(9);
      doc.setTextColor(day.getMonth() === monthStart.getMonth() ? 40 : 150);
      doc.text(format(day, 'd'), x + 5, y + 12);
      
      // Draw shifts with day/night differentiation
      const dayShifts = shifts.filter(shift => isSameDay(new Date(shift.startTime), day));
      const dayShiftsFiltered = dayShifts.filter(shift => !isNightShift(shift.startTime));
      const nightShiftsFiltered = dayShifts.filter(shift => isNightShift(shift.startTime));
      
      // Draw day shifts (solid circles)
      dayShiftsFiltered.slice(0, 3).forEach((shift, shiftIndex) => {
        const color = getCaregiverColor(shift.caregiverId);
        doc.setFillColor(color[0], color[1], color[2]);
        const dotX = x + 5 + (shiftIndex * 10);
        const dotY = y + 20;
        doc.circle(dotX, dotY, 2.5, 'F');
      });
      
      // Draw night shifts (hollow circles)
      nightShiftsFiltered.slice(0, 3).forEach((shift, shiftIndex) => {
        const color = getCaregiverColor(shift.caregiverId);
        doc.setDrawColor(color[0], color[1], color[2]);
        doc.setLineWidth(1);
        const dotX = x + 5 + (shiftIndex * 10);
        const dotY = y + 28;
        doc.circle(dotX, dotY, 2.5);
      });
      
      // Show overflow
      if (dayShifts.length > 6) {
        doc.setFontSize(6);
        doc.setTextColor(100);
        doc.text(`+${dayShifts.length - 6}`, x + cellWidth - 15, y + 32);
      }
    });
    
    weekCount++;
  }
  
  return currentY + (weekCount * cellHeight) + 20;
};
