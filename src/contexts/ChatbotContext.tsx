
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { enhancedSupabaseClient } from '@/lib/supabase';
import { ChatbotConversation, ChatbotMessage } from '@/types/chatbot';
import { getOrCreateSessionId } from '@/utils/sessionHelper';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useChatbotAPI } from '@/hooks/useChatbotAPI';
import { 
  processBotResponse, 
  createUserMessage, 
  createSystemMessage, 
  createGreetingMessage 
} from '@/utils/chatbotMessageUtils';
import { INITIAL_GREETING, AUTO_OPEN_DELAY } from '@/constants/chatbotConstants';

interface ChatbotContextType {
  conversation: ChatbotConversation | null;
  messages: ChatbotMessage[];
  isOpen: boolean;
  loading: boolean;
  currentMessage: string;
  setCurrentMessage: (message: string) => void;
  sendMessage: (message: string) => Promise<void>;
  toggleChatbot: () => void;
  openChatbot: () => void;
  closeChatbot: () => void;
  requestHandoff: () => Promise<void>;
  startRegistration: (role: 'family' | 'professional' | 'community') => void;
  isTyping: boolean;
  leadScore: number | undefined;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};

interface ChatbotProviderProps {
  children: React.ReactNode;
}

export const ChatbotProvider: React.FC<ChatbotProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const chatbotAPI = useChatbotAPI();
  
  const [conversation, setConversation] = useState<ChatbotConversation | null>(null);
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Initialize chatbot on load
  useEffect(() => {
    const initializeChatbot = async () => {
      try {
        setLoading(true);
        
        const sessionId = getOrCreateSessionId();
        const { data: authData } = await enhancedSupabaseClient().client.auth.getUser();
        const userId = authData.user?.id;
        
        // Try to fetch an existing conversation
        const { data: existingConversations, error: fetchError } = 
          await chatbotAPI.fetchExistingConversation(userId, sessionId);

        if (fetchError) throw fetchError;
        
        if (existingConversations && existingConversations.length > 0) {
          // Use existing conversation
          const existingConversation = existingConversations[0];
          setConversation(existingConversation);
          
          // Fetch messages for this conversation
          const { data: messageData } = 
            await chatbotAPI.fetchMessages(existingConversation.id);
            
          if (messageData && messageData.length > 0) {
            setMessages(messageData);
          }
        } else {
          // Create a new conversation with initial greeting
          const initialMessage = createGreetingMessage(INITIAL_GREETING);
          
          const { data: newConversation, error: createError } = 
            await chatbotAPI.createConversation(sessionId, userId, initialMessage);
            
          if (createError) throw createError;
          
          if (newConversation) {
            // Save the initial message
            await chatbotAPI.saveMessage(initialMessage, newConversation.id);
            
            // Set the new conversation and message
            setConversation(newConversation);
            setMessages([initialMessage]);
            
            // Auto-open chatbot on homepage after delay
            const currentPath = window.location.pathname;
            if (currentPath === '/' || currentPath === '/home' || currentPath === '/index.html') {
              setTimeout(() => {
                setIsOpen(true);
              }, AUTO_OPEN_DELAY);
            }
          }
        }
      } catch (err) {
        console.error('Error initializing chatbot:', err);
        // Fallback to local-only mode
        const fallbackMessage = createGreetingMessage(INITIAL_GREETING);
        setMessages([fallbackMessage]);
      } finally {
        setLoading(false);
      }
    };

    initializeChatbot();
  }, []);

  // Send message handler
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !conversation) return;
    
    const userMessage = createUserMessage(message);
    
    // Update UI immediately
    setMessages(prev => [...prev, userMessage]);
    
    // Save user message to database
    await chatbotAPI.saveMessage(userMessage, conversation.id);
    
    // Process bot response
    setIsTyping(true);
    const { botResponse, updatedLeadScore } = await processBotResponse(
      message, 
      conversation.leadScore
    );
    
    // Update UI with bot response
    setMessages(prev => [...prev, botResponse]);
    
    // Save bot message
    await chatbotAPI.saveMessage(botResponse, conversation.id);
    
    // Update conversation data and lead score if changed
    if (updatedLeadScore !== conversation.leadScore) {
      await chatbotAPI.updateConversation(conversation.id, {
        leadScore: updatedLeadScore,
      });
      
      // Update local state
      setConversation(prev => prev ? {
        ...prev,
        leadScore: updatedLeadScore
      } : null);
    }
    
    // Update conversation messages
    await chatbotAPI.updateConversationMessages(
      conversation.id, 
      [...messages, userMessage, botResponse]
    );
    
    setIsTyping(false);
    setCurrentMessage('');
  }, [conversation, messages, chatbotAPI]);

  // UI state handlers
  const toggleChatbot = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const openChatbot = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeChatbot = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Request handoff to human support
  const requestHandoff = useCallback(async () => {
    if (!conversation) return;
    
    try {
      // Update conversation with handoff request
      await chatbotAPI.updateConversation(conversation.id, {
        handoffRequested: true,
      });
      
      // Update local state
      setConversation(prev => prev ? {
        ...prev,
        handoffRequested: true
      } : null);
      
      // Create and add system message
      const systemMessage = createSystemMessage(
        "Your conversation has been queued for a human support agent. Someone will reach out to you soon."
      );
      
      setMessages(prev => [...prev, systemMessage]);
      
      // Save message
      await chatbotAPI.saveMessage(systemMessage, conversation.id);
      
      // Show success notification
      toast.success("Support request received. Our team will contact you soon.");
    } catch (err) {
      console.error('Error requesting handoff:', err);
      toast.error("We couldn't process your request right now. Please try again.");
    }
  }, [conversation, chatbotAPI]);

  // Start registration process
  const startRegistration = useCallback((role: 'family' | 'professional' | 'community') => {
    if (!conversation) return;
    
    chatbotAPI.updateConversation(conversation.id, {
      convertedToRegistration: true,
    })
      .then(() => {
        navigate(`/registration/${role.toLowerCase()}`);
      })
      .catch((error) => {
        console.error('Error starting registration:', error);
        // Still navigate even if update fails
        navigate(`/registration/${role.toLowerCase()}`);
      });
  }, [conversation, navigate, chatbotAPI]);

  // Debug helper (development only)
  if (process.env.NODE_ENV === 'development') {
    (window as any).debugChatbot = {
      conversation,
      messages,
      sendMessage
    };
  }

  // Create the context value object
  const value = {
    conversation,
    messages,
    isOpen,
    loading,
    currentMessage,
    setCurrentMessage,
    sendMessage,
    toggleChatbot,
    openChatbot,
    closeChatbot,
    requestHandoff,
    startRegistration,
    isTyping,
    leadScore: conversation?.leadScore,
  };

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  );
};
