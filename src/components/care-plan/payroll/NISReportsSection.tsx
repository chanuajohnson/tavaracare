import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Loader2, AlertCircle } from "lucide-react";
import { generateNI184Report } from "@/services/care-plans/reports/ni184Generator";
import { generateNI187Report } from "@/services/care-plans/reports/ni187Generator";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    d.setDate(0);
    return d.toISOString().split('T')[0];
  });
  const [generating184, setGenerating184] = useState(false);
  const [generating187, setGenerating187] = useState(false);

  // NI 187 manual fields
  const [balanceBf, setBalanceBf] = useState('0');
  const [penalty, setPenalty] = useState('0');
  const [interest, setInterest] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'cheque'>('cheque');

  const handleDownload = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerate184 = async () => {
    setGenerating184(true);
    try {
      const url = await generateNI184Report(carePlanId, familyId, new Date(periodStart), new Date(periodEnd));
      if (url) {
        handleDownload(url, `NI184_${periodStart}_to_${periodEnd}.pdf`);
        toast.success("NI 184 form generated and downloaded");
      } else {
        toast.error("No NIS-registered employees found. Please mark employees as NIS-registered on the Care Team page first.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate NI 184 form");
    } finally {
      setGenerating184(false);
    }
  };

  const handleGenerate187 = async () => {
    setGenerating187(true);
    try {
      const url = await generateNI187Report(
        carePlanId,
        familyId,
        new Date(periodStart),
        new Date(periodEnd),
        {
          balanceBf: parseFloat(balanceBf) || 0,
          penalty: parseFloat(penalty) || 0,
          interest: parseFloat(interest) || 0,
          paymentMethod,
        }
      );
      if (url) {
        handleDownload(url, `NI187_${periodStart}_to_${periodEnd}.pdf`);
        toast.success("NI 187 form generated and downloaded");
      } else {
        toast.error("Failed to generate NI 187 form");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate NI 187 form");
    } finally {
      setGenerating187(false);
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
          Download pre-filled official NI 184 and NI 187 government forms with your payroll data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Employees must be marked as <strong>NIS Registered</strong> on the Care Team page with their NIS number for data to appear on these forms.
          </AlertDescription>
        </Alert>

        {/* Period Selection */}
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

        {/* NI 184 Download */}
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm">NI 184 — Statement of Contribution Paid/Due</h4>
              <p className="text-xs text-muted-foreground">Per-employee detail with weekly contribution breakdown</p>
            </div>
            <Button
              onClick={handleGenerate184}
              disabled={generating184}
              variant="outline"
              size="sm"
            >
              {generating184 ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download NI 184
            </Button>
          </div>
        </div>

        {/* NI 187 Download with Manual Fields */}
        <div className="border rounded-lg p-4 space-y-3">
          <div>
            <h4 className="font-medium text-sm">NI 187 — Summary of Contributions Due/In Arrears</h4>
            <p className="text-xs text-muted-foreground">Employer-level summary with payment details</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label htmlFor="balance-bf" className="text-xs">Balance B/F ($)</Label>
              <Input
                id="balance-bf"
                type="number"
                step="0.01"
                min="0"
                value={balanceBf}
                onChange={(e) => setBalanceBf(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="penalty" className="text-xs">Penalty ($)</Label>
              <Input
                id="penalty"
                type="number"
                step="0.01"
                min="0"
                value={penalty}
                onChange={(e) => setPenalty(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="interest" className="text-xs">Interest ($)</Label>
              <Input
                id="interest"
                type="number"
                step="0.01"
                min="0"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="payment-method" className="text-xs">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(v: 'cash' | 'cheque') => setPaymentMethod(v)}>
                <SelectTrigger id="payment-method" className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleGenerate187}
              disabled={generating187}
              variant="outline"
              size="sm"
            >
              {generating187 ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download NI 187
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
