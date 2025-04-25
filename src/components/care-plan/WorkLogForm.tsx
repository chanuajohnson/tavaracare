
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createWorkLogFromShift, addWorkLogExpense } from "@/services/care-plans/work-logs";
import { WorkLogTimeInput } from './work-logs/WorkLogTimeInput';
import { WorkLogExpenseForm } from './work-logs/WorkLogExpenseForm';
import type { CareShift } from "@/types/careTypes";
import type { WorkLogExpenseInput } from "@/services/care-plans/types/workLogTypes";
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
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [newExpense, setNewExpense] = useState<ExpenseItem>({
    category: 'food',
    amount: 0,
    description: ''
  });
  const [amountInput, setAmountInput] = useState('');

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
            description: expense.description,
            amount: expense.amount
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
