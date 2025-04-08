
import { Database } from '@/integrations/supabase/types';
import { PostgrestError } from '@supabase/supabase-js';

// Define commonly used types from Supabase database
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// Re-export UserRole from the correct location
export type UserRole = 'family' | 'professional' | 'community' | 'admin';

// Define generic Table Row types from Database definition
export type Tables = Database['public']['Tables'];
export type TableName = keyof Tables;

// Generic types for database operations
export type DbResult<T> = {
  data: T | null;
  error: PostgrestError | null;
};

export type DbResultList<T> = {
  data: T[] | null;
  error: PostgrestError | null;
};
