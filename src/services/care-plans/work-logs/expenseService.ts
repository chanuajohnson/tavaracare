
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { WorkLogExpense, WorkLogExpenseInput } from "../types/workLogTypes";

export const fetchWorkLogExpenses = async (workLogId: string): Promise<WorkLogExpense[]> => {
  try {
    const { data, error } = await supabase
      .from('work_log_expenses')
      .select('*')
      .eq('work_log_id', workLogId);
      
    if (error) throw error;
    return data as WorkLogExpense[];
  } catch (error) {
    console.error("Error fetching work log expenses:", error);
    return [];
  }
};

export const addWorkLogExpense = async (expenseInput: WorkLogExpenseInput): Promise<{ success: boolean; expense?: WorkLogExpense; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('work_log_expenses')
      .insert(expenseInput)
      .select()
      .single();
      
    if (error) throw error;
    
    toast.success("Expense added successfully");
    return { success: true, expense: data as WorkLogExpense };
  } catch (error: any) {
    console.error("Error adding work log expense:", error);
    toast.error("Failed to add expense");
    return { success: false, error: error.message };
  }
};
