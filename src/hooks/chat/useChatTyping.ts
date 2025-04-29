
import { useState } from 'react';
import { ChatOption } from '@/types/chatTypes';
import { toast } from 'sonner';
import { isRepeatMessage, setLastMessage } from '@/utils/chat/engine/messageCache';

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
    console.log(`[simulateBotTyping] Called with message length: ${message?.length || 0}, options: ${options?.length || 0}`);
    
    if (!message) {
      console.error("[simulateBotTyping] Empty message provided to simulateBotTyping");
      toast.error("Unable to generate a response. Please try again.");
      return;
    }

    // Check if this message would be repetitive
    if (sessionId && isRepeatMessage(sessionId, message)) {
      console.log("[simulateBotTyping] Preventing repeat message:", message.substring(0, 50) + "...");
      return;
    }

    setIsTyping(true);
    
    try {
      // Calculate a realistic typing delay based on message length
      const baseDelay = 300;
      const charDelay = 10;
      const maxDelay = 1500;
      const delay = Math.min(baseDelay + message.length * charDelay, maxDelay);
      
      console.log(`[simulateBotTyping] Simulating typing for ${delay}ms for message: "${message.substring(0, 30)}..."`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Store the message in cache to prevent repetition
      if (sessionId) {
        setLastMessage(sessionId, message);
      }
      
      console.log(`[simulateBotTyping] Adding bot message to chat with ${options?.length || 0} options`);
      addMessage({
        content: message,
        isUser: false,
        timestamp: Date.now(),
        options: options
      });
      
      // Sync messages to Supabase
      if (syncMessagesToSupabase && sessionId) {
        try {
          console.log(`[simulateBotTyping] Syncing messages to Supabase`);
          await syncMessagesToSupabase(
            [...messages, { content: message, isUser: false, timestamp: Date.now() }], 
            sessionId,
            role
          );
        } catch (err) {
          console.error('[simulateBotTyping] Error syncing messages:', err);
        }
      }
    } catch (error) {
      console.error("[simulateBotTyping] Error in simulateBotTyping:", error);
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
