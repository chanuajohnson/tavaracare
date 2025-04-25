
import { useState } from 'react';
import { toast } from "sonner";
import { createWorkLogFromShift, addWorkLogExpense } from "@/services/care-plans/work-logs";
import { format } from 'date-fns';
import type { CareShift } from "@/types/careTypes";
import type { ExpenseItem } from '@/components/care-plan/work-logs/types';
import type { WorkLogExpenseInput } from '@/services/care-plans/types/workLogTypes';

export const useWorkLogForm = (
  carePlanId: string,
  shift: CareShift,
  onSuccess: () => void
) => {
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

  const handleExpenseChange = (expenseData: Partial<ExpenseItem>) => {
    setNewExpense(prevExpense => ({
      ...prevExpense,
      ...expenseData
    }));
  };

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

  return {
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
    handleExpenseChange,
    handleAmountChange,
    handleAddExpense,
    handleSubmit
  };
};
