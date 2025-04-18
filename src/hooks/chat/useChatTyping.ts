
import { useState } from 'react';
import { ChatOption } from '@/types/chatTypes';
import { toast } from 'sonner';

interface UseChatTypingProps {
  addMessage: (message: any) => void;
  syncMessagesToSupabase?: (messages: any[], sessionId: string, role?: string) => Promise<boolean | void>;
  messages: any[];
  sessionId?: string;
  role?: string;
}

export const useChatTyping = ({ 
  addMessage, 
  syncMessagesToSupabase, 
  messages,
  sessionId = '',
  role = ''
}: UseChatTypingProps) => {
  const [isTyping, setIsTyping] = useState(false);

  const simulateBotTyping = async (message: string, options?: ChatOption[]) => {
    if (!message) {
      console.error("Empty message provided to simulateBotTyping");
      toast.error("Unable to generate a response. Please try again.");
      return;
    }

    setIsTyping(true);
    
    try {
      // Calculate a realistic typing delay based on message length
      const baseDelay = 300;
      const charDelay = 10;
      const maxDelay = 1500;
      const delay = Math.min(baseDelay + message.length * charDelay, maxDelay);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      addMessage({
        content: message,
        isUser: false,
        timestamp: Date.now(),
        options: options
      });
      
      // Sync messages to Supabase
      if (syncMessagesToSupabase && sessionId) {
        try {
          await syncMessagesToSupabase(
            [...messages, { content: message, isUser: false, timestamp: Date.now() }], 
            sessionId,
            role
          );
        } catch (err) {
          console.error('Error syncing messages:', err);
        }
      }
    } catch (error) {
      console.error("Error in simulateBotTyping:", error);
      toast.error("An error occurred while processing the chat response");
    } finally {
      setIsTyping(false);
    }
  };

  return {
    isTyping,
    setIsTyping,
    simulateBotTyping
  };
};
