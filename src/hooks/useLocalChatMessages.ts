
import { useState } from 'react';
import { getLocalMessages, addLocalUserMessage, addLocalBotMessage, generateSimpleBotResponse } from '@/services/chatbot/localChatService';
import { ChatbotMessage, ChatOption, ChatbotMessageType } from '@/types/chatbotTypes';

export function useLocalChatMessages() {
  const [messages, setMessages] = useState<ChatbotMessage[]>(getLocalMessages());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to send a user message
  const addUserMessage = async (message: string, contextData?: any): Promise<ChatbotMessage | null> => {
    try {
      const newMessage = addLocalUserMessage(message, contextData);
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (e) {
      console.error('Error sending user message:', e);
      setError('Failed to send message');
      return null;
    }
  };

  // Function to send a bot message
  const addBotMessage = async (
    message: string,
    messageType: ChatbotMessageType = 'text',
    options?: ChatOption[]
  ): Promise<ChatbotMessage | null> => {
    try {
      const newMessage = addLocalBotMessage(message, messageType, options);
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (e) {
      console.error('Error sending bot message:', e);
      setError('Failed to receive bot response');
      return null;
    }
  };

  // Function to process user message and generate bot response
  const processMessage = async (userMessage: string): Promise<ChatbotMessage | null> => {
    try {
      const botResponse = generateSimpleBotResponse(userMessage);
      return await addBotMessage(botResponse.message, botResponse.messageType, botResponse.options);
    } catch (e) {
      console.error('Error processing message:', e);
      setError('Failed to process message');
      return null;
    }
  };

  return {
    messages,
    loading,
    error,
    addUserMessage,
    addBotMessage,
    processMessage,
    setMessages
  };
}
