import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Download, Share2, FileText } from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, differenceInDays } from 'date-fns';
import { CareShift, CareTeamMemberWithProfile } from "@/types/careTypes";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ShiftReportGeneratorProps {
  carePlanId: string;
  careShifts: CareShift[];
  careTeamMembers: CareTeamMemberWithProfile[];
  carePlanTitle: string;
}

export const ShiftReportGenerator: React.FC<ShiftReportGeneratorProps> = ({
  carePlanId,
  careShifts,
  careTeamMembers,
  carePlanTitle,
}) => {
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
  const [reportType, setReportType] = useState<'summary' | 'detailed'>('summary');
  const [viewType, setViewType] = useState<'calendar' | 'table'>('calendar');
  const [isGenerating, setIsGenerating] = useState(false);

  // Quick date range presets
  const setQuickRange = (days: number) => {
    const start = new Date();
    const end = addDays(start, days);
    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
  };

  const setWeekRange = () => {
    const today = new Date();
    const start = startOfWeek(today);
    const end = endOfWeek(today);
    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
  };

  // Filter shifts by date range
  const getFilteredShifts = () => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      return careShifts.filter(shift => {
        try {
          const shiftDate = new Date(shift.startTime);
          return shiftDate >= start && shiftDate <= end;
        } catch (err) {
          console.error('Error parsing shift date:', shift.startTime, err);
          return false;
        }
      });
    } catch (err) {
      console.error('Error filtering shifts:', err);
      return [];
    }
  };

  // Get caregiver name
  const getCaregiverName = (caregiverId?: string) => {
    if (!caregiverId) return "Unassigned";
    const member = careTeamMembers.find(m => m.caregiverId === caregiverId);
    return member?.professionalDetails?.full_name || "Unknown";
  };

  // Get caregiver initials
  const getCaregiverInitials = (caregiverId?: string) => {
    const name = getCaregiverName(caregiverId);
    if (name === "Unassigned" || name === "Unknown") return "?";
    return name.split(' ')
      .filter(part => part.length > 0)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Classify shift as day or night
  const isNightShift = (startTime: string) => {
    try {
      const hour = new Date(startTime).getHours();
      // Night shift: 6 PM (18:00) to 6 AM (06:00)
      return hour >= 18 || hour < 6;
    } catch (err) {
      return false;
    }
  };

  // Format time safely
  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "h:mm a");
    } catch (err) {
      console.error('Error formatting time:', dateString, err);
      return "Invalid time";
    }
  };

  // Format date safely
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (err) {
      console.error('Error formatting date:', dateString, err);
      return "Invalid date";
    }
  };

  // Get caregiver color for consistency
  const getCaregiverColor = (caregiverId?: string) => {
    if (!caregiverId) return [200, 200, 200]; // Gray for unassigned
    
    const hashCode = caregiverId.split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const colorOptions = [
      [59, 130, 246],   // Blue
      [34, 197, 94],    // Green
      [251, 191, 36],   // Yellow
      [147, 51, 234],   // Purple
      [236, 72, 153],   // Pink
      [249, 115, 22],   // Orange
      [20, 184, 166],   // Teal
      [6, 182, 212],    // Cyan
    ];
    
    return colorOptions[hashCode % colorOptions.length];
  };

  // Generate enhanced calendar view PDF
  const generateCalendarPDF = async () => {
    const filteredShifts = getFilteredShifts();
    const doc = new jsPDF('landscape'); // Use landscape for better calendar view
    
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

    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = differenceInDays(end, start);
    
    // Add caregiver legend in top right
    generateCaregiverLegendTopRight(doc, filteredShifts);
    
    let currentY = 60;
    
    if (daysDiff <= 7) {
      // Weekly view
      currentY = generateEnhancedWeeklyCalendar(doc, start, end, filteredShifts, currentY);
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
    const legendStartX = pageWidth - 80;
    let currentY = 25;
    
    // Legend header
    doc.setFontSize(10);
    doc.setTextColor(40);
    doc.text('Caregiver Legend', legendStartX, currentY);
    currentY += 8;
    
    uniqueCaregivers.forEach((caregiverId) => {
      const color = getCaregiverColor(caregiverId);
      const name = getCaregiverName(caregiverId);
      const initials = getCaregiverInitials(caregiverId);
      
      // Draw color box
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(legendStartX, currentY - 3, 4, 4, 'F');
      
      // Draw caregiver info
      doc.setFontSize(8);
      doc.setTextColor(40);
      doc.text(`${initials} - ${name.substring(0, 12)}`, legendStartX + 8, currentY);
      
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
    
    const cellWidth = 35;
    const cellHeight = 80;
    const headerHeight = 15;
    
    // Draw week header
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text(`Week of ${format(weekStart, 'MMM d, yyyy')}`, 20, startY);
    
    let currentY = startY + 15;
    
    // Draw day headers
    doc.setFontSize(10);
    doc.setTextColor(60);
    weekDays.forEach((day, index) => {
      const x = 20 + (index * cellWidth);
      doc.text(format(day, 'EEE'), x + 2, currentY + 8);
      doc.text(format(day, 'd'), x + 2, currentY + 15);
      
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
      let dayShiftY = currentY + headerHeight + 3;
      dayShiftsFiltered.slice(0, 2).forEach((shift) => {
        const color = getCaregiverColor(shift.caregiverId);
        const initials = getCaregiverInitials(shift.caregiverId);
        
        // Draw shift rectangle
        doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(x + 2, dayShiftY, cellWidth - 4, 12, 'F');
        
        // Draw time and caregiver
        doc.setFontSize(6);
        doc.setTextColor(255, 255, 255);
        doc.text(`${formatTime(shift.startTime).slice(0, 5)}`, x + 3, dayShiftY + 4);
        doc.text(initials, x + 3, dayShiftY + 8);
        
        // Draw solid circle for day shift
        doc.setFillColor(255, 255, 255);
        doc.circle(x + cellWidth - 5, dayShiftY + 4, 1, 'F');
        
        dayShiftY += 15;
      });
      
      // Draw night shifts in bottom half
      let nightShiftY = currentY + headerHeight + 35;
      nightShiftsFiltered.slice(0, 2).forEach((shift) => {
        const color = getCaregiverColor(shift.caregiverId);
        const initials = getCaregiverInitials(shift.caregiverId);
        
        // Draw shift rectangle
        doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(x + 2, nightShiftY, cellWidth - 4, 12, 'F');
        
        // Draw time and caregiver
        doc.setFontSize(6);
        doc.setTextColor(255, 255, 255);
        doc.text(`${formatTime(shift.startTime).slice(0, 5)}`, x + 3, nightShiftY + 4);
        doc.text(initials, x + 3, nightShiftY + 8);
        
        // Draw hollow circle for night shift
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.5);
        doc.circle(x + cellWidth - 5, nightShiftY + 4, 1);
        
        nightShiftY += 15;
      });
      
      // Show overflow count if needed
      const totalShifts = dayShifts.length;
      if (totalShifts > 4) {
        doc.setFontSize(6);
        doc.setTextColor(100);
        doc.text(`+${totalShifts - 4} more`, x + 2, currentY + cellHeight - 5);
      }
    });
    
    return currentY + cellHeight + 15;
  };

  const generateEnhancedMonthlyCalendar = (doc: jsPDF, start: Date, end: Date, shifts: CareShift[], startY: number) => {
    const monthStart = startOfMonth(start);
    const monthEnd = endOfMonth(end);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    
    const cellWidth = 35;
    const cellHeight = 30;
    
    // Draw month header
    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.text(format(monthStart, 'MMMM yyyy'), 20, startY);
    
    let currentY = startY + 20;
    
    // Draw day of week headers
    doc.setFontSize(9);
    doc.setTextColor(60);
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach((day, index) => {
      doc.text(day, 20 + (index * cellWidth) + 2, currentY + 8);
    });
    
    currentY += 12;
    
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
        doc.setFontSize(8);
        doc.setTextColor(day.getMonth() === monthStart.getMonth() ? 40 : 150);
        doc.text(format(day, 'd'), x + 2, y + 10);
        
        // Draw shifts with day/night differentiation
        const dayShifts = shifts.filter(shift => isSameDay(new Date(shift.startTime), day));
        const dayShiftsFiltered = dayShifts.filter(shift => !isNightShift(shift.startTime));
        const nightShiftsFiltered = dayShifts.filter(shift => isNightShift(shift.startTime));
        
        // Draw day shifts (solid circles)
        dayShiftsFiltered.slice(0, 2).forEach((shift, shiftIndex) => {
          const color = getCaregiverColor(shift.caregiverId);
          doc.setFillColor(color[0], color[1], color[2]);
          const dotX = x + 3 + (shiftIndex * 8);
          const dotY = y + 18;
          doc.circle(dotX, dotY, 2, 'F');
        });
        
        // Draw night shifts (hollow circles)
        nightShiftsFiltered.slice(0, 2).forEach((shift, shiftIndex) => {
          const color = getCaregiverColor(shift.caregiverId);
          doc.setDrawColor(color[0], color[1], color[2]);
          doc.setLineWidth(1);
          const dotX = x + 3 + (shiftIndex * 8);
          const dotY = y + 24;
          doc.circle(dotX, dotY, 2);
        });
        
        // Show overflow
        if (dayShifts.length > 4) {
          doc.setFontSize(5);
          doc.setTextColor(100);
          doc.text(`+${dayShifts.length - 4}`, x + 25, y + 28);
        }
      });
      
      weekCount++;
    }
    
    return currentY + (weekCount * cellHeight) + 15;
  };

  // Generate table PDF (existing functionality)
  const generateTablePDF = async () => {
    const filteredShifts = getFilteredShifts();
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
          getCaregiverName(shift.caregiverId),
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
          getCaregiverName(shift.caregiverId),
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

  // Main PDF generation function
  const generatePDFReport = async () => {
    setIsGenerating(true);
    
    try {
      console.log('Starting PDF generation with view type:', viewType);
      
      const filteredShifts = getFilteredShifts();
      console.log('Filtered shifts:', filteredShifts.length);
      
      if (filteredShifts.length === 0) {
        toast.error('No shifts found in the selected date range. Please adjust your date filters.');
        return;
      }

      let doc: jsPDF;
      
      if (viewType === 'calendar') {
        doc = await generateCalendarPDF();
      } else {
        doc = await generateTablePDF();
      }
      
      // Save the PDF
      const fileName = `shift-schedule-${viewType}-${format(new Date(startDate), 'yyyy-MM-dd')}-to-${format(new Date(endDate), 'yyyy-MM-dd')}.pdf`;
      doc.save(fileName);
      
      console.log('PDF saved successfully:', fileName);
      toast.success(`${viewType === 'calendar' ? 'Calendar' : 'Table'} schedule report generated successfully!`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      if (error instanceof Error) {
        toast.error(`Failed to generate report: ${error.message}`);
      } else {
        toast.error('Failed to generate report. Please check your data and try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredShifts = getFilteredShifts();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Generate Shift Schedule Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Range Selection */}
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setQuickRange(7)}>
              Next 7 Days
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuickRange(14)}>
              Next 2 Weeks
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuickRange(30)}>
              Next Month
            </Button>
            <Button variant="outline" size="sm" onClick={setWeekRange}>
              This Week
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* View Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="viewType">Report Format</Label>
          <Select value={viewType} onValueChange={(value: 'calendar' | 'table') => setViewType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="calendar">📅 Calendar View (Visual)</SelectItem>
              <SelectItem value="table">📋 Table View (List)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Report Type */}
        <div className="space-y-2">
          <Label htmlFor="reportType">Report Type</Label>
          <Select value={reportType} onValueChange={(value: 'summary' | 'detailed') => setReportType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">Summary (Shifts only)</SelectItem>
              <SelectItem value="detailed">Detailed (Shifts + Care team info)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Preview */}
        <div className="bg-muted/30 rounded-md p-4">
          <h4 className="font-medium mb-2">Report Preview</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Period: {formatDate(startDate)} - {formatDate(endDate)}</p>
            <p>Shifts found: {filteredShifts.length}</p>
            <p>Care team members: {careTeamMembers.length}</p>
            <p>Format: {viewType === 'calendar' ? 'Visual calendar layout with day/night shift indicators' : 'Table format'}</p>
            <p>Report type: {reportType === 'detailed' ? 'Detailed with care team summary' : 'Summary only'}</p>
          </div>
        </div>

        {/* Generate Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={generatePDFReport}
            disabled={isGenerating || filteredShifts.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isGenerating ? 'Generating...' : `Download ${viewType === 'calendar' ? 'Calendar' : 'Table'} PDF Report`}
          </Button>
          
          {filteredShifts.length === 0 && (
            <p className="text-sm text-muted-foreground flex items-center">
              No shifts found in the selected date range
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="font-medium text-blue-900 mb-2">Enhanced Calendar View Features:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Calendar View:</strong> Visual calendar layout with caregiver legend in top-right corner</li>
            <li>• <strong>Day/Night Shifts:</strong> Solid circles for day shifts, hollow circles for night shifts</li>
            <li>• <strong>Split Display:</strong> Day shifts in upper half, night shifts in lower half of each cell</li>
            <li>• <strong>Color Coding:</strong> Each caregiver has a unique color for easy identification</li>
            <li>• <strong>Single Page:</strong> Weekly and monthly calendars fit on single pages</li>
            <li>• <strong>Multi-Month:</strong> Separate pages only for date ranges spanning multiple months</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
