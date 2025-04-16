
import { useState, useCallback } from 'react';
import { ChatMessage } from '@/types/chatTypes';

interface ChatTypingHookProps {
  addMessage: (message: ChatMessage) => void;
  syncMessagesToSupabase: (messages: ChatMessage[], sessionId: string, userRole?: string | null) => Promise<boolean>;
  messages: ChatMessage[];
  sessionId: string;
  role: string | null;
}

export const useChatTyping = ({
  addMessage,
  syncMessagesToSupabase,
  messages,
  sessionId,
  role
}: ChatTypingHookProps) => {
  const [isTyping, setIsTyping] = useState(false);
  
  // Simulate typing and send the message
  const simulateBotTyping = useCallback(async (message: string, options?: any[]) => {
    setIsTyping(true);
    
    // Calculate typing time based on message length
    // Between 500ms minimum and 2000ms maximum
    const typingTime = Math.min(2000, Math.max(500, message.length * 20));
    
    try {
      await new Promise(resolve => setTimeout(resolve, typingTime));
      
      const newMessage: ChatMessage = {
        content: message,
        isUser: false,
        timestamp: Date.now(),
        options
      };
      
      addMessage(newMessage);
      
      // Sync messages to Supabase
      await syncMessagesToSupabase([...messages, newMessage], sessionId, role);
      
      return true;
    } catch (err) {
      console.error('Error in bot typing simulation:', err);
      return false;
    } finally {
      setIsTyping(false);
    }
  }, [addMessage, messages, sessionId, role, syncMessagesToSupabase]);
  
  return { isTyping, simulateBotTyping };
};
