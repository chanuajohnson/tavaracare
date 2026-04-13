
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { createWorkLogFromShift, addWorkLogExpense } from "@/services/care-plans/work-logs";
import { getWorkLogForShift } from "@/services/care-plans/work-logs/workLogCore";
import { WorkLogTimeInput } from './work-logs/WorkLogTimeInput';
import { WorkLogExpenseForm } from './work-logs/WorkLogExpenseForm';
import type { CareShift } from "@/types/careTypes";
import type { WorkLogExpenseInput, WorkLog } from "@/services/care-plans/types/workLogTypes";
import type { ExpenseItem } from './work-logs/types';

interface WorkLogFormProps {
  carePlanId: string;
  shift: CareShift;
  onSuccess: () => void;
  onCancel: () => void;
}

export const WorkLogForm: React.FC<WorkLogFormProps> = ({
  carePlanId,
  shift,
  onSuccess,
  onCancel
}) => {
  const [startTime, setStartTime] = useState(format(new Date(shift.startTime), 'HH:mm'));
  const [endTime, setEndTime] = useState(format(new Date(shift.endTime), 'HH:mm'));
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(true);
  const [existingWorkLog, setExistingWorkLog] = useState<WorkLog | null>(null);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [newExpense, setNewExpense] = useState<ExpenseItem>({
    category: 'food',
    amount: 0,
    description: ''
  });
  const [amountInput, setAmountInput] = useState('');

  // Check for existing work log on mount
  useEffect(() => {
    const checkExisting = async () => {
      if (shift.id) {
        setIsCheckingDuplicate(true);
        const existing = await getWorkLogForShift(shift.id);
        setExistingWorkLog(existing);
        setIsCheckingDuplicate(false);
      } else {
        setIsCheckingDuplicate(false);
      }
    };
    checkExisting();
  }, [shift.id]);

  const handleAmountChange = (value: string) => {
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    const parts = sanitizedValue.split('.');
    if (parts.length > 2) return;
    
    setAmountInput(sanitizedValue);
    const numberValue = parseFloat(sanitizedValue) || 0;
    setNewExpense({...newExpense, amount: numberValue});
  };

  const handleAddExpense = () => {
    if (newExpense.amount <= 0) {
      toast.error("Expense amount must be greater than zero");
      return;
    }
    
    if (!newExpense.description.trim()) {
      toast.error("Please provide a description for the expense");
      return;
    }
    
    setExpenses([...expenses, { ...newExpense }]);
    setNewExpense({
      category: 'food',
      amount: 0,
      description: ''
    });
    setAmountInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      const { success, workLog, error } = await createWorkLogFromShift(
        shift,
        notes
      );

      if (!success || !workLog) {
        throw new Error(error || "Failed to create work log");
      }

      if (expenses.length > 0) {
        const expensePromises = expenses.map(expense => {
          const expenseInput: WorkLogExpenseInput = {
            work_log_id: workLog.id,
            category: expense.category,
            amount: expense.amount,
            description: expense.description
          };
          return addWorkLogExpense(expenseInput);
        });

        await Promise.all(expensePromises);
      }

      toast.success("Work log submitted successfully");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit work log");
      console.error("Error submitting work log:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking for duplicates
  if (isCheckingDuplicate) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Checking work log status...</p>
        </CardContent>
      </Card>
    );
  }

  // Show read-only summary if work log already exists
  if (existingWorkLog) {
    const submittedByLabel = existingWorkLog.submitted_by_role
      ? existingWorkLog.submitted_by_role.charAt(0).toUpperCase() + existingWorkLog.submitted_by_role.slice(1)
      : 'Someone';
    const submittedDate = existingWorkLog.created_at
      ? format(new Date(existingWorkLog.created_at), "MMM d, yyyy 'at' h:mm a")
      : 'Unknown date';

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Hours Already Submitted
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-md p-4 space-y-2">
            <p className="text-sm font-medium text-green-800">
              This shift's hours have already been logged.
            </p>
            <div className="text-sm text-green-700 space-y-1">
              <p><strong>Submitted by:</strong> {submittedByLabel} ({existingWorkLog.caregiver_name})</p>
              <p><strong>Submitted on:</strong> {submittedDate}</p>
              <p><strong>Status:</strong>{' '}
                <Badge variant={
                  existingWorkLog.status === 'approved' ? 'default' :
                  existingWorkLog.status === 'rejected' ? 'destructive' : 'secondary'
                }>
                  {existingWorkLog.status}
                </Badge>
              </p>
              <p><strong>Hours:</strong> {format(new Date(existingWorkLog.start_time), 'h:mm a')} – {format(new Date(existingWorkLog.end_time), 'h:mm a')}</p>
              {existingWorkLog.notes && (
                <p><strong>Notes:</strong> {existingWorkLog.notes}</p>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            To make changes, please contact the administrator or the person who submitted the hours.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline" onClick={onCancel}>Close</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Work Hours</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <WorkLogTimeInput
            startTime={startTime}
            endTime={endTime}
            onStartTimeChange={setStartTime}
            onEndTimeChange={setEndTime}
          />

          <div className="space-y-1">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes about the work..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <WorkLogExpenseForm
            expenses={expenses}
            newExpense={newExpense}
            amountInput={amountInput}
            onAmountChange={handleAmountChange}
            onExpenseChange={(changes) => setNewExpense({ ...newExpense, ...changes })}
            onAddExpense={handleAddExpense}
            onRemoveExpense={(index) => setExpenses(expenses.filter((_, i) => i !== index))}
          />
        </CardContent>
        
        <CardFooter className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Work Log"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
