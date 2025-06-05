
import { useState, useCallback } from 'react';
import { TAVMessage, TAVAIService, TAVConversationContext } from '../services/tavAIService';
import { v4 as uuidv4 } from 'uuid';

export const useTAVConversation = (context: TAVConversationContext) => {
  const [messages, setMessages] = useState<TAVMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const aiService = TAVAIService.getInstance();

  const addMessage = useCallback((content: string, isUser: boolean): TAVMessage => {
    const message: TAVMessage = {
      id: uuidv4(),
      content,
      isUser,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, message]);
    return message;
  }, []);

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
