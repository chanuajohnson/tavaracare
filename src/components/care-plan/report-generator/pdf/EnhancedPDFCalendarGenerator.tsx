
import jsPDF from 'jspdf';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, differenceInDays, eachWeekOfInterval, getHours, getMinutes } from 'date-fns';
import { CareShift } from "@/types/careTypes";
import { getCaregiverColor, getCaregiverInitials, getCaregiverName, formatTime, formatDate, isNightShift } from '../utils/caregiverUtils';

// Timeline configuration
const TIMELINE_HOURS = [6, 8, 12, 16, 18, 22, 0, 4]; // 6 AM, 8 AM, 12 PM, 4 PM, 6 PM, 10 PM, 12 AM, 4 AM
const TIMELINE_LABELS = ['6 AM', '8 AM', '12 PM', '4 PM', '6 PM', '10 PM', '12 AM', '4 AM'];

interface TimelineShift {
  shift: CareShift;
  startCol: number;
  span: number;
  caregiverInitials: string;
  caregiverName: string;
  color: number[];
  isNight: boolean;
}

export const generateEnhancedCalendarPDF = async (
  startDate: string,
  endDate: string,
  filteredShifts: CareShift[],
  carePlanTitle: string
) => {
  const doc = new jsPDF('landscape');
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = differenceInDays(end, start);
  
  // Enhanced header with better typography
  generateEnhancedHeader(doc, carePlanTitle, startDate, endDate);
  
  let currentY = 70;
  
  if (daysDiff <= 7) {
    // Single enhanced week view
    currentY = generateEnhancedTimelineWeek(doc, start, end, filteredShifts, currentY);
  } else {
    // Multi-week with enhanced layout
    const weeks = eachWeekOfInterval({ start, end });
    
    weeks.forEach((weekStart, index) => {
      const weekEnd = endOfWeek(weekStart);
      
      if (index > 0) {
        doc.addPage('landscape');
        generateEnhancedHeader(doc, carePlanTitle, startDate, endDate);
        currentY = 70;
      }
      
      currentY = generateEnhancedTimelineWeek(doc, weekStart, weekEnd, filteredShifts, currentY);
    });
  }
  
  // Enhanced legend at bottom
  generateEnhancedLegend(doc, filteredShifts, currentY);
  
  return doc;
};

