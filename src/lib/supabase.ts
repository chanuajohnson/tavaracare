
// This file is a compatibility layer that forwards to our standardized implementation
// Import the supabase client from the standard location
import { supabase, getCurrentEnvironment, isDevelopment, isProduction, getEnvironmentInfo, verifySchemaCompatibility, resetAuthState } from '@/integrations/supabase/client';

// Re-export everything
export { 
  supabase, 
  getCurrentEnvironment,
  isDevelopment,
  isProduction, 
  getEnvironmentInfo,
  verifySchemaCompatibility, 
  resetAuthState
};

// For backwards compatibility
export default supabase;
