
import { useState } from 'react';
import { ChatOption } from '@/types/chatTypes';

interface UseChatTypingProps {
  addMessage: (message: any) => void;
  syncMessagesToSupabase?: (messages: any[], sessionId: string, role?: string) => Promise<void>;
  messages: any[];
}

export const useChatTyping = ({ addMessage, syncMessagesToSupabase, messages }: UseChatTypingProps) => {
  const [isTyping, setIsTyping] = useState(false);

  const simulateBotTyping = async (message: string, options?: ChatOption[]) => {
    setIsTyping(true);
    
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
    
    setIsTyping(false);
    
    if (syncMessagesToSupabase) {
      syncMessagesToSupabase(
        [...messages, { content: message, isUser: false, timestamp: Date.now() }], 
        sessionId,
        role
      ).catch(err => console.error('Error syncing messages:', err));
    }
  };

  return {
    isTyping,
    setIsTyping,
    simulateBotTyping
  };
};
