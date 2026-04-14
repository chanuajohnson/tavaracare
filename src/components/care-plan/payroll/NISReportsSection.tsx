import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, Loader2 } from "lucide-react";
import { generateNI184Report } from "@/services/care-plans/reports/ni184Generator";
import { generateNI187Report } from "@/services/care-plans/reports/ni187Generator";
import { toast } from "sonner";

interface NISReportsSectionProps {
  carePlanId: string;
  familyId: string;
}

export const NISReportsSection: React.FC<NISReportsSectionProps> = ({ carePlanId, familyId }) => {
  const [periodStart, setPeriodStart] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [periodEnd, setPeriodEnd] = useState(() => {
    const d = new Date();
    d.setDate(0); // last day of previous month
    return d.toISOString().split('T')[0];
  });
  const [generating184, setGenerating184] = useState(false);
  const [generating187, setGenerating187] = useState(false);

  const handleDownload = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerate184 = async () => {
    setGenerating184(true);
    const url = await generateNI184Report(carePlanId, familyId, new Date(periodStart), new Date(periodEnd));
    setGenerating184(false);
    if (url) {
      handleDownload(url, `NI184_${periodStart}_to_${periodEnd}.pdf`);
      toast.success("NI 184 report generated and downloaded");
    } else {
      toast.error("No NIS-registered employees found or failed to generate report");
    }
  };

  const handleGenerate187 = async () => {
    setGenerating187(true);
    const url = await generateNI187Report(carePlanId, familyId, new Date(periodStart), new Date(periodEnd));
    setGenerating187(false);
    if (url) {
      handleDownload(url, `NI187_${periodStart}_to_${periodEnd}.pdf`);
      toast.success("NI 187 report generated and downloaded");
    } else {
      toast.error("Failed to generate NI 187 report");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" />
          NIS Government Reports
        </CardTitle>
        <CardDescription>
          Generate NI 184 (per-employee statement) and NI 187 (employer summary) for government filing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nis-start">Period Start</Label>
            <Input
              id="nis-start"
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nis-end">Period End</Label>
            <Input
              id="nis-end"
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleGenerate184}
            disabled={generating184}
            variant="outline"
            className="flex-1"
          >
            {generating184 ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download NI 184
          </Button>
          <Button
            onClick={handleGenerate187}
            disabled={generating187}
            variant="outline"
            className="flex-1"
          >
            {generating187 ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download NI 187
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
