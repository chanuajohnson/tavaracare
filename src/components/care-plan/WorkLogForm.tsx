
import React, { useState, useEffect } from 'react';
import { format, addHours, differenceInHours } from 'date-fns';
import { Calendar as CalendarIcon, Clock, PlusCircle, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  createWorkLog, 
  WorkLogInput, 
  WorkLogExpenseInput, 
  addWorkLogExpense 
} from "@/services/care-plans/workLogService";
import { CareTeamMemberWithProfile } from "@/types/careTypes";

interface WorkLogFormProps {
  carePlanId: string;
  careTeamMembers: CareTeamMemberWithProfile[];
  shiftStart?: Date;
  shiftEnd?: Date;
  caregiverId?: string;
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
  careTeamMembers,
  shiftStart,
  shiftEnd,
  caregiverId,
  onSuccess,
  onCancel
}) => {
  const [startDate, setStartDate] = useState<Date | undefined>(shiftStart || new Date());
  const [startTime, setStartTime] = useState(
    format(shiftStart || addHours(new Date(), -8), 'HH:mm')
  );
  const [endDate, setEndDate] = useState<Date | undefined>(shiftEnd || new Date());
  const [endTime, setEndTime] = useState(
    format(shiftEnd || new Date(), 'HH:mm')
  );
  const [breakMinutes, setBreakMinutes] = useState<number>(30);
  const [notes, setNotes] = useState<string>('');
  const [selectedCaregiver, setSelectedCaregiver] = useState<string>(caregiverId || '');
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [newExpense, setNewExpense] = useState<ExpenseItem>({
    category: 'food',
    amount: 0,
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Calculate total hours (with break deduction)
  const calculateHours = () => {
    if (!startDate || !endDate || !startTime || !endTime) return 0;
    
    const start = new Date(startDate);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    start.setHours(startHour, startMinute, 0, 0);
    
    const end = new Date(endDate);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    end.setHours(endHour, endMinute, 0, 0);
    
    const hoursDiff = differenceInHours(end, start);
    const breakHours = breakMinutes / 60;
    
    return Math.max(0, hoursDiff - breakHours);
  };

  const totalHours = calculateHours();
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedCaregiver) {
      toast.error("Please select a caregiver");
      return;
    }

    if (!startDate || !endDate || !startTime || !endTime) {
      toast.error("Please select start and end dates/times");
      return;
    }

    if (totalHours <= 0) {
      toast.error("Total hours must be greater than zero");
      return;
    }

    try {
      setIsLoading(true);
      
      // Create complete date objects with time
      const start = new Date(startDate);
      const [startHour, startMinute] = startTime.split(':').map(Number);
      start.setHours(startHour, startMinute, 0, 0);
      
      const end = new Date(endDate);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      end.setHours(endHour, endMinute, 0, 0);
      
      const workLogInput: WorkLogInput = {
        care_team_member_id: selectedCaregiver,
        care_plan_id: carePlanId,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        break_duration_minutes: breakMinutes,
        notes: notes.trim() || undefined
      };

      // Create the work log
      const { success, workLog, error } = await createWorkLog(workLogInput);
      
      if (!success || !workLog) {
        throw new Error(error || "Failed to create work log");
      }

      // Add expenses if any
      if (expenses.length > 0) {
        for (const expense of expenses) {
          const expenseInput: WorkLogExpenseInput = {
            work_log_id: workLog.id,
            category: expense.category,
            amount: expense.amount,
            description: expense.description
          };
          
          await addWorkLogExpense(expenseInput);
        }
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Submit Work Hours</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="caregiver">Caregiver</Label>
            <Select 
              value={selectedCaregiver} 
              onValueChange={setSelectedCaregiver} 
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Caregiver" />
              </SelectTrigger>
              <SelectContent>
                {careTeamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.professionalDetails?.full_name || "Unknown"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "MMM d, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

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
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "MMM d, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
              <div className="text-sm text-muted-foreground">Total: ${totalExpenses.toFixed(2)}</div>
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

            <Separator className="my-4" />

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

          <div className="bg-muted p-4 rounded">
            <div className="flex justify-between mb-1 font-medium">
              <span>Total Hours:</span>
              <span>{totalHours.toFixed(2)} hours</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Total Expenses:</span>
              <span>${totalExpenses.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
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
