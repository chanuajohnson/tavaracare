
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download } from "lucide-react";
import { format, addDays } from 'date-fns';
import { CareShift, CareTeamMemberWithProfile } from "@/types/careTypes";
import { toast } from "sonner";

import { ReportConfiguration } from './report-generator/components/ReportConfiguration';
import { ReportPreview } from './report-generator/components/ReportPreview';
import { generateEnhancedCalendarPDF } from './report-generator/pdf/EnhancedPDFCalendarGenerator';
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

  // Enhanced PDF generation function
  const generatePDFReport = async () => {
    setIsGenerating(true);
    
    try {
      console.log('Starting enhanced PDF generation with view type:', viewType);
      
      const filteredShifts = getFilteredShifts(careShifts, startDate, endDate);
      console.log('Filtered shifts:', filteredShifts.length);
      
      if (filteredShifts.length === 0) {
        toast.error('No shifts found in the selected date range. Please adjust your date filters.');
        return;
      }

      let doc;
      
      if (viewType === 'calendar') {
        doc = await generateEnhancedCalendarPDF(startDate, endDate, filteredShifts, carePlanTitle);
      } else {
        doc = await generateTablePDF(startDate, endDate, filteredShifts, careTeamMembers, carePlanTitle, reportType);
      }
      
      // Save the PDF with enhanced naming
      const fileName = `enhanced-care-calendar-${format(new Date(startDate), 'yyyy-MM-dd')}-to-${format(new Date(endDate), 'yyyy-MM-dd')}.pdf`;
      doc.save(fileName);
      
      console.log('Enhanced PDF saved successfully:', fileName);
      toast.success(`🌿 Enhanced ${viewType === 'calendar' ? 'timeline calendar' : 'table'} report generated successfully!`);
      
    } catch (error) {
      console.error('Error generating enhanced PDF:', error);
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
          🌿 Enhanced Care Team Calendar
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

        {/* Enhanced Generate Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={generatePDFReport}
            disabled={isGenerating || filteredShifts.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isGenerating ? 'Generating...' : `Download Enhanced ${viewType === 'calendar' ? 'Timeline Calendar' : 'Table'} PDF`}
          </Button>
          
          {filteredShifts.length === 0 && (
            <p className="text-sm text-muted-foreground flex items-center">
              No shifts found in the selected date range
            </p>
          )}
        </div>

        {/* Enhanced Instructions */}
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <h4 className="font-medium text-green-900 mb-2">🌿 Enhanced Timeline Calendar Features:</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• <strong>Timeline-Based Layout:</strong> Horizontal shift bars spanning actual time durations</li>
            <li>• <strong>Smart Space Usage:</strong> Optimized layout with time-based columns (6 AM, 8 AM, 12 PM, etc.)</li>
            <li>• <strong>Day/Night Separation:</strong> 🌞 Day shifts (upper) and 🌙 Night shifts (lower) clearly separated</li>
            <li>• <strong>Color-Coded Caregivers:</strong> Each caregiver has unique colors with initials and time spans</li>
            <li>• <strong>Professional Typography:</strong> Clean, scannable design with proper visual hierarchy</li>
            <li>• <strong>Enhanced Legend:</strong> Compact bottom legend with caregiver details and shift type indicators</li>
            <li>• <strong>Coverage Insights:</strong> Visual gaps and overlap detection for better planning</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
