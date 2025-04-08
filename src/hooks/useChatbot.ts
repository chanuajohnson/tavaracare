
import { useState, useEffect } from "react";
import { messageService } from "@/services/chatbot/messageService";
import { conversationService } from "@/services/chatbot/conversationService";
import { ChatbotConversation, ChatbotMessage } from "@/types/chatbot";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for managing chatbot conversations and messages
 */
export const useChatbot = (initialSessionId?: string) => {
  const [conversation, setConversation] = useState<ChatbotConversation | null>(null);
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Initialize or retrieve session ID
  const [sessionId] = useState<string>(() => {
    return initialSessionId || localStorage.getItem("chatbot_session_id") || uuidv4();
  });

  // Save session ID to localStorage
  useEffect(() => {
    if (!initialSessionId) {
      localStorage.setItem("chatbot_session_id", sessionId);
    }
  }, [sessionId, initialSessionId]);

  // Initialize conversation
  useEffect(() => {
    const initConversation = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Try to fetch existing conversation
        let existingConversation = await conversationService.getConversationBySessionId(sessionId);
        
        // Create new conversation if none exists
        if (!existingConversation) {
          existingConversation = await conversationService.createConversation({
            sessionId,
            conversationData: [],
          });
        }
        
        // Set conversation in state
        if (existingConversation) {
          setConversation(existingConversation);
          
          // Load messages if there's a conversation ID
          if (existingConversation.id) {
            const conversationMessages = await messageService.getMessagesByConversationId(
              existingConversation.id
            );
            setMessages(conversationMessages);
          }
        } else {
          setError("Failed to initialize conversation");
        }
      } catch (err) {
        console.error("Error initializing chatbot:", err);
        setError("An error occurred initializing the chatbot");
        toast.error("Failed to initialize chatbot");
      } finally {
        setLoading(false);
      }
    };
    
    initConversation();
  }, [sessionId, toast]);

  /**
   * Send a message from the user to the chatbot
   */
  const sendMessage = async (messageText: string): Promise<ChatbotMessage | null> => {
    if (!conversation?.id) {
      setError("No active conversation");
      toast.error("No active conversation");
      return null;
    }
    
    try {
      // Create user message
      const userMessage: ChatbotMessage = {
        message: messageText,
        senderType: "user",
        conversationId: conversation.id,
        timestamp: new Date().toISOString(),
      };
      
      // Save message to database
      const savedMessage = await messageService.createMessage(userMessage);
      
      if (savedMessage) {
        // Update local messages state
        setMessages(prevMessages => [...prevMessages, savedMessage]);
        return savedMessage;
      }
      
      return null;
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
      return null;
    }
  };
  
  /**
   * Add a response from the bot
   */
  const addBotResponse = async (responseText: string): Promise<ChatbotMessage | null> => {
    if (!conversation?.id) {
      setError("No active conversation");
      toast.error("No active conversation");
      return null;
    }
    
    try {
      // Create bot message
      const botMessage: ChatbotMessage = {
        message: responseText,
        senderType: "bot",
        conversationId: conversation.id,
        timestamp: new Date().toISOString(),
      };
      
      // Save message to database
      const savedMessage = await messageService.createMessage(botMessage);
      
      if (savedMessage) {
        // Update local messages state
        setMessages(prevMessages => [...prevMessages, savedMessage]);
        return savedMessage;
      }
      
      return null;
    } catch (err) {
      console.error("Error adding bot response:", err);
      toast.error("Failed to add bot response");
      return null;
    }
  };

  /**
   * Update conversation data
   */
  const updateConversationData = async (
    updates: Partial<ChatbotConversation>
  ): Promise<ChatbotConversation | null> => {
    if (!conversation) {
      setError("No active conversation");
      toast.error("No active conversation");
      return null;
    }
    
    try {
      const updatedConversation = await conversationService.updateConversation({
        ...conversation,
        ...updates,
      });
      
      if (updatedConversation) {
        setConversation(updatedConversation);
        return updatedConversation;
      }
      
      return null;
    } catch (err) {
      console.error("Error updating conversation:", err);
      toast.error("Failed to update conversation");
      return null;
    }
  };

  return {
    sessionId,
    conversation,
    messages,
    loading,
    error,
    sendMessage,
    addBotResponse,
    updateConversationData,
  };
};
