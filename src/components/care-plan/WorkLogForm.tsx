
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Clock, PlusCircle, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createWorkLogFromShift } from "@/services/care-plans/workLogService";
import type { CareShift } from "@/types/careTypes";

interface WorkLogFormProps {
  carePlanId: string;
  shift: CareShift;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ExpenseItem {
  category: 'medical_supplies' | 'food' | 'transportation' | 'other';
  amount: number;
  description: string;
}

export const WorkLogForm: React.FC<WorkLogFormProps> = ({
  carePlanId,
  shift,
  onSuccess,
  onCancel
}) => {
  const [startTime, setStartTime] = useState(format(new Date(shift.startTime), 'HH:mm'));
  const [endTime, setEndTime] = useState(format(new Date(shift.endTime), 'HH:mm'));
  const [breakMinutes, setBreakMinutes] = useState<number>(30);
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [newExpense, setNewExpense] = useState<ExpenseItem>({
    category: 'food',
    amount: 0,
    description: ''
  });

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const addExpense = () => {
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
  };

  const removeExpense = (index: number) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Create the work log using the shift data
      const { success, error } = await createWorkLogFromShift(
        shift,
        breakMinutes,
        notes
      );

      if (!success) {
        throw new Error(error || "Failed to create work log");
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="startTime">Start Time</Label>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="endTime">End Time</Label>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="breakMinutes">Break Duration (minutes)</Label>
            <Input
              id="breakMinutes"
              type="number"
              min={0}
              max={480}
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(parseInt(e.target.value) || 0)}
            />
          </div>

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

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Expenses</Label>
              <div className="text-sm text-muted-foreground">
                Total: ${totalExpenses.toFixed(2)}
              </div>
            </div>
            
            {expenses.length > 0 && (
              <div className="space-y-2 mb-4">
                {expenses.map((expense, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div>
                      <span className="font-medium">${expense.amount.toFixed(2)}</span>
                      <span className="mx-2">-</span>
                      <span className="capitalize">{expense.category.replace('_', ' ')}</span>
                      <span className="mx-2">-</span>
                      <span className="text-muted-foreground">{expense.description}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExpense(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="expenseCategory">Category</Label>
                <Select 
                  value={newExpense.category} 
                  onValueChange={(value: any) => 
                    setNewExpense({...newExpense, category: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical_supplies">Medical Supplies</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="transportation">Transportation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="expenseAmount">Amount ($)</Label>
                <Input
                  id="expenseAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newExpense.amount}
                  onChange={(e) => 
                    setNewExpense({...newExpense, amount: parseFloat(e.target.value) || 0})
                  }
                />
              </div>

              <div>
                <Label htmlFor="expenseDescription">Description</Label>
                <div className="flex">
                  <Input
                    id="expenseDescription"
                    value={newExpense.description}
                    onChange={(e) => 
                      setNewExpense({...newExpense, description: e.target.value})
                    }
                    className="rounded-r-none"
                  />
                  <Button
                    type="button"
                    size="icon"
                    onClick={addExpense}
                    className="rounded-l-none"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
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
