
import { createClient } from '@supabase/supabase-js';

// This is a placeholder setup - in a real application, you would use environment variables
const supabaseUrl = 'https://cpdfmyemjrefnhddyrck.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwZGZteWVtanJlZm5oZGR5cmNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4MjcwODAsImV4cCI6MjA1NTQwMzA4MH0.9LwhYWSuTbiqvSGGPAT7nfz8IFZIgnNzYoa_hLQ_2PY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Environment utility functions
export const getEnvironmentInfo = () => {
  // Extract the project ID from the URL if possible
  const projectIdMatch = supabaseUrl?.match(/https:\/\/(.+)\.supabase\.co/);
  const projectId = projectIdMatch ? projectIdMatch[1] : 'unknown';
  
  return {
    environment: process.env.NODE_ENV || 'development',
    supabaseUrl: projectId ? `${projectId}.supabase.co` : 'None set',
    projectId,
    usingFallbacks: false,
  };
};

// User deletion utility
export const deleteUserWithCleanup = async (userId: string) => {
  try {
    // In a real application, this would delete the user and clean up related data
    // For now, just a placeholder
    console.log(`Deleting user ${userId}`);
    const { error } = await supabase.auth.admin.deleteUser(userId);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
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

// Supabase initialization
export const initializeSupabase = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    return !error;
  } catch (error) {
    console.error('Failed to initialize Supabase:', error);
    return false;
  }
};

// Check if Supabase is experiencing issues
export const isSupabaseExperiencingIssues = () => {
  // This would be implemented with actual checks in a real app
  return false;
};

// Storage bucket functions
export const ensureStorageBuckets = async () => {
  // Placeholder function
  return { success: true };
};

// Auth context functions
export const ensureAuthContext = async () => {
  // Placeholder function
  return { success: true };
};
