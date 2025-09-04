
import { useState, useCallback, useEffect } from 'react';
import { TAVMessage, TAVAIService, TAVConversationContext } from '../services/tavAIService';
import { v4 as uuidv4 } from 'uuid';
import { processTAVForRegistration } from '@/utils/demo/tavToDemoRegistration';

export const useTAVConversation = (
  context: TAVConversationContext, 
  onDataUpdate?: (sessionId: string) => void,
  onRealTimeDataExtract?: (data: Record<string, any>) => void
) => {
  const [messages, setMessages] = useState<TAVMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [extractedData, setExtractedData] = useState<Record<string, any>>({});
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

  // Extract data from conversation in real-time
  const extractDataFromMessage = useCallback((userMessage: string) => {
    const patterns = {
      first_name: /(?:my (?:first )?name is|i'?m|call me|i am)\s+([a-zA-Z]+)/i,
      last_name: /(?:last name|surname|family name|and my last name is)(?:\s+is)?\s+([a-zA-Z]+)/i,
      email: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
      phone_number: /(\d{3}[.-]?\d{3}[.-]?\d{4}|\d{10})/,
      address: /(?:address|live at|located at)\s+(.+?)(?:\s|$|\.|,)/i,
      relationship: /(?:(?:she|he) is my|relationship.{0,20})(mother|father|parent|spouse|wife|husband|partner|child|son|daughter|sibling|brother|sister|friend)/i,
      care_recipient_name: /(?:(?:her|his) name is|name.{0,20})\s+([a-zA-Z\s]+?)(?:\s|$|\.)/i,
    };

    const newData: Record<string, any> = {};
    
    for (const [field, pattern] of Object.entries(patterns)) {
      const match = userMessage.match(pattern);
      if (match) {
        newData[field] = match[1].trim();
      }
    }

    if (Object.keys(newData).length > 0) {
      const updatedData = { ...extractedData, ...newData };
      setExtractedData(updatedData);
      console.log('📋 Extracted data from conversation:', newData);
      
      // Trigger real-time form update
      if (onRealTimeDataExtract) {
        onRealTimeDataExtract(updatedData);
      }
    }
  }, [extractedData, onRealTimeDataExtract]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Extract data from user message
    extractDataFromMessage(content);

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
      
      // Process conversation data for demo registration if in demo mode and session ID available
      if (context.isDemoMode && context.sessionId && onDataUpdate) {
        // Small delay to allow TAV memory to be saved
        setTimeout(() => {
          onDataUpdate(context.sessionId);
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error sending TAV message:', error);
      addMessage("💙 Sorry, I'm having trouble connecting right now. Please try again.", false);
    } finally {
      setIsTyping(false);
    }
  }, [context, messages, addMessage, aiService, extractDataFromMessage, onDataUpdate]);

  const clearConversation = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
    clearConversation,
    extractedData,
    hasDataForRegistration: Object.keys(extractedData).length >= 3
  };
};
