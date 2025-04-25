import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { PayrollEntry } from "../types/workLogTypes";

export const fetchPayrollEntries = async (carePlanId: string): Promise<PayrollEntry[]> => {
  try {
    console.log("Fetching payroll entries for care plan:", carePlanId);
    const { data: entries, error } = await supabase
      .from('payroll_entries')
      .select(`
        *,
        care_team_members:care_team_member_id (
          display_name,
          caregiver_id,
          profiles:caregiver_id (
            full_name,
            professional_type
          )
        )
      `)
      .eq('care_plan_id', carePlanId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    console.log("Raw payroll entries data:", entries);
    
    if (entries.length > 0) {
      return entries.map(entry => {        
        // Enhanced name resolution logic
        const displayName = 
          entry.care_team_members?.display_name || 
          entry.care_team_members?.profiles?.full_name ||
          'Unknown';

        console.log("Resolved display name for entry:", {
          entryId: entry.id,
          displayName,
          teamMember: entry.care_team_members
        });

        return {
          ...entry,
          caregiver_name: displayName,
          caregiver_id: entry.care_team_members?.caregiver_id || '',
          payment_status: ['pending', 'approved', 'paid'].includes(entry.payment_status) 
            ? entry.payment_status as 'pending' | 'approved' | 'paid'
            : 'pending'
        };
      });
    }
    
    return [] as PayrollEntry[];
  } catch (error) {
    console.error("Error fetching payroll entries:", error);
    toast.error("Failed to load payroll entries");
    return [];
  }
};

export const processPayrollPayment = async (payrollId: string, paymentDate = new Date()): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('payroll_entries')
      .update({ 
        payment_status: 'paid',
        payment_date: paymentDate.toISOString()
      })
      .eq('id', payrollId);

    if (error) throw error;
    toast.success("Payment processed successfully");
    return true;
  } catch (error) {
    console.error("Error processing payroll payment:", error);
    toast.error("Failed to process payment");
    return false;
  }
};
