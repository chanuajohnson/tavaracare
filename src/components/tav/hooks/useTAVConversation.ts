
import { useState, useCallback } from 'react';
import { TAVMessage, TAVAIService, TAVConversationContext } from '../services/tavAIService';
import { v4 as uuidv4 } from 'uuid';
import { realTimeCallbackService } from '@/services/realTimeCallbackService';
import { useTavaraState } from './TavaraStateContext';

export const useTAVConversation = (
  context: TAVConversationContext, 
  onRealTimeDataUpdate?: (message: string, isUser: boolean) => void
) => {
  const [messages, setMessages] = useState<TAVMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const aiService = TAVAIService.getInstance();
  const { emitRealTimeMessage } = useTavaraState();

  const addMessage = useCallback((content: string, isUser: boolean): TAVMessage => {
    const message: TAVMessage = {
      id: uuidv4(),
      content,
      isUser,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, message]);
    
    // Emit to new real-time message bus
    emitRealTimeMessage({ 
      text: content, 
      isFinal: true,
      meta: { isUser, messageId: message.id }
    });
    
    // Trigger real-time data extraction - try props callback first, then global service
    if (onRealTimeDataUpdate) {
      console.warn('🔗 [useTAVConversation] Calling onRealTimeDataUpdate:', { content, isUser });
      // CRITICAL ADDRESS DEBUG
      if (content.toLowerCase().includes('address') || content.toLowerCase().includes('calcutta')) {
        console.error('🏠 [useTAVConversation] ADDRESS-RELATED MESSAGE DETECTED:', content);
      }
      onRealTimeDataUpdate(content, isUser);
    } else if (realTimeCallbackService.hasCallback()) {
      console.warn('🔗 [useTAVConversation] Using global callback service:', { content, isUser });
      // CRITICAL ADDRESS DEBUG
      if (content.toLowerCase().includes('address') || content.toLowerCase().includes('calcutta')) {
        console.error('🏠 [useTAVConversation] ADDRESS-RELATED MESSAGE DETECTED (global):', content);
      }
      realTimeCallbackService.executeCallback(content, isUser);
    } else {
      console.warn('🔗 [useTAVConversation] No callback available (props or global)');
    }
    
    return message;
  }, [onRealTimeDataUpdate, emitRealTimeMessage]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    addMessage(content, true);
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Simulate realistic typing delay
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
      
      // Get AI response
      const response = await aiService.sendMessage(content, context, messages);
      
      // Add AI response
      addMessage(response, false);
    } catch (error) {
      console.error('Error sending TAV message:', error);
      addMessage("💙 Sorry, I'm having trouble connecting right now. Please try again.", false);
    } finally {
      setIsTyping(false);
    }
  }, [context, messages, addMessage, aiService]);

  const clearConversation = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
    clearConversation
  };
};
