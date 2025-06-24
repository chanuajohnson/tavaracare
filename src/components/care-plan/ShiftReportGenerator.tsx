
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

  // Generate calendar view PDF
  const generateCalendarPDF = async () => {
    const filteredShifts = getFilteredShifts();
    const doc = new jsPDF();
    
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
    doc.text(`Total Shifts: ${filteredShifts.length}`, 20, 56);

    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = differenceInDays(end, start);
    
    let currentY = 70;
    
    if (daysDiff <= 7) {
      // Weekly view
      currentY = generateWeeklyCalendar(doc, start, end, filteredShifts, currentY);
    } else if (daysDiff <= 31) {
      // Monthly view  
      currentY = generateMonthlyCalendar(doc, start, end, filteredShifts, currentY);
    } else {
      // Multi-month view - generate multiple monthly calendars
      let currentStart = startOfMonth(start);
      const finalEnd = endOfMonth(end);
      
      while (currentStart <= finalEnd) {
        const monthEnd = endOfMonth(currentStart);
        currentY = generateMonthlyCalendar(doc, currentStart, monthEnd, filteredShifts, currentY);
        currentStart = addDays(monthEnd, 1);
        
        // Add new page if needed
        if (currentY > 250) {
          doc.addPage();
          currentY = 20;
        }
      }
    }

    // Add caregiver legend
    if (currentY > 220) {
      doc.addPage();
      currentY = 20;
    }
    
    currentY = generateCaregiverLegend(doc, filteredShifts, currentY + 10);
    
    return doc;
  };

  const generateWeeklyCalendar = (doc: jsPDF, start: Date, end: Date, shifts: CareShift[], startY: number) => {
    const weekStart = startOfWeek(start);
    const weekDays = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });
    
    const cellWidth = 25;
    const cellHeight = 60;
    const headerHeight = 15;
    
    // Draw week header
    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text(`Week of ${format(weekStart, 'MMM d, yyyy')}`, 20, startY);
    
    let currentY = startY + 10;
    
    // Draw day headers
    doc.setFontSize(9);
    doc.setTextColor(60);
    weekDays.forEach((day, index) => {
      const x = 20 + (index * cellWidth);
      doc.text(format(day, 'EEE'), x + 2, currentY + 8);
      doc.text(format(day, 'd'), x + 2, currentY + 15);
      
      // Draw cell border
      doc.rect(x, currentY, cellWidth, cellHeight);
    });
    
    // Draw shifts
    weekDays.forEach((day, dayIndex) => {
      const dayShifts = shifts.filter(shift => isSameDay(new Date(shift.startTime), day));
      const x = 20 + (dayIndex * cellWidth);
      let shiftY = currentY + headerHeight + 2;
      
      dayShifts.slice(0, 3).forEach((shift, shiftIndex) => {
        const color = getCaregiverColor(shift.caregiverId);
        doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(x + 1, shiftY, cellWidth - 2, 8, 'F');
        
        doc.setFontSize(6);
        doc.setTextColor(255, 255, 255);
        doc.text(`${formatTime(shift.startTime)}`, x + 2, shiftY + 4);
        doc.text(`${getCaregiverName(shift.caregiverId).substring(0, 8)}`, x + 2, shiftY + 7);
        
        shiftY += 10;
      });
      
      if (dayShifts.length > 3) {
        doc.setFontSize(6);
        doc.setTextColor(100);
        doc.text(`+${dayShifts.length - 3} more`, x + 2, shiftY);
      }
    });
    
    return currentY + cellHeight + 10;
  };

  const generateMonthlyCalendar = (doc: jsPDF, start: Date, end: Date, shifts: CareShift[], startY: number) => {
    const monthStart = startOfMonth(start);
    const monthEnd = endOfMonth(end);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    
    const cellWidth = 25;
    const cellHeight = 25;
    
    // Draw month header
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text(format(monthStart, 'MMMM yyyy'), 20, startY);
    
    let currentY = startY + 15;
    
    // Draw day of week headers
    doc.setFontSize(8);
    doc.setTextColor(60);
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach((day, index) => {
      doc.text(day, 20 + (index * cellWidth) + 2, currentY + 8);
    });
    
    currentY += 10;
    
    // Draw calendar grid
    let weekCount = 0;
    for (let i = 0; i < allDays.length; i += 7) {
      const weekDays = allDays.slice(i, i + 7);
      
      weekDays.forEach((day, dayIndex) => {
        const x = 20 + (dayIndex * cellWidth);
        const y = currentY + (weekCount * cellHeight);
        
        // Draw cell border
        doc.rect(x, y, cellWidth, cellHeight);
        
        // Draw date number
        doc.setFontSize(8);
        doc.setTextColor(day.getMonth() === monthStart.getMonth() ? 40 : 150);
        doc.text(format(day, 'd'), x + 2, y + 10);
        
        // Draw shifts as colored dots
        const dayShifts = shifts.filter(shift => isSameDay(new Date(shift.startTime), day));
        dayShifts.slice(0, 4).forEach((shift, shiftIndex) => {
          const color = getCaregiverColor(shift.caregiverId);
          doc.setFillColor(color[0], color[1], color[2]);
          const dotX = x + 2 + (shiftIndex % 2) * 6;
          const dotY = y + 15 + Math.floor(shiftIndex / 2) * 4;
          doc.circle(dotX, dotY, 1.5, 'F');
        });
        
        if (dayShifts.length > 4) {
          doc.setFontSize(6);
          doc.setTextColor(100);
          doc.text(`+${dayShifts.length - 4}`, x + 15, y + 22);
        }
      });
      
      weekCount++;
    }
    
    return currentY + (weekCount * cellHeight) + 10;
  };

  const generateCaregiverLegend = (doc: jsPDF, shifts: CareShift[], startY: number) => {
    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text('Caregiver Legend', 20, startY);
    
    const uniqueCaregivers = [...new Set(shifts.map(s => s.caregiverId).filter(Boolean))];
    let currentY = startY + 10;
    
    uniqueCaregivers.forEach((caregiverId, index) => {
      const color = getCaregiverColor(caregiverId);
      const name = getCaregiverName(caregiverId);
      const shiftCount = shifts.filter(s => s.caregiverId === caregiverId).length;
      
      // Draw color box
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(20, currentY, 5, 5, 'F');
      
      // Draw caregiver info
      doc.setFontSize(10);
      doc.setTextColor(40);
      doc.text(`${name} (${shiftCount} shifts)`, 30, currentY + 4);
      
      currentY += 8;
    });
    
    return currentY;
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
            <p>Format: {viewType === 'calendar' ? 'Visual calendar layout' : 'Table format'}</p>
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
          <h4 className="font-medium text-blue-900 mb-2">Report Format Options:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Calendar View:</strong> Visual calendar layout similar to your shift calendar - perfect for quick overview</li>
            <li>• <strong>Table View:</strong> Detailed list format with all shift information - great for comprehensive records</li>
            <li>• Color-coded caregivers in calendar view for easy identification</li>
            <li>• Automatic layout adjustment based on date range (weekly/monthly)</li>
            <li>• Caregiver legend included in calendar reports</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
