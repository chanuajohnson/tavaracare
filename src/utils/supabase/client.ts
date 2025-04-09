
import { supabase as originalClient } from '@/lib/supabase';

// Re-export the original client for compatibility
export const supabase = originalClient;

// Helper to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return Boolean(url && key && url !== 'UNDEFINED...' && key !== 'UNDEFINED...');
}

// Function to check database connection
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    return !error;
  } catch (e) {
    console.error('Error testing database connection:', e);
    return false;
  }
}
