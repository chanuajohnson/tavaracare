import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { PayrollEntry } from "../types/workLogTypes";

export const fetchPayrollEntries = async (carePlanId: string): Promise<PayrollEntry[]> => {
  try {
    const { data: entries, error } = await supabase
      .from('payroll_entries')
      .select(`
        *,
        care_team_members:care_team_member_id (
          caregiver_id,
          profiles:caregiver_id (
            full_name
          )
        )
      `)
      .eq('care_plan_id', carePlanId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    if (entries.length > 0) {
      const caregiverIds = entries
        .map(entry => entry.care_team_members?.caregiver_id)
        .filter(Boolean);

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', caregiverIds);

      if (profilesError) throw profilesError;

      return entries.map(entry => {
        const caregiverId = entry.care_team_members?.caregiver_id;
        const profile = profiles?.find(p => p.id === caregiverId);
        
        // Ensure the payment_status is one of the allowed values
        const validStatus: 'pending' | 'approved' | 'paid' = 
          ['pending', 'approved', 'paid'].includes(entry.payment_status) 
            ? entry.payment_status as 'pending' | 'approved' | 'paid'
            : 'pending';
            
        return {
          ...entry,
          caregiver_name: profile?.full_name || 'Unknown',
          payment_status: validStatus
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
