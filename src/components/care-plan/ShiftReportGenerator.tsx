
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download } from "lucide-react";
import { format, addDays } from 'date-fns';
import { CareShift, CareTeamMemberWithProfile } from "@/types/careTypes";
import { toast } from "sonner";

import { ReportConfiguration } from './report-generator/components/ReportConfiguration';
import { ReportPreview } from './report-generator/components/ReportPreview';
import { generateGridBasedCalendarPDF } from './report-generator/pdf/GridBasedPDFCalendarGenerator';
import { generateTablePDF } from './report-generator/pdf/PDFTableGenerator';
import { getFilteredShifts } from './report-generator/utils/dateUtils';

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

  // Grid-based PDF generation function that mirrors ShiftCalendar.tsx
  const generatePDFReport = async () => {
    setIsGenerating(true);
    
    try {
      console.log('Starting grid-based PDF generation with view type:', viewType);
      
      const filteredShifts = getFilteredShifts(careShifts, startDate, endDate);
      console.log('Filtered shifts:', filteredShifts.length);
      
      if (filteredShifts.length === 0) {
        toast.error('No shifts found in the selected date range. Please adjust your date filters.');
        return;
      }

      let doc;
      
      if (viewType === 'calendar') {
        // Use the enhanced grid-based generator that mirrors ShiftCalendar.tsx
        doc = await generateGridBasedCalendarPDF(startDate, endDate, filteredShifts, careTeamMembers, carePlanTitle);
      } else {
        doc = await generateTablePDF(startDate, endDate, filteredShifts, careTeamMembers, carePlanTitle, reportType);
      }
      
      // Save the PDF with descriptive naming
      const fileName = `care-schedule-${format(new Date(startDate), 'yyyy-MM-dd')}-to-${format(new Date(endDate), 'yyyy-MM-dd')}.pdf`;
      doc.save(fileName);
      
      console.log('Enhanced grid-based PDF saved successfully:', fileName);
      toast.success(`📅 ${viewType === 'calendar' ? 'Calendar schedule' : 'Table'} report generated successfully!`);
      
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

  const filteredShifts = getFilteredShifts(careShifts, startDate, endDate);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          📅 Care Team Schedule Export
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ReportConfiguration
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          reportType={reportType}
          setReportType={setReportType}
          viewType={viewType}
          setViewType={setViewType}
        />

        <ReportPreview
          startDate={startDate}
          endDate={endDate}
          filteredShifts={filteredShifts}
          careTeamMembers={careTeamMembers}
          viewType={viewType}
          reportType={reportType}
        />

        {/* Generate Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={generatePDFReport}
            disabled={isGenerating || filteredShifts.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isGenerating ? 'Generating...' : `Download ${viewType === 'calendar' ? 'Calendar Schedule' : 'Table'} PDF`}
          </Button>
          
          {filteredShifts.length === 0 && (
            <p className="text-sm text-muted-foreground flex items-center">
              No shifts found in the selected date range
            </p>
          )}
        </div>

        {/* Updated Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="font-medium text-blue-900 mb-2">📅 Enhanced Calendar Schedule Features:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Day/Night Separation:</strong> Shifts organized by time - Day shifts (6 AM - 5 PM) and Night shifts (5 PM - 6 AM)</li>
            <li>• <strong>Grid Layout:</strong> Weekly view with Sunday through Saturday columns</li>
            <li>• <strong>Color-Coded Shifts:</strong> Each caregiver has unique colors matching the app</li>
            <li>• <strong>Improved Shift Cards:</strong> Caregiver initials in top-left corner, clear shift details</li>
            <li>• <strong>Weekend Highlighting:</strong> Blue background for Saturday and Sunday</li>
            <li>• <strong>Overflow Handling:</strong> "+X more" indicator when multiple shifts per time period</li>
            <li>• <strong>Caregiver Summary:</strong> Shows shift count per caregiver at the top</li>
            <li>• <strong>Print-Ready:</strong> Optimized layout with proper margins and page boundaries</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
