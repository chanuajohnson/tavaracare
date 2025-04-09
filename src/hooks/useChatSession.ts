
import { useEffect, useState } from 'react';
import { getOrCreateSessionId } from '@/services/chatbot/sessionIdService';
import { initializeConversation } from '@/services/chatbot/conversationService';
import { ChatbotConversation } from '@/types/chatbotTypes';

export function useChatSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ChatbotConversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const id = await getOrCreateSessionId();
        setSessionId(id);
        
        if (id) {
          try {
            const conv = await initializeConversation(id);
            if (conv) {
              setConversation(conv);
            }
          } catch (convError) {
            console.warn('Could not initialize conversation. Database tables may not exist yet:', convError);
            // Don't set an error state here - we'll just show the chat without conversation history
          }
        }
      } catch (e) {
        console.error('Error initializing chat session:', e);
        setError('Failed to initialize chat session');
      } finally {
        setLoading(false);
      }
    }
    
    init();
  }, []);

  return { 
    sessionId, 
    conversation,
    loading, 
    error
  };
}
