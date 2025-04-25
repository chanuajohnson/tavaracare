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
        // Enhanced name resolution logic with better error handling
        let displayName = 'Unknown';
        
        try {
          if (entry.care_team_members?.display_name) {
            displayName = entry.care_team_members.display_name;
            console.log(`Using display_name: ${displayName} for entry ${entry.id}`);
          } else if (entry.care_team_members?.caregiver_id) {
            // Direct ID fallback instead of trying to access nested profile
            displayName = `Member: ${entry.care_team_members.caregiver_id.substring(0, 8)}`;
            console.log(`Using caregiver ID: ${displayName} for entry ${entry.id}`);
          } else if (entry.care_team_member_id) {
            displayName = `Member: ${entry.care_team_member_id.substring(0, 8)}`;
            console.log(`Using fallback ID: ${displayName} for entry ${entry.id}`);
          }
        } catch (err) {
          console.error('Error resolving display name:', err);
        }

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
