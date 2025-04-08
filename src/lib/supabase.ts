
// This file is a compatibility layer that forwards to our standardized implementation
// Import the supabase client from the standard location
import { 
  supabase,
  getCurrentEnvironment, 
  isDevelopment, 
  isProduction, 
  getEnvironmentInfo, 
  verifySchemaCompatibility, 
  resetAuthState,
  debugSupabaseConnection
} from '@/integrations/supabase/client';
import { getOrCreateSessionId } from '@/utils/sessionHelper';
import { ExtendedDatabase } from '@/types/supabase-adapter';

// Create a function to get user role from the profiles table
export const getUserRole = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    
    if (error) {
      console.error('[getUserRole] Error fetching user role:', error);
      return null;
    }
    
    return profile?.role || null;
  } catch (err) {
    console.error('[getUserRole] Error:', err);
    return null;
  }
};

// Function to ensure auth context is valid
export const ensureAuthContext = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session?.user;
  } catch (err) {
    console.error('[ensureAuthContext] Error:', err);
    return false;
  }
};

// Function to ensure storage buckets exist
export const ensureStorageBuckets = async () => {
  // This is a placeholder - in real apps, you'd check or create storage buckets
  // This would typically be done via admin API, not client-side
  return true;
};

// Function to delete a user with cleanup
export const deleteUserWithCleanup = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // This would normally call the admin function
    const { error } = await supabase.rpc('admin_delete_user', {
      target_user_id: userId
    });
    
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('[deleteUserWithCleanup] Error:', err);
    return { success: false, error: err.message };
  }
};

// Initialize supabase function to verify connection on app start
export const initializeSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
      
    return !error;
  } catch (err) {
    console.error('[initializeSupabase] Error:', err);
    return false;
  }
};

// Check if supabase is experiencing issues
export const isSupabaseExperiencingIssues = () => {
  // This is a basic implementation - in a real app, you might
  // check for patterns of errors or use a dedicated status endpoint
  const recentErrors = localStorage.getItem('supabase_recent_errors');
  if (recentErrors) {
    const errors = JSON.parse(recentErrors);
    return errors.length > 3;  // If more than 3 recent errors, report issues
  }
  return false;
};

// Create enhanced client with session ID for anonymous users
export const enhancedSupabaseClient = () => {
  // Get the session ID for the current user
  const sessionId = getOrCreateSessionId();
  
  // Return the supabase client with the session ID set in the headers
  return {
    // Use registration_progress table through type casting
    registrationProgress: () => {
      return supabase.from('registration_progress') as unknown as ReturnType<typeof supabase.from<ExtendedDatabase['public']['Tables']['registration_progress']['Row']>>;
    },
    
    // Chat conversations table accessor
    chatbotConversations: () => {
      return supabase.from('chatbot_conversations') as unknown as ReturnType<typeof supabase.from<ExtendedDatabase['public']['Tables']['chatbot_conversations']['Row']>>;
    },
    
    // Chat messages table accessor
    chatbotMessages: () => {
      return supabase.from('chatbot_messages') as unknown as ReturnType<typeof supabase.from<ExtendedDatabase['public']['Tables']['chatbot_messages']['Row']>>;
    },
    
    // Return the standard client for other tables
    client: supabase
  };
};

// Create a function to set the session ID in request headers
export const withSessionId = () => {
  const sessionId = getOrCreateSessionId();
  
  return {
    headers: {
      'session_id': sessionId
    }
  };
};

// Re-export everything
export { 
  supabase, 
  getCurrentEnvironment,
  isDevelopment,
  isProduction, 
  getEnvironmentInfo,
  verifySchemaCompatibility, 
  resetAuthState,
  debugSupabaseConnection
};

// For backwards compatibility
export default supabase;
