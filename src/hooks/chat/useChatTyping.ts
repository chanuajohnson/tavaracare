
import { useState } from 'react';
import { ChatOption } from '@/types/chatTypes';
import { toast } from 'sonner';
import { 
  isRepeatMessage, 
  setLastMessage, 
  startProcessingMessage,
  finishProcessingMessage 
} from '@/utils/chat/engine/messageCache';
import { getRegistrationFlowByRole } from '@/data/chatRegistrationFlows';

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

    // If this is a role selection follow-up question, always allow it through
    const isFirstQuestion = message.includes("Let's get started");
    
    // If this is the first question after role selection, add time expectation
    if (isFirstQuestion && role) {
      try {
        const flow = getRegistrationFlowByRole(role);
        const totalSections = flow.sections.length;
        let totalQuestions = 0;
        
        flow.sections.forEach(section => {
          totalQuestions += section.questions.length;
        });
        
        // Estimate completion time (1 minute per 3 questions)
        const estimatedMinutes = Math.max(Math.ceil(totalQuestions / 3), 2);
        
        // Add time estimation and section information to the first message
        message = `Great! Let's get started. This will take about ${estimatedMinutes} minutes to complete across ${totalSections} sections. We'll guide you through each step.\n\n${message.replace("Great! Let's get started. ", "")}`;
      } catch (error) {
        console.error("[simulateBotTyping] Error adding time estimation:", error);
      }
    }
    
    // Mark that we're starting to process this message to avoid immediate deduplication
    if (sessionId) {
      startProcessingMessage(sessionId);
    }
    
    // Check if this message would be repetitive, unless it's a first question
    if (sessionId && !isFirstQuestion && isRepeatMessage(sessionId, message)) {
      console.log("[simulateBotTyping] Preventing repeat message:", message.substring(0, 50) + "...");
      finishProcessingMessage(sessionId);
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
        finishProcessingMessage(sessionId);
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
      if (sessionId) {
        finishProcessingMessage(sessionId);
      }
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
