import { supabase } from '@/integrations/supabase/client';

type DocumentPrefix = 'QUOTE' | 'INV' | 'RECEIPT';

/**
 * Generate a sequential document number based on care_plans table count.
 * Format: PREFIX-YYMMDD-XXXXX (e.g., QUOTE-260411-00003)
 * Falls back to timestamp-based if DB query fails.
 */
export async function getNextDocumentNumber(prefix: DocumentPrefix): Promise<string> {
  const now = new Date();
  const dateStr = now.toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD

  try {
    const { count, error } = await supabase
      .from('care_plans')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    const nextNumber = ((count || 0) + 1).toString().padStart(5, '0');
    return `${prefix}-${dateStr}-${nextNumber}`;
  } catch {
    // Fallback to timestamp-based
    const fallback = Date.now().toString().slice(-6);
    return `${prefix}-${dateStr}-${fallback}`;
  }
}
