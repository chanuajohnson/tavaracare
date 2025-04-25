
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CreditCard, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { PayrollEntry } from "@/services/care-plans/workLogService";
import { supabase } from "@/lib/supabase";

interface PayrollEntriesTableProps {
  entries: PayrollEntry[];
  onApprove: (entry: PayrollEntry) => void;
  readOnly?: boolean;
}

export const PayrollEntriesTable: React.FC<PayrollEntriesTableProps> = ({ 
  entries,
  onApprove,
  readOnly = false
}) => {
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [caregiverNames, setCaregiverNames] = useState<Record<string, string>>({});

  // Update mobile view state on window resize
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Fetch display names for all caregiver IDs
  useEffect(() => {
    const fetchCaregiverNames = async () => {
      if (!entries.length) return;
      
      // Get unique caregiver IDs
      const caregiverIds = [...new Set(entries.map(entry => entry.caregiver_id).filter(Boolean))];
      
      if (!caregiverIds.length) return;
      
      try {
        const { data, error } = await supabase
          .from('care_team_members')
          .select('caregiver_id, display_name')
          .in('caregiver_id', caregiverIds);
          
        if (error) {
          console.error('Error fetching caregiver names:', error);
          return;
        }
        
        // Create a mapping of caregiver_id to display_name
        const namesMap: Record<string, string> = {};
        data.forEach(item => {
          if (item.caregiver_id) {
            namesMap[item.caregiver_id] = item.display_name || 'Unknown';
          }
        });
        
        setCaregiverNames(namesMap);
      } catch (err) {
        console.error('Failed to fetch caregiver names:', err);
      }
    };
    
    fetchCaregiverNames();
  }, [entries]);

  if (entries.length === 0) {
    return <div className="text-center p-4">No payroll entries found.</div>;
  }
  
  const getDisplayName = (entry: PayrollEntry) => {
    if (!entry.caregiver_id) return 'Unknown';
    return caregiverNames[entry.caregiver_id] || entry.caregiver_name || 'Unknown';
  };

  const getStatusBadge = (status: string) => {
    if (status === 'paid') {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Paid</Badge>;
    } else if (status === 'approved') {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Approved</Badge>;
    } else {
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
    }
  };

  // Mobile card view for each entry
  const renderMobileCard = (entry: PayrollEntry) => {
    return (
      <Card key={entry.id} className="mb-4">
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{getDisplayName(entry)}</h4>
              <p className="text-sm text-muted-foreground">
                {entry.created_at ? format(new Date(entry.created_at), 'MMM d, yyyy') : 'Unknown date'}
              </p>
            </div>
            {getStatusBadge(entry.payment_status)}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Hours</p>
              <p>
                {formatCurrency(entry.total_amount || 0)}
              </p>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground">Payment Date</p>
              <p>
                {entry.payment_date ? format(new Date(entry.payment_date), 'MMM d, yyyy') : 'Not paid'}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Regular Hours</p>
              <p>{entry.regular_hours?.toFixed(1) || 0}h @ ${entry.regular_rate?.toFixed(2) || 0}/hr</p>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground">Overtime</p>
              <p>
                {entry.overtime_hours && entry.overtime_hours > 0
                  ? `${entry.overtime_hours?.toFixed(1) || 0}h @ $${entry.overtime_rate?.toFixed(2) || 0}/hr`
                  : 'None'}
              </p>
            </div>
          </div>
          
          {!readOnly && entry.payment_status === 'approved' && (
            <div className="flex justify-end mt-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => onApprove(entry)}
              >
                <CreditCard className="h-4 w-4" />
                Process Payment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      {isMobileView ? (
        <div className="space-y-3">
          {entries.map(renderMobileCard)}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>Payroll Entries</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Caregiver</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Date</TableHead>
                {!readOnly && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    {entry.created_at ? format(new Date(entry.created_at), 'MMM d, yyyy') : 'Unknown'}
                  </TableCell>
                  <TableCell className="font-medium">
                    {getDisplayName(entry)}
                  </TableCell>
                  <TableCell>
                    <div>
                      {entry.regular_hours?.toFixed(1) || 0} regular
                      {entry.overtime_hours && entry.overtime_hours > 0 && 
                        `, ${entry.overtime_hours?.toFixed(1) || 0} OT`}
                      {entry.holiday_hours && entry.holiday_hours > 0 && 
                        `, ${entry.holiday_hours?.toFixed(1) || 0} holiday`}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatCurrency(entry.total_amount || 0)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(entry.payment_status)}
                  </TableCell>
                  <TableCell>
                    {entry.payment_date ? format(new Date(entry.payment_date), 'MMM d, yyyy') : 'Not paid'}
                  </TableCell>
                  {!readOnly && (
                    <TableCell className="text-right">
                      {entry.payment_status === 'approved' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => onApprove(entry)}
                        >
                          <CreditCard className="h-4 w-4" />
                          Process Payment
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
};
