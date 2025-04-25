
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { Receipt, Download, Calendar } from "lucide-react";
import { toast } from "sonner";
import { generatePayrollReport } from '@/services/care-plans/receiptService';

interface PayrollReportGeneratorProps {
  carePlanId: string;
}

export const PayrollReportGenerator: React.FC<PayrollReportGeneratorProps> = ({
  carePlanId
}) => {
  const [open, setOpen] = useState(false);
  const [caregiverName, setCaregiverName] = useState("");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      
      if (!dateRange.from || !dateRange.to) {
        toast.error("Please select a date range for the report");
        return;
      }
      
      const reportPdfUrl = await generatePayrollReport(
        carePlanId,
        caregiverName || undefined,
        dateRange
      );
      
      setReportUrl(reportPdfUrl);
      toast.success("Payroll report generated successfully");
    } catch (error) {
      console.error("Error generating payroll report:", error);
      toast.error("Failed to generate payroll report");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!reportUrl) return;
    
    const link = document.createElement('a');
    link.href = reportUrl;
    
    // Create a filename with the date range
    let filename = "Payroll_Report";
    if (dateRange.from && dateRange.to) {
      const fromStr = dateRange.from.toISOString().split('T')[0];
      const toStr = dateRange.to.toISOString().split('T')[0];
      filename += `_${fromStr}_to_${toStr}`;
    }
    
    if (caregiverName) {
      filename += `_${caregiverName.replace(/\s+/g, '_')}`;
    }
    
    link.download = `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Report downloaded successfully");
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="gap-2" 
        onClick={() => setOpen(true)}
      >
        <Receipt className="h-4 w-4" />
        Generate Payroll Report
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Payroll Report</DialogTitle>
            <DialogDescription>
              Create a detailed payroll report for the selected period and caregiver.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="caregiver">Caregiver Name (Optional)</Label>
              <Input
                id="caregiver"
                placeholder="Filter by caregiver name"
                value={caregiverName}
                onChange={(e) => setCaregiverName(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Leave blank to include all caregivers
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Date Range</Label>
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
              />
            </div>
            
            {reportUrl && (
              <div className="border rounded p-4">
                <iframe 
                  src={reportUrl} 
                  className="w-full h-[200px] border rounded"
                  title="Payroll Report Preview"
                />
              </div>
            )}
          </div>
          
          <DialogFooter className="sm:justify-between flex-wrap gap-2">
            {reportUrl ? (
              <Button
                variant="outline"
                className="gap-2 sm:w-auto w-full"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
                Download Report
              </Button>
            ) : (
              <div /> // Empty div to maintain layout
            )}
            
            <Button
              onClick={handleGenerateReport}
              disabled={isGenerating || (!dateRange.from || !dateRange.to)}
              className="gap-2 sm:w-auto w-full"
            >
              <Calendar className="h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