const generateEnhancedHeader = (doc: jsPDF, carePlanTitle: string, startDate: string, endDate: string) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Main title with better typography
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text('🌿 Care Team Shift Calendar', 20, 25);
  
  // Care plan info with refined styling
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  doc.text(`Care Plan: ${carePlanTitle || 'Untitled Care Plan'}`, 20, 40);
  doc.text(`Period: ${formatDate(startDate)} - ${formatDate(endDate)}`, 20, 50);
  
  // Generation timestamp
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated on ${format(new Date(), 'MMM d, yyyy h:mm a')}`, pageWidth - 120, 40);
};

const generateEnhancedTimelineWeek = (
  doc: jsPDF,
  start: Date,
  end: Date,
  shifts: CareShift[],
  startY: number
): number => {
  const weekStart = startOfWeek(start);
  const weekDays = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const leftMargin = 80; // Space for day labels
  const rightMargin = 40;
  const availableWidth = pageWidth - leftMargin - rightMargin;
  const timeColWidth = availableWidth / TIMELINE_HOURS.length;
  const rowHeight = 25;
  const headerHeight = 30;
  
  // Week header with enhanced styling
  doc.setFontSize(16);
  doc.setTextColor(60, 60, 60);
  doc.text(`Week of ${format(weekStart, 'MMM d, yyyy')}`, 20, startY);
  
  let currentY = startY + 20;
  
  // Timeline header
  generateTimelineHeader(doc, leftMargin, currentY, timeColWidth);
  currentY += headerHeight;
  
  // Process each day
  weekDays.forEach((day, dayIndex) => {
    const dayShifts = shifts.filter(shift => isSameDay(new Date(shift.startTime), day));
    const timelineShifts = processShiftsForTimeline(dayShifts);
    
    // Day label with enhanced styling
    generateDayLabel(doc, day, 20, currentY, rowHeight);
    
    // Timeline grid background
    generateTimelineGrid(doc, leftMargin, currentY, timeColWidth, rowHeight);
    
    // Shift bars
    generateShiftBars(doc, timelineShifts, leftMargin, currentY, timeColWidth, rowHeight);
    
    currentY += rowHeight;
  });
  
  return currentY + 20;
};

const generateTimelineHeader = (doc: jsPDF, leftMargin: number, y: number, colWidth: number) => {
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  
  TIMELINE_LABELS.forEach((label, index) => {
    const x = leftMargin + (index * colWidth) + (colWidth / 2);
    doc.text(label, x, y + 15, { align: 'center' });
    
    // Vertical grid lines
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(leftMargin + (index * colWidth), y, leftMargin + (index * colWidth), y + 20);
  });
  
  // Header bottom border
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(1);
  doc.line(leftMargin, y + 20, leftMargin + (TIMELINE_LABELS.length * colWidth), y + 20);
};

const generateDayLabel = (doc: jsPDF, day: Date, x: number, y: number, height: number) => {
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  
  const dayName = format(day, 'EEE');
  const dayNumber = format(day, 'd');
  
  doc.text(dayName, x, y + 10);
  doc.text(dayNumber, x, y + 20);
  
  // Day separator line
  doc.setDrawColor(240, 240, 240);
  doc.setLineWidth(0.5);
  doc.line(x + 50, y, x + 50, y + height);
};

const generateTimelineGrid = (doc: jsPDF, leftMargin: number, y: number, colWidth: number, height: number) => {
  const totalWidth = TIMELINE_HOURS.length * colWidth;
  
  // Grid background
  doc.setFillColor(250, 250, 250);
  doc.rect(leftMargin, y, totalWidth, height, 'F');
  
  // Vertical grid lines
  doc.setDrawColor(235, 235, 235);
  doc.setLineWidth(0.3);
  
  for (let i = 0; i <= TIMELINE_HOURS.length; i++) {
    const x = leftMargin + (i * colWidth);
    doc.line(x, y, x, y + height);
  }
  
  // Horizontal grid line
  doc.line(leftMargin, y + height, leftMargin + totalWidth, y + height);
};

const generateShiftBars = (
  doc: jsPDF,
  timelineShifts: TimelineShift[],
  leftMargin: number,
  y: number,
  colWidth: number,
  height: number
) => {
  const barHeight = 12;
  const barMargin = 2;
  const maxBarsPerRow = Math.floor((height - 4) / (barHeight + barMargin));
  
  // Separate day and night shifts
  const dayShifts = timelineShifts.filter(ts => !ts.isNight);
  const nightShifts = timelineShifts.filter(ts => ts.isNight);
  
  // Draw day shifts in upper half
  dayShifts.slice(0, Math.floor(maxBarsPerRow / 2)).forEach((timelineShift, index) => {
    const barY = y + 2 + (index * (barHeight + barMargin));
    drawShiftBar(doc, timelineShift, leftMargin, barY, colWidth, barHeight, '🌞');
  });
  
  // Draw night shifts in lower half
  const nightStartY = y + (height / 2);
  nightShifts.slice(0, Math.floor(maxBarsPerRow / 2)).forEach((timelineShift, index) => {
    const barY = nightStartY + (index * (barHeight + barMargin));
    drawShiftBar(doc, timelineShift, leftMargin, barY, colWidth, barHeight, '🌙');
  });
  
  // Show overflow indicator
  const totalShifts = dayShifts.length + nightShifts.length;
  if (totalShifts > maxBarsPerRow) {
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(`+${totalShifts - maxBarsPerRow} more`, leftMargin + 5, y + height - 3);
  }
};

const drawShiftBar = (
  doc: jsPDF,
  timelineShift: TimelineShift,
  leftMargin: number,
  y: number,
  colWidth: number,
  height: number,
  icon: string
) => {
  const barX = leftMargin + (timelineShift.startCol * colWidth);
  const barWidth = timelineShift.span * colWidth - 2; // Small gap between bars
  
  // Shift bar background
  doc.setFillColor(timelineShift.color[0], timelineShift.color[1], timelineShift.color[2]);
  doc.roundedRect(barX + 1, y, barWidth, height, 2, 2, 'F');
  
  // Shift text
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  
  const shiftText = `${timelineShift.caregiverInitials} ${formatTime(timelineShift.shift.startTime).slice(0, -3)}-${formatTime(timelineShift.shift.endTime).slice(0, -3)}`;
  const textWidth = doc.getTextWidth(shiftText);
  
  if (textWidth < barWidth - 10) {
    doc.text(shiftText, barX + 5, y + 8);
  } else {
    doc.text(timelineShift.caregiverInitials, barX + 3, y + 8);
  }
  
  // Shift type icon
  doc.setFontSize(6);
  doc.text(icon, barX + barWidth - 10, y + 8);
};

const processShiftsForTimeline = (shifts: CareShift[]): TimelineShift[] => {
  return shifts.map(shift => {
    const startHour = getHours(new Date(shift.startTime));
    const endHour = getHours(new Date(shift.endTime));
    
    // Find closest timeline positions
    const startCol = findTimelineColumn(startHour);
    const endCol = findTimelineColumn(endHour);
    const span = Math.max(1, endCol - startCol);
    
    return {
      shift,
      startCol,
      span,
      caregiverInitials: getCaregiverInitials(shift.caregiverId, []),
      caregiverName: getCaregiverName(shift.caregiverId, []),
      color: getCaregiverColor(shift.caregiverId),
      isNight: isNightShift(shift.startTime)
    };
  });
};

const findTimelineColumn = (hour: number): number => {
  // Convert 24-hour to timeline column index
  const timelineHour = hour === 0 ? 24 : hour; // Midnight becomes 24 for calculation
  
  for (let i = 0; i < TIMELINE_HOURS.length; i++) {
    const colHour = TIMELINE_HOURS[i] === 0 ? 24 : TIMELINE_HOURS[i];
    if (timelineHour <= colHour) {
      return i;
    }
  }
  return TIMELINE_HOURS.length - 1;
};

const generateEnhancedLegend = (doc: jsPDF, shifts: CareShift[], startY: number) => {
  const uniqueCaregivers = [...new Set(shifts.map(s => s.caregiverId).filter(Boolean))];
  const pageWidth = doc.internal.pageSize.getWidth();
  
  let currentY = startY + 10;
  
  // Legend header
  doc.setFontSize(14);
  doc.setTextColor(60, 60, 60);
  doc.text('Care Team Legend', 20, currentY);
  currentY += 15;
  
  // Caregiver legend in columns
  const legendCols = 3;
  const colWidth = (pageWidth - 40) / legendCols;
  
  uniqueCaregivers.forEach((caregiverId, index) => {
    const col = index % legendCols;
    const row = Math.floor(index / legendCols);
    
    const x = 20 + (col * colWidth);
    const y = currentY + (row * 15);
    
    const color = getCaregiverColor(caregiverId);
    const initials = getCaregiverInitials(caregiverId, []);
    const name = getCaregiverName(caregiverId, []);
    
    // Color box
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(x, y - 3, 8, 8, 1, 1, 'F');
    
    // Caregiver info
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text(`${initials} - ${name}`, x + 12, y + 2);
  });
  
  // Shift type legend
  const legendY = currentY + Math.ceil(uniqueCaregivers.length / legendCols) * 15 + 10;
  
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text('Shift Types:', 20, legendY);
  
  doc.setFontSize(9);
  doc.text('🌞 Day Shift (6 AM - 6 PM)', 20, legendY + 12);
  doc.text('🌙 Night Shift (6 PM - 6 AM)', 150, legendY + 12);
  
  // Coverage indicators
  doc.text('⚠️ No Coverage Periods', 280, legendY + 12);
};
