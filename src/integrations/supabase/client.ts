import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use environment variables from .env files
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const CURRENT_ENV = import.meta.env.VITE_ENV || 'development';

// Improved error handling for Supabase initialization
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(`
    ⚠️ Missing Supabase Credentials ⚠️
    
    Required environment variables not found:
    ${!SUPABASE_URL ? '- VITE_SUPABASE_URL' : ''}
    ${!SUPABASE_ANON_KEY ? '- VITE_SUPABASE_ANON_KEY' : ''}
    
    Troubleshooting Steps:
    1. Check .env.development and .env.production files
    2. Verify Lovable project environment variables
    3. Confirm GitHub secrets are correctly configured
  `);
}

// Fallback values for development (optional)
const developmentFallbackUrl = 'https://cpdfmyemjrefnhddyrck.supabase.co';
const developmentFallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwZGZteWVtanJlZm5oZGR5cmNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4MjcwODAsImV4cCI6MjA1NTQwMzA4MH0.9LwhYWSuTbiqvSGGPAT7nfz8IFZIgnNzYoa_hLQ_2PY';

const finalSupabaseUrl = SUPABASE_URL || (CURRENT_ENV === 'development' ? developmentFallbackUrl : '');
const finalSupabaseKey = SUPABASE_ANON_KEY || (CURRENT_ENV === 'development' ? developmentFallbackKey : '');

// Create the Supabase client with modified auth config
export const supabase = createClient<Database>(
  finalSupabaseUrl,
  finalSupabaseKey, 
  {
    auth: {
      detectSessionInUrl: true, // Enable automatic token handling
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'x-client-env': CURRENT_ENV,
        'x-app-version': '1.0',
      },
    },
  }
);

// Environment utility functions
export const getCurrentEnvironment = (): string => {
  return CURRENT_ENV;
};

export const isDevelopment = (): boolean => {
  return CURRENT_ENV === 'development';
};

export const isProduction = (): boolean => {
  return CURRENT_ENV === 'production';
};

export const getEnvironmentInfo = () => {
  // Extract the project ID from the URL if possible
  const projectIdMatch = finalSupabaseUrl?.match(/https:\/\/(.+)\.supabase\.co/);
  const projectId = projectIdMatch ? projectIdMatch[1] : 'unknown';
  
  return {
    environment: CURRENT_ENV,
    supabaseUrl: finalSupabaseUrl ? `${projectId}.supabase.co` : 'None set',
    projectId,
    usingFallbacks: !SUPABASE_URL || !SUPABASE_ANON_KEY,
  };
};

// Schema compatibility check
export const verifySchemaCompatibility = async () => {
  try {
    // Basic check - try to query the profiles table
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    // Add more detailed schema compatibility checks here as needed
    const missingColumns: string[] = [];
    
    return {
      compatible: !error,
      missingColumns,
      error: error?.message
    };
  } catch (err: any) {
    console.error('Error verifying schema compatibility:', err.message);
    return {
      compatible: false,
      missingColumns: [],
      error: err.message
    };
  }
};

// Auth state management
export const resetAuthState = async () => {
  try {
    await supabase.auth.signOut();
    localStorage.removeItem('supabase.auth.token');
    return { success: true };
  } catch (error) {
    console.error('Error resetting auth state:', error);
    return { success: false, error };
  }
};

// Debug connection utility
export const debugSupabaseConnection = async () => {
  try {
    // Check basic connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Connection error:', error);
      return {
        connected: false,
        message: error.message,
        details: error,
        timestamp: new Date().toISOString()
      };
    }
    
    // If we get here, connection is working
    return {
      connected: true,
      message: 'Successfully connected to Supabase',
      environmentInfo: getEnvironmentInfo(),
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.error('Unexpected error during connection check:', err);
    return {
      connected: false,
      message: err instanceof Error ? err.message : 'Unknown error',
      details: err,
      timestamp: new Date().toISOString()
    };
  }
};

// Logging environment details
console.log(`Supabase Initialization Details:`);
console.log(`- Environment: ${CURRENT_ENV}`);
console.log(`- Supabase URL: ${finalSupabaseUrl ? '[MASKED]' : 'UNDEFINED'}`);
console.log(`- Using Fallback Credentials: ${!SUPABASE_URL || !SUPABASE_ANON_KEY}`);

export default supabase;
