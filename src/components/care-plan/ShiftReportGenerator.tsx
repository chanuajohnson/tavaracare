
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download } from "lucide-react";
import { format, addDays } from 'date-fns';
import { CareShift, CareTeamMemberWithProfile } from "@/types/careTypes";
import { toast } from "sonner";

import { ReportConfiguration } from './report-generator/components/ReportConfiguration';
import { ReportPreview } from './report-generator/components/ReportPreview';
import { generateCalendarPDF } from './report-generator/pdf/PDFCalendarGenerator';
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

  // Main PDF generation function
  const generatePDFReport = async () => {
    setIsGenerating(true);
    
    try {
      console.log('Starting PDF generation with view type:', viewType);
      
      const filteredShifts = getFilteredShifts(careShifts, startDate, endDate);
      console.log('Filtered shifts:', filteredShifts.length);
      
      if (filteredShifts.length === 0) {
        toast.error('No shifts found in the selected date range. Please adjust your date filters.');
        return;
      }

      let doc;
      
      if (viewType === 'calendar') {
        doc = await generateCalendarPDF(startDate, endDate, filteredShifts, carePlanTitle);
      } else {
        doc = await generateTablePDF(startDate, endDate, filteredShifts, careTeamMembers, carePlanTitle, reportType);
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

  const filteredShifts = getFilteredShifts(careShifts, startDate, endDate);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Generate Shift Schedule Report
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
            <li>• <strong>Full-Page Calendar:</strong> Calendar now uses the entire page width for better visibility</li>
            <li>• <strong>Multi-Week Pages:</strong> 2+ week ranges automatically generate separate pages per week</li>
            <li>• <strong>Day/Night Shifts:</strong> Solid circles for day shifts, hollow circles for night shifts</li>
            <li>• <strong>Split Display:</strong> Day shifts in upper half, night shifts in lower half of each cell</li>
            <li>• <strong>Color Coding:</strong> Each caregiver has a unique color for easy identification</li>
            <li>• <strong>Improved Legend:</strong> Caregiver legend positioned to avoid calendar overlap</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
