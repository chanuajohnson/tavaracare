
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cpdfmyemjrefnhddyrck.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwZGZteWVtanJlZm5oZGR5cmNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4MjcwODAsImV4cCI6MjA1NTQwMzA4MH0.9LwhYWSuTbiqvSGGPAT7nfz8IFZIgnNzYoa_hLQ_2PY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Environment utility functions
export const getCurrentEnvironment = () => {
  if (typeof window === 'undefined') return 'server';
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
    return 'development';
  }
  if (hostname.includes('lovableproject.com')) {
    return 'preview';
  }
  return 'production';
};

export const isDevelopment = () => getCurrentEnvironment() === 'development';
export const isProduction = () => getCurrentEnvironment() === 'production';

export const getEnvironmentInfo = () => {
  const env = getCurrentEnvironment();
  return {
    environment: env,
    supabaseUrl,
    isLocal: env === 'development'
  };
};

export const verifySchemaCompatibility = async () => {
  try {
    // Test basic table access
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      return {
        compatible: false,
        missingColumns: ['profiles table access failed'],
        error: error.message
      };
    }
    
    return {
      compatible: true,
      missingColumns: []
    };
  } catch (err: any) {
    return {
      compatible: false,
      missingColumns: ['schema verification failed'],
      error: err.message
    };
  }
};

export const resetAuthState = async () => {
  try {
    await supabase.auth.signOut();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const debugSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    return {
      connected: !error,
      error: error?.message,
      environment: getCurrentEnvironment()
    };
  } catch (err: any) {
    return {
      connected: false,
      error: err.message,
      environment: getCurrentEnvironment()
    };
  }
};
