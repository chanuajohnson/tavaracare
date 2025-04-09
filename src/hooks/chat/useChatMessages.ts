
import { useState, useEffect, useCallback } from "react";
import { ChatMessage } from "@/types/chatTypes";

/**
 * Hook for managing chat messages in localStorage
 * @param sessionId - The unique identifier for the current chat session
 * @returns Object with messages array and functions to manage messages
 */
export function useChatMessages(sessionId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Load messages from localStorage when sessionId changes
  useEffect(() => {
    if (!sessionId) return;
    
    try {
      const storedMessages = localStorage.getItem(`tavara_chat_messages_${sessionId}`);
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error loading chat messages from localStorage:", error);
      setMessages([]);
    }
  }, [sessionId]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (!sessionId || !messages.length) return;
    
    try {
      localStorage.setItem(`tavara_chat_messages_${sessionId}`, JSON.stringify(messages));
    } catch (error) {
      console.error("Error saving chat messages to localStorage:", error);
    }
  }, [messages, sessionId]);

  // Add a new message to the chat
  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prevMessages => [...prevMessages, message]);
  }, []);

  // Clear all messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    if (sessionId) {
      localStorage.removeItem(`tavara_chat_messages_${sessionId}`);
    }
  }, [sessionId]);

  return {
    messages,
    addMessage,
    clearMessages,
    setMessages
  };
}
