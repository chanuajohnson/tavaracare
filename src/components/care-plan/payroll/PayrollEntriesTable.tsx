
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Clock, Download, Printer } from "lucide-react";
import type { PayrollEntry } from "@/services/care-plans/types/workLogTypes";
import { formatCurrency } from "@/lib/utils";
import { generatePayrollReceipt } from "@/services/care-plans/receiptService";
import { toast } from "sonner";

interface PayrollEntriesTableProps {
  entries: PayrollEntry[];
  isLoading?: boolean;
  onApprove?: (entry: PayrollEntry) => void;
  readonly?: boolean;
}

export const PayrollEntriesTable: React.FC<PayrollEntriesTableProps> = ({
  entries,
  isLoading = false,
  onApprove,
  readonly = false
}) => {
  const [generatingReceipt, setGeneratingReceipt] = React.useState<string | null>(null);

  const handleGenerateReceipt = async (entry: PayrollEntry) => {
    try {
      setGeneratingReceipt(entry.id);
      const pdfBlob = await generatePayrollReceipt(entry);
      
      // Create a URL for the PDF blob
      const url = URL.createObjectURL(pdfBlob);
      
      // Open the PDF in a new tab
      window.open(url, '_blank');
      
      setGeneratingReceipt(null);
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast.error('Failed to generate receipt');
      setGeneratingReceipt(null);
    }
  };

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payroll Entries</CardTitle>
          <CardDescription>No payroll entries found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <p className="mt-2 text-lg font-medium">No payroll entries yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Payroll entries will appear here once work logs are processed
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payroll Entries</CardTitle>
        <CardDescription>Review and process payroll entries</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Caregiver</TableHead>
                <TableHead>Regular Hours</TableHead>
                <TableHead>Overtime Hours</TableHead>
                <TableHead>Holiday Hours</TableHead>
                {/* Only show shadow hours if available */}
                {entries.some(entry => entry.shadow_hours !== undefined) && (
                  <TableHead>Shadow Hours</TableHead>
                )}
                <TableHead>Expenses</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                {!readonly && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    {entry.entered_at ? format(new Date(entry.entered_at), 'MMM d, yyyy') : '-'}
                  </TableCell>
                  <TableCell>{entry.caregiver_name || 'Unknown'}</TableCell>
                  <TableCell>
                    {entry.regular_hours} hrs @ {formatCurrency(entry.regular_rate)}
                  </TableCell>
                  <TableCell>
                    {entry.overtime_hours ? `${entry.overtime_hours} hrs @ ${formatCurrency(entry.overtime_rate || 0)}` : '-'}
                  </TableCell>
                  <TableCell>
                    {entry.holiday_hours ? `${entry.holiday_hours} hrs @ ${formatCurrency(entry.holiday_rate || 0)}` : '-'}
                  </TableCell>
                  {/* Only show shadow hours if available */}
                  {entries.some(entry => entry.shadow_hours !== undefined) && (
                    <TableCell>
                      {entry.shadow_hours ? `${entry.shadow_hours} hrs` : '-'}
                    </TableCell>
                  )}
                  <TableCell>
                    {entry.expense_total ? formatCurrency(entry.expense_total) : '-'}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(entry.total_amount)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        entry.payment_status === 'paid'
                          ? 'default'
                          : entry.payment_status === 'approved'
                          ? 'outline'
                          : 'secondary'
                      }
                    >
                      {entry.payment_status.charAt(0).toUpperCase() + entry.payment_status.slice(1)}
                    </Badge>
                  </TableCell>
                  {!readonly && (
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateReceipt(entry)}
                          disabled={generatingReceipt === entry.id}
                        >
                          {generatingReceipt === entry.id ? (
                            <>Loading...</>
                          ) : (
                            <>
                              <Printer className="h-4 w-4 mr-1" />
                              Receipt
                            </>
                          )}
                        </Button>
                        {entry.payment_status === 'pending' && onApprove && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => onApprove(entry)}
                          >
                            Approve
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t px-6 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </div>
        <Button variant="outline" size="sm" className="ml-auto">
          <Download className="h-4 w-4 mr-1" />
          Export All
        </Button>
      </CardFooter>
    </Card>
  );
};
