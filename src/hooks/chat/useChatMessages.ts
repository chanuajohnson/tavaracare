
import { useState, useEffect } from 'react';
import { ChatMessage } from '@/types/chatTypes';

export const useChatMessages = (sessionId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const storageKey = `tavara_chat_messages_${sessionId}`;
  
  // Load messages from storage when session ID changes
  useEffect(() => {
    if (!sessionId) return;
    
    try {
      const storedMessages = localStorage.getItem(storageKey);
      
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
      setMessages([]);
    }
  }, [sessionId, storageKey]);
  
  // Save messages when they change
  useEffect(() => {
    if (!sessionId || messages.length === 0) return;
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving chat messages:', error);
    }
  }, [messages, sessionId, storageKey]);
  
  // Add a new message
  const addMessage = (message: ChatMessage) => {
    setMessages(prevMessages => [...prevMessages, message]);
  };
  
  // Clear all messages
  const clearMessages = () => {
    setMessages([]);
    localStorage.removeItem(storageKey);
  };
  
  return { messages, addMessage, clearMessages, setMessages };
};
