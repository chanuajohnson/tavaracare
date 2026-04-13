import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { PayrollEntry } from "../types/workLogTypes";
import { resolveCaregiverNames } from "../utils/resolveCaregiveNames";

export const fetchPayrollEntries = async (carePlanId: string): Promise<PayrollEntry[]> => {
  try {
    const { data: entries, error } = await supabase
      .from('payroll_entries')
      .select(`
        *,
        care_team_members:care_team_member_id (
          caregiver_id,
          profiles!caregiver_id (
            full_name
          )
        )
      `)
      .eq('care_plan_id', carePlanId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    if (entries.length > 0) {
      // Build records for the shared resolver
      const records = entries.map(entry => ({
        caregiverId: entry.care_team_members?.caregiver_id || null,
        joinedName: entry.care_team_members?.profiles?.full_name || null,
      }));

      // Resolve names with RPC fallback for any that RLS blocked
      const nameMap = await resolveCaregiverNames(records);

      return entries.map(entry => {
        const caregiverId = entry.care_team_members?.caregiver_id;
        const resolvedName = caregiverId ? nameMap.get(caregiverId) : null;
        
        const validStatus: 'pending' | 'approved' | 'paid' = 
          ['pending', 'approved', 'paid'].includes(entry.payment_status) 
            ? entry.payment_status as 'pending' | 'approved' | 'paid'
            : 'pending';
            
        return {
          ...entry,
          caregiver_name: resolvedName || 'Unknown',
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
