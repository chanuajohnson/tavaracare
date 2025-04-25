
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { WorkLogTimeInput } from './WorkLogTimeInput';
import { WorkLogExpenseForm } from './WorkLogExpenseForm';
import { useWorkLogForm } from '@/hooks/payroll/useWorkLogForm';
import type { CareShift } from "@/types/careTypes";

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
  const {
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    notes,
    setNotes,
    isLoading,
    expenses,
    newExpense,
    amountInput,
    setExpenses,
    setNewExpense,
    handleAmountChange,
    handleAddExpense,
    handleSubmit
  } = useWorkLogForm(carePlanId, shift, onSuccess);

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
            onExpenseChange={setNewExpense}
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
