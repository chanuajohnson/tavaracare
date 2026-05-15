import { supabase } from "@/lib/supabase";

export type PaymentLineItem = {
  label: string;
  amount: number;
  category?: 'caregiver_care' | 'subscription' | 'nis_registration' | 'coordination' | 'other' | string;
};

export interface FamilyPaymentRecord {
  id: string;
  family_user_id: string;
  care_plan_id: string | null;
  paid_date: string;
  period_start: string | null;
  period_end: string | null;
  total_amount: number;
  currency: string;
  line_items: PaymentLineItem[];
  notes: string | null;
  is_milestone: boolean;
  receipt_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface FamilyPaymentInput {
  family_user_id: string;
  care_plan_id?: string | null;
  paid_date: string;
  period_start?: string | null;
  period_end?: string | null;
  total_amount: number;
  currency?: string;
  line_items: PaymentLineItem[];
  notes?: string | null;
}

export const fetchFamilyPaymentRecords = async (
  familyUserId: string,
  carePlanId?: string | null
): Promise<FamilyPaymentRecord[]> => {
  let q = supabase
    .from('family_payment_records')
    .select('*')
    .eq('family_user_id', familyUserId)
    .order('paid_date', { ascending: true });
  if (carePlanId) q = q.eq('care_plan_id', carePlanId);
  const { data, error } = await q;
  if (error) {
    console.error('fetchFamilyPaymentRecords error', error);
    return [];
  }
  return (data || []) as unknown as FamilyPaymentRecord[];
};

export const createFamilyPaymentRecord = async (
  input: FamilyPaymentInput
): Promise<FamilyPaymentRecord | null> => {
  const { data: userRes } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('family_payment_records')
    .insert({
      ...input,
      currency: input.currency || 'TTD',
      created_by: userRes?.user?.id || null,
    } as any)
    .select('*')
    .single();
  if (error) {
    console.error('createFamilyPaymentRecord error', error);
    throw error;
  }
  return data as unknown as FamilyPaymentRecord;
};

export const deleteFamilyPaymentRecord = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('family_payment_records').delete().eq('id', id);
  if (error) {
    console.error('deleteFamilyPaymentRecord error', error);
    return false;
  }
  return true;
};
