
import { useEffect, useState } from 'react';
import { getOrCreateSessionId } from '@/services/chatbot/sessionIdService';
import { initializeConversation } from '@/services/chatbot/conversationService';
import { ChatbotConversation } from '@/types/chatbotTypes';
import { isSupabaseConfigured, testDatabaseConnection } from '@/utils/supabase/client';

export function useChatSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ChatbotConversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbConnectionChecked, setDbConnectionChecked] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    async function checkDbConnection() {
      if (!isSupabaseConfigured()) {
        setError('Missing Supabase credentials. Please check your environment variables.');
        setLoading(false);
        setDbConnectionChecked(true);
        return false;
      }
      
      const isConnected = await testDatabaseConnection();
      if (!isConnected && isMounted) {
        setError('Could not connect to the database. Database tables may not exist yet.');
        setLoading(false);
      }
      
      if (isMounted) {
        setDbConnectionChecked(true);
      }
      
      return isConnected;
    }
    
    async function init() {
      try {
        setLoading(true);
        
        // First check database connection
        const isConnected = await checkDbConnection();
        if (!isConnected) return;
        
        // Then get or create session ID
        const id = await getOrCreateSessionId();
        if (isMounted) {
          setSessionId(id);
        }
        
        if (id && isMounted) {
          try {
            const conv = await initializeConversation(id);
            if (conv && isMounted) {
              setConversation(conv);
            }
          } catch (convError) {
            console.warn('Could not initialize conversation:', convError);
            if (isMounted) {
              setError('Could not initialize conversation. Database tables may not exist yet.');
            }
          }
        }
      } catch (e) {
        console.error('Error initializing chat session:', e);
        if (isMounted) {
          setError('Failed to initialize chat session');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    init();
    
    return () => {
      isMounted = false;
    };
  }, []);

  return { 
    sessionId, 
    conversation,
    loading, 
    error,
    dbConnectionChecked
  };
}
