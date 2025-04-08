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
import { 
  adaptChatbotMessage, 
  adaptChatbotMessageToDb, 
  adaptChatbotConversation, 
  adaptChatbotConversationToDb,
  adaptRegistrationProgress,
  adaptRegistrationProgressToDb,
  DbChatbotConversation,
  DbChatbotMessage,
  DbRegistrationProgress
} from '@/lib/supabase-adapter';
import {
  validateChatbotMessage,
  isChatbotMessage,
  isChatbotConversation,
  isRegistrationProgress,
  safeChatbotMessage
} from '@/lib/type-validation';
import { ChatbotMessage, ChatbotConversation } from '@/types/chatbot';
import { RegistrationProgress } from '@/types/registration';
import { PostgrestFilterBuilder, PostgrestQueryBuilder } from '@supabase/postgrest-js';

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
    // Type-safe registration progress table accessor
    registrationProgress: () => {
      return {
        // Keep standard query methods
        ...supabase.from('registration_progress'),
        
        // Enhanced insert
        async insert(data: Partial<RegistrationProgress>) {
          const dbData = adaptRegistrationProgressToDb(data);
          return await supabase.from('registration_progress').insert(dbData);
        },
        
        // Enhanced update
        async update(data: Partial<RegistrationProgress>) {
          const dbData = adaptRegistrationProgressToDb(data);
          return await supabase.from('registration_progress').update(dbData);
        },
        
        // Enhanced select with proper typing
        async select(query: string) {
          const response = await supabase
            .from('registration_progress')
            .select(query);
            
          if (response.error) {
            return { data: null, error: response.error };
          }
          
          if (!response.data) {
            return { data: null, error: null };
          }
          
          const typedData = response.data.map(item => 
            adaptRegistrationProgress(item as unknown as DbRegistrationProgress)
          );
          
          return { 
            data: typedData, 
            error: null 
          };
        }
      };
    },
    
    // Type-safe chatbot conversations table accessor
    chatbotConversations: () => {
      return {
        // Keep standard query methods
        ...supabase.from('chatbot_conversations'),
        
        // Enhanced insert
        async insert(data: Partial<ChatbotConversation>) {
          const dbData = adaptChatbotConversationToDb(data);
          return await supabase.from('chatbot_conversations').insert(dbData);
        },
        
        // Enhanced update
        async update(data: Partial<ChatbotConversation>) {
          const dbData = adaptChatbotConversationToDb(data);
          return await supabase.from('chatbot_conversations').update(dbData);
        },
        
        // Enhanced select with proper typing
        async select(query: string) {
          const response = await supabase
            .from('chatbot_conversations')
            .select(query);
            
          if (response.error) {
            return { data: null, error: response.error };
          }
          
          if (!response.data) {
            return { data: null, error: null };
          }
          
          const typedData = response.data.map(item => 
            adaptChatbotConversation(item as unknown as DbChatbotConversation)
          );
          
          return { 
            data: typedData, 
            error: null 
          };
        }
      };
    },
    
    // Type-safe chatbot messages table accessor
    chatbotMessages: () => {
      return {
        // Keep standard query methods
        ...supabase.from('chatbot_messages'),
        
        // Enhanced insert
        async insert(data: Partial<ChatbotMessage>) {
          const dbData = adaptChatbotMessageToDb(data);
          return await supabase.from('chatbot_messages').insert(dbData);
        },
        
        // Enhanced update
        async update(data: Partial<ChatbotMessage>) {
          const dbData = adaptChatbotMessageToDb(data);
          return await supabase.from('chatbot_messages').update(dbData);
        },
        
        // Enhanced select with proper typing
        async select(query: string) {
          const response = await supabase
            .from('chatbot_messages')
            .select(query);
            
          if (response.error) {
            return { data: null, error: response.error };
          }
          
          if (!response.data) {
            return { data: null, error: null };
          }
          
          const typedData = response.data.map(item => 
            adaptChatbotMessage(item as unknown as DbChatbotMessage)
          );
          
          return { 
            data: typedData, 
            error: null 
          };
        }
      };
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
