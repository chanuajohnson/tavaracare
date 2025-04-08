
import { Database } from '@/integrations/supabase/types';
import { RegistrationProgress } from '@/types/registration';
import { adaptFromDb, adaptToDb } from './adapter-utils';

// Type definition for database table
export type DbRegistrationProgress = Database['public']['Tables']['registration_progress']['Row'];

/**
 * Adapter for converting database registration progress to frontend format
 */
export function adaptRegistrationProgress(dbProgress: DbRegistrationProgress): RegistrationProgress {
  return adaptFromDb<RegistrationProgress>(dbProgress);
}

/**
 * Adapter for converting frontend registration progress to database format
 */
export function adaptRegistrationProgressToDb(progress: Partial<RegistrationProgress>): Partial<DbRegistrationProgress> {
  return adaptToDb<Partial<DbRegistrationProgress>>(progress);
}
