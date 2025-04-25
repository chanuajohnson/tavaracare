import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from 'lucide-react';
import { PlusCircle } from 'lucide-react';
import type { ExpenseItem } from './types';

interface WorkLogExpenseFormProps {
  expenses: ExpenseItem[];
  newExpense: ExpenseItem;
  amountInput: string;
  onAmountChange: (value: string) => void;
  onExpenseChange: (expense: Partial<ExpenseItem>) => void;
  onAddExpense: () => void;
  onRemoveExpense: (index: number) => void;
}

export const WorkLogExpenseForm: React.FC<WorkLogExpenseFormProps> = ({
  expenses,
  newExpense,
  amountInput,
  onAmountChange,
  onExpenseChange,
  onAddExpense,
  onRemoveExpense
}) => {
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
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
                onClick={() => onRemoveExpense(index)}
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
              onExpenseChange({ category: value })
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
            type="text"
            value={amountInput}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div>
          <Label htmlFor="expenseDescription">Description</Label>
          <div className="flex">
            <Input
              id="expenseDescription"
              value={newExpense.description}
              onChange={(e) => 
                onExpenseChange({ description: e.target.value })
              }
              className="rounded-r-none"
            />
            <Button
              type="button"
              size="icon"
              onClick={onAddExpense}
              className="rounded-l-none"
            >
              <span className="sr-only">Add expense</span>
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
