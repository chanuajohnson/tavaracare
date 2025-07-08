
/**
 * Shared types for admin components
 */

export interface UserJourneyProgress {
  id: string;
  user_id: string;
  role: string;
  current_step: number;
  total_steps: number;
  completion_percentage: number;
  last_activity_at: string;
  completed_steps: any;
  created_at: string;
  updated_at: string;
}

export interface UserWithProgress {
  id: string;
  email: string;
  full_name: string;
  role: 'family' | 'professional' | 'community' | 'admin';
  email_verified: boolean;
  last_login_at: string;
  created_at: string;
  avatar_url?: string;
  journey_progress?: UserJourneyProgress;
  onboarding_progress?: any;
  location?: string;
  phone_number?: string;
  professional_type?: string;
  years_of_experience?: string;
  care_types?: string[];
  specialized_care?: string[];
  available_for_matching?: boolean;
}

// Alias for compatibility with BulkActionPanel
export interface AdminUserWithProgress extends UserWithProgress {}

export interface RoleStats {
  total: number;
  verified: number;
  active: number;
  stalled: number;
}
