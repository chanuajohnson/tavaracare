
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { WorkLogExpense } from "../types/workLogTypes";

export const addWorkLogExpense = async (expenseInput: Partial<WorkLogExpense>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('work_log_expenses')
      .insert({
        work_log_id: expenseInput.work_log_id,
        category: expenseInput.category,
        description: expenseInput.description,
        amount: expenseInput.amount,
        receipt_url: expenseInput.receipt_url,
        status: 'pending'
      });

    if (error) throw error;
    
    return true;
  } catch (error: any) {
    console.error("Error adding expense:", error);
    toast.error("Failed to add expense");
    return false;
  }
};

export const updateWorkLogExpenseStatus = async (
  expenseId: string,
  status: 'approved' | 'rejected'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('work_log_expenses')
      .update({ status })
      .eq('id', expenseId);

    if (error) throw error;
    
    toast.success(`Expense ${status === 'approved' ? 'approved' : 'rejected'}`);
    return true;
  } catch (error: any) {
    console.error(`Error ${status === 'approved' ? 'approving' : 'rejecting'} expense:`, error);
    toast.error(`Failed to ${status === 'approved' ? 'approve' : 'reject'} expense`);
    return false;
  }
};
