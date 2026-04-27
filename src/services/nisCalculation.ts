import { supabase } from "@/lib/supabase";

export interface NISCalculationResult {
  nis_applicable: boolean;
  weekly_earnings: number;
  nis_class: string | null;
  employee_contribution: number;
  employer_contribution: number;
  gross_pay: number;
  net_pay_after_nis: number;
}

/**
 * Calculate NIS contributions via the secure edge function proxy.
 * Can accept either weekly_earnings directly, or hourly_rate + hours_worked.
 */
export const calculateNIS = async (params: {
  weekly_earnings?: number;
  hourly_rate?: number;
  hours_worked?: number;
}): Promise<NISCalculationResult> => {
  const { data, error } = await supabase.functions.invoke('nis-payroll-proxy', {
    body: {
      action: 'calculate-nis',
      ...params,
    },
  });

  if (error) {
    console.error('NIS calculation error:', error);
    throw new Error(`NIS calculation failed: ${error.message}`);
  }

  return data as NISCalculationResult;
};

/**
 * Get the full NIS class lookup table.
 */
export const getNISClasses = async () => {
  const { data, error } = await supabase.functions.invoke('nis-payroll-proxy', {
    body: { action: 'get-nis-classes' },
  });

  if (error) {
    console.error('NIS classes fetch error:', error);
    throw new Error(`Failed to fetch NIS classes: ${error.message}`);
  }

  return data;
};
