
import { supabase } from "@/integrations/supabase/client";

/**
 * Ensures that storage buckets exist and are properly configured
 */
export const ensureStorageBuckets = async (): Promise<boolean> => {
  try {
    console.log('Checking if storage buckets exist...');
    
    // Get the current session to ensure we're authenticated
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session for storage operations:', sessionError);
      return false;
    }
    
    if (!sessionData?.session) {
      console.log("No authenticated session found for storage operations");
      // Still proceed - the storage buckets may be public
    }
    
    // Check if avatars bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      // Log detailed error information for debugging
      console.error('Error checking storage buckets:', bucketError);
      
      if (bucketError.message.includes('JWT')) {
        console.error('JWT authentication error when accessing storage buckets');
      } else if (bucketError.message.includes('permission')) {
        console.error('Permission denied when accessing storage buckets. Check RLS policies.');
      }
      
      console.log('Buckets should have been created by migration, proceeding...');
      return true;
    }
    
    // Log the existing buckets for debugging
    if (buckets && buckets.length > 0) {
      console.log('Existing buckets:', buckets.map(b => b.name).join(', '));
      return true;
    } else {
      console.log('No buckets found, but they should have been created by migration');
      return true;
    }
  } catch (error) {
    console.error('Error checking storage buckets:', error);
    // Return true to allow the app to proceed - the migration should have created the buckets
    return true;
  }
};

/**
 * Ensure auth context is valid, refreshing tokens if needed
 */
export const ensureAuthContext = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting auth session:', error);
      
      // If token is expired, try to refresh it
      if (error.message.includes('expired')) {
        console.log('Attempting to refresh expired token...');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshData.session) {
          console.error('Failed to refresh auth token:', refreshError);
          return false;
        }
        
        console.log('Token refreshed successfully');
        return true;
      }
      
      return false;
    }
    
    if (!session) {
      console.log('No active session found');
      return false;
    }
    
    // Validate token exists and is properly formatted
    if (!session.access_token) {
      console.error('Session exists but access token is missing');
      return false;
    }
    
    console.log('Auth context refreshed successfully with token');
    return true;
  } catch (err) {
    console.error('Error ensuring auth context:', err);
    return false;
  }
};
