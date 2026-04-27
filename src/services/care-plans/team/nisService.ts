import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * Update NIS registration status for a care team member
 */
export const updateNISRegistration = async (
  memberId: string,
  isRegistered: boolean
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('care_team_members')
      .update({ is_nis_registered: isRegistered })
      .eq('id', memberId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating NIS registration:", error);
    toast.error("Failed to update NIS registration status");
    return false;
  }
};

/**
 * Update NIS-related employee details (NIS number, DOB, date employed)
 */
export const updateEmployeeNISDetails = async (
  memberId: string,
  details: {
    nis_number?: string | null;
    date_of_birth?: string | null;
    date_employed?: string | null;
    is_nis_registered?: boolean;
  }
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('care_team_members')
      .update(details)
      .eq('id', memberId);

    if (error) throw error;
    toast.success("Employee NIS details updated");
    return true;
  } catch (error) {
    console.error("Error updating employee NIS details:", error);
    toast.error("Failed to update employee NIS details");
    return false;
  }
};

/**
 * Record a bank transfer for a payroll entry
 */
export const recordBankTransfer = async (
  payrollId: string,
  ref: string,
  date: Date,
  notes?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('payroll_entries')
      .update({
        bank_transfer_ref: ref,
        bank_transfer_date: date.toISOString(),
        bank_transfer_notes: notes || null,
      })
      .eq('id', payrollId);

    if (error) throw error;
    toast.success("Bank transfer recorded");
    return true;
  } catch (error) {
    console.error("Error recording bank transfer:", error);
    toast.error("Failed to record bank transfer");
    return false;
  }
};
