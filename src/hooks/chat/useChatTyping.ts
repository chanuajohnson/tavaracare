
import { useState, useCallback } from 'react';
import { ChatMessage, ChatOption } from '@/types/chatTypes';

interface UseChatTypingProps {
  addMessage: (message: ChatMessage) => void;
  messages: ChatMessage[];
  sessionId: string;
  role?: string | null;
  syncMessagesToSupabase?: (messages: ChatMessage[]) => Promise<void>;
}

export const useChatTyping = ({ 
  addMessage, 
  messages, 
  sessionId,
  role,
  syncMessagesToSupabase
}: UseChatTypingProps) => {
  const [isTyping, setIsTyping] = useState(false);
  
  /**
   * Simulate bot typing and then add a message
   */
  const simulateBotTyping = useCallback(async (
    message: string, 
    options?: ChatOption[]
  ): Promise<void> => {
    if (!message) return;
    
    setIsTyping(true);
    
    // Calculate typing delay based on message length
    // Between 500ms and 2000ms
    const typingDelay = Math.min(Math.max(message.length * 20, 500), 2000);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const botMessage: ChatMessage = {
          content: message,
          isUser: false,
          timestamp: Date.now(),
          options
        };
        
        addMessage(botMessage);
        setIsTyping(false);
        
        // Optional: Sync messages to backend
        if (syncMessagesToSupabase) {
          syncMessagesToSupabase([...messages, botMessage])
            .catch(err => console.error('Error syncing messages:', err));
        }
        
        resolve();
      }, typingDelay);
    });
  }, [addMessage, messages, syncMessagesToSupabase]);
  
  return { isTyping, simulateBotTyping };
};
