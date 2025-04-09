
import { useEffect, useState } from 'react';
import { getMessagesByConversationId, sendUserMessage, sendBotMessage } from '@/services/chatbot/messageService';
import { ChatbotMessage } from '@/types/chatbotTypes';

export function useChatMessages(conversationId: string | undefined) {
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch messages when conversation ID is available
  useEffect(() => {
    async function fetchMessages() {
      if (!conversationId) return;
      
      try {
        setLoading(true);
        const fetchedMessages = await getMessagesByConversationId(conversationId);
        setMessages(fetchedMessages);
      } catch (e) {
        console.error('Error fetching chat messages:', e);
        setError('Failed to load chat history');
      } finally {
        setLoading(false);
      }
    }
    
    fetchMessages();
  }, [conversationId]);

  // Function to send a user message
  const addUserMessage = async (message: string, contextData?: any): Promise<ChatbotMessage | null> => {
    if (!conversationId) return null;
    
    try {
      const newMessage = await sendUserMessage(conversationId, message, contextData);
      if (newMessage) {
        setMessages(prev => [...prev, newMessage]);
        return newMessage;
      }
      return null;
    } catch (e) {
      console.error('Error sending user message:', e);
      setError('Failed to send message');
      return null;
    }
  };

  // Function to send a bot message
  const addBotMessage = async (
    message: string,
    messageType: 'text' | 'option' = 'text',
    options?: { label: string; value: string }[]
  ): Promise<ChatbotMessage | null> => {
    if (!conversationId) return null;
    
    try {
      const newMessage = await sendBotMessage(conversationId, message, messageType, options);
      if (newMessage) {
        setMessages(prev => [...prev, newMessage]);
        return newMessage;
      }
      return null;
    } catch (e) {
      console.error('Error sending bot message:', e);
      setError('Failed to receive bot response');
      return null;
    }
  };

  return {
    messages,
    loading,
    error,
    addUserMessage,
    addBotMessage,
    setMessages
  };
}
