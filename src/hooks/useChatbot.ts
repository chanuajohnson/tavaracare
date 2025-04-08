
import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  ChatbotConversation,
  ChatbotMessage
} from '@/types/chatbot';
import {
  createConversation,
  getConversationBySessionId,
  addMessageToConversation
} from '@/services/chatbot/conversationService';

export const useChatbot = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [conversation, setConversation] = useState<ChatbotConversation | null>(null);
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Ensure we have a session ID
  const getSessionId = useCallback(() => {
    let sessionId = localStorage.getItem('chatbot_session_id');
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem('chatbot_session_id', sessionId);
    }
    return sessionId;
  }, []);

  // Load or create a conversation
  const loadConversation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const sessionId = getSessionId();
      
      // Try to get an existing conversation for this session
      let currentConversation = await getConversationBySessionId(sessionId);
      
      // Create a new conversation if none exists
      if (!currentConversation) {
        const initialMessages = [
          {
            sender: 'system',
            content: 'Welcome to our chatbot! How can I help you today?',
            type: 'text'
          }
        ] as ChatbotMessage[];
        
        currentConversation = await createConversation(
          sessionId, 
          user?.id,
          initialMessages
        );
        
        if (!currentConversation) {
          throw new Error('Failed to create conversation');
        }
      }
      
      setConversation(currentConversation);
      setMessages(currentConversation.messages || []);
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError('Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, getSessionId]);

  // Send a message
  const sendMessage = useCallback(async (
    content: string,
    type: 'text' | 'option' | 'input' | 'form' = 'text'
  ) => {
    if (!conversation?.id) {
      setError('No active conversation');
      return;
    }
    
    try {
      const newMessage: ChatbotMessage = {
        sender: 'user',
        content,
        type,
        timestamp: new Date().toISOString()
      };
      
      // Optimistically update UI
      setMessages(prev => [...prev, newMessage]);
      
      // Send to backend
      const updatedConversation = await addMessageToConversation(
        conversation.id,
        newMessage
      );
      
      if (updatedConversation) {
        setConversation(updatedConversation);
        setMessages(updatedConversation.messages || []);
      }
      
      // TODO: Process message with AI and get response
      // This will be implemented in a future update
      
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  }, [conversation]);

  // Load conversation on initial mount
  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  return {
    isLoading,
    conversation,
    messages,
    error,
    sendMessage,
    refreshConversation: loadConversation
  };
};

export default useChatbot;
