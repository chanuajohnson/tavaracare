import { useState, useCallback, useEffect } from 'react';
import { CoreTAVMessage, CoreConversationContext } from '../types/core';
import { CoreTAVService } from '../services/CoreTAVService';
import { DemoAnalyticsService } from '../services/DemoAnalyticsService';
import { v4 as uuidv4 } from 'uuid';

export const useCoreConversation = (context: CoreConversationContext) => {
  const [messages, setMessages] = useState<CoreTAVMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const aiService = CoreTAVService.getInstance();
  const analyticsService = DemoAnalyticsService.getInstance();

  // Initialize demo session
  useEffect(() => {
    if (!isInitialized && context.demoConfig) {
      analyticsService.initializeDemoSession(context.demoConfig);
      setIsInitialized(true);
    }
  }, [context.demoConfig, isInitialized]);

  const addMessage = useCallback((content: string, isUser: boolean): CoreTAVMessage => {
    const message: CoreTAVMessage = {
      id: uuidv4(),
      content,
      isUser,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, message]);
    
    // Track message in analytics
    analyticsService.trackMessage(content, isUser);
    
    return message;
  }, [analyticsService]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    addMessage(content, true);
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Simulate realistic typing delay
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 600));
      
      // Get AI response
      const response = await aiService.sendMessage(content, context, messages);
      
      // Add AI response
      addMessage(response, false);
    } catch (error) {
      console.error('Error sending core TAV message:', error);
      const assistantName = context.branding?.assistantName || 'TAV';
      addMessage(`💙 Sorry, I'm having trouble connecting right now. Please try again in a moment.`, false);
    } finally {
      setIsTyping(false);
    }
  }, [context, messages, addMessage, aiService]);

  const clearConversation = useCallback(() => {
    setMessages([]);
  }, []);

  const initializeWithWelcome = useCallback(() => {
    if (messages.length === 0 && context.branding?.welcomeMessage) {
      addMessage(context.branding.welcomeMessage, false);
    }
  }, [messages.length, context.branding?.welcomeMessage, addMessage]);

  return {
    messages,
    isTyping,
    sendMessage,
    clearConversation,
    initializeWithWelcome,
    sessionToken: analyticsService.getSessionToken()
  };
};