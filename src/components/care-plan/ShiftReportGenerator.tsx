
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Download, Share2, FileText } from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { CareShift, CareTeamMemberWithProfile } from "@/types/careTypes";
import { toast } from "sonner";
import jsPDF from 'jspdf';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable?: { finalY: number };
  }
}

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

  // Generate PDF report
  const generatePDFReport = async () => {
    setIsGenerating(true);
    
    try {
      console.log('Starting PDF generation...');
      
      const filteredShifts = getFilteredShifts();
      console.log('Filtered shifts:', filteredShifts.length);
      
      if (filteredShifts.length === 0) {
        toast.error('No shifts found in the selected date range. Please adjust your date filters.');
        return;
      }

      // Import jspdf-autotable as a side effect to extend jsPDF prototype
      await import('jspdf-autotable');
      console.log('AutoTable plugin imported');

      const doc = new jsPDF();
      
      // Verify autoTable is now available
      if (typeof doc.autoTable !== 'function') {
        throw new Error('AutoTable plugin failed to initialize. PDF generation requires the jspdf-autotable plugin.');
      }
      
      console.log('AutoTable method available:', typeof doc.autoTable);
      
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

      console.log('Table data prepared:', tableData.length, 'rows');

      // Add table using autoTable
      doc.autoTable({
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

      console.log('Main table added successfully');

      // Add summary if detailed report
      if (reportType === 'detailed' && careTeamMembers.length > 0) {
        const finalY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : 200;
        
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

        doc.autoTable({
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

        console.log('Summary table added successfully');
      }

      // Save the PDF
      const fileName = `shift-schedule-${format(new Date(startDate), 'yyyy-MM-dd')}-to-${format(new Date(endDate), 'yyyy-MM-dd')}.pdf`;
      doc.save(fileName);
      
      console.log('PDF saved successfully:', fileName);
      toast.success('Shift schedule report generated successfully!');
      
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
            {isGenerating ? 'Generating...' : 'Download PDF Report'}
          </Button>
          
          {filteredShifts.length === 0 && (
            <p className="text-sm text-muted-foreground flex items-center">
              No shifts found in the selected date range
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="font-medium text-blue-900 mb-2">How to share with your care team:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Download the PDF report using the button above</li>
            <li>• Email the PDF to your care team members</li>
            <li>• Share via text message or messaging apps</li>
            <li>• Print copies for caregivers who prefer paper schedules</li>
            <li>• The report includes all shift details, times, and assignments</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
