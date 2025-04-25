
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { WorkLogExpense } from '@/services/care-plans/types/workLogTypes';

interface WorkLogExpensesProps {
  expenses?: WorkLogExpense[];
}

export const WorkLogExpenses: React.FC<WorkLogExpensesProps> = ({ expenses = [] }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  if (expenses.length === 0) {
    return <span className="text-muted-foreground">No expenses</span>;
  }
  
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="link" className="p-0 h-auto">
          ${totalAmount.toFixed(2)} ({expenses.length} {expenses.length === 1 ? 'item' : 'items'})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Expense Details</DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="capitalize">
                  {expense.category.replace('_', ' ')}
                </TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell className="text-right">
                  ${expense.amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      expense.status === 'approved' 
                        ? 'success' 
                        : expense.status === 'rejected' 
                        ? 'destructive' 
                        : 'outline'
                    }
                  >
                    {expense.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={2} className="text-right font-semibold">
                Total
              </TableCell>
              <TableCell className="text-right font-semibold">
                ${totalAmount.toFixed(2)}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};
