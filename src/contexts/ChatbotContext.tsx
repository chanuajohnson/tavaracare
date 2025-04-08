
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { ChatbotConversation, ChatbotMessage } from '@/types/chatbot';
import { getOrCreateSessionId } from '@/utils/sessionHelper';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

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

// Initial greeting message from the bot
const INITIAL_GREETING = "Hi there! I'm Tavara's virtual assistant. I can help you find the right care for your loved one or explore opportunities as a caregiver. How can I assist you today?";

interface ChatbotProviderProps {
  children: React.ReactNode;
}

export const ChatbotProvider: React.FC<ChatbotProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [conversation, setConversation] = useState<ChatbotConversation | null>(null);
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const initializeChatbot = async () => {
      try {
        setLoading(true);
        
        // Get session ID for tracking
        const sessionId = getOrCreateSessionId();
        
        // Check if user is authenticated
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData.user?.id;
        
        // Look for an existing conversation for this session
        const { data: existingConversations, error: fetchError } = await (supabase as any)
          .from('chatbot_conversations')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (fetchError) throw fetchError;
        
        if (existingConversations && existingConversations.length > 0) {
          // We found an existing conversation
          const existingConversation = existingConversations[0] as unknown as ChatbotConversation;
          setConversation(existingConversation);
          
          // Load the messages for this conversation
          const { data: messageData, error: messageError } = await (supabase as any)
            .from('chatbot_messages')
            .select('*')
            .eq('conversation_id', existingConversation.id)
            .order('timestamp', { ascending: true });
            
          if (messageError) throw messageError;
          
          if (messageData) {
            setMessages(messageData as unknown as ChatbotMessage[]);
          }
        } else {
          // Create a new conversation
          const newConversationId = uuidv4();
          
          // Create initial welcome message
          const initialMessage: ChatbotMessage = {
            id: uuidv4(),
            message: INITIAL_GREETING,
            senderType: 'bot',
            timestamp: new Date().toISOString(),
            messageType: 'greeting',
          };
          
          // Insert new conversation record
          const { error: createError } = await (supabase as any)
            .from('chatbot_conversations')
            .insert({
              id: newConversationId,
              user_id: userId || null,
              session_id: sessionId,
              conversation_data: [initialMessage],
              lead_score: 0,
            });
            
          if (createError) throw createError;
          
          // Insert initial greeting message
          const { error: messageError } = await (supabase as any)
            .from('chatbot_messages')
            .insert({
              id: initialMessage.id,
              conversation_id: newConversationId,
              message: initialMessage.message,
              sender_type: initialMessage.senderType,
              timestamp: initialMessage.timestamp,
              message_type: initialMessage.messageType,
            });
            
          if (messageError) throw messageError;
          
          // Set state with new conversation and message
          setConversation({
            id: newConversationId,
            userId: userId || undefined,
            sessionId,
            conversationData: [initialMessage],
            leadScore: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            convertedToRegistration: false,
            handoffRequested: false,
          });
          
          setMessages([initialMessage]);
          
          // Show the chatbot after 5 seconds on homepage if it's a new conversation
          const currentPath = window.location.pathname;
          if (currentPath === '/' || currentPath === '/home' || currentPath === '/index.html') {
            setTimeout(() => {
              setIsOpen(true);
            }, 5000);
          }
        }
      } catch (err) {
        console.error('Error initializing chatbot:', err);
        // Create default local-only conversation fallback
        const fallbackMessage: ChatbotMessage = {
          id: uuidv4(),
          message: INITIAL_GREETING,
          senderType: 'bot',
          timestamp: new Date().toISOString(),
          messageType: 'greeting',
        };
        
        setMessages([fallbackMessage]);
      } finally {
        setLoading(false);
      }
    };

    initializeChatbot();
  }, []);

  const saveMessage = async (message: ChatbotMessage) => {
    if (!conversation) return;
    
    try {
      // Save message to database
      await (supabase as any).from('chatbot_messages').insert({
        id: message.id,
        conversation_id: conversation.id,
        message: message.message,
        sender_type: message.senderType,
        timestamp: message.timestamp,
        message_type: message.messageType,
        context_data: message.contextData,
      });
      
      // Update the conversation record with latest activity
      await (supabase as any)
        .from('chatbot_conversations')
        .update({
          updated_at: new Date().toISOString(),
          conversation_data: [...messages, message],
        })
        .eq('id', conversation.id);
        
    } catch (err) {
      console.error('Error saving chatbot message:', err);
    }
  };

  const processBotResponse = async (userMessage: string): Promise<ChatbotMessage> => {
    try {
      // Show typing indicator
      setIsTyping(true);
      
      // Here we would normally call an AI service, but for now we'll use a simple rule-based system
      let botResponse = '';
      let messageType: 'response' | 'question' = 'response';
      let contextData = {};
      let updatedLeadScore = conversation?.leadScore || 0;
      
      // Simple keyword-based responses
      const lowerCaseMessage = userMessage.toLowerCase();
      
      if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
        botResponse = "Hello! How can I help you today? Are you looking for care services or interested in becoming a caregiver?";
        messageType = 'question';
        contextData = { topic: 'greeting' };
      } 
      else if (lowerCaseMessage.includes('care') || lowerCaseMessage.includes('help') || lowerCaseMessage.includes('service')) {
        botResponse = "We offer a variety of care services for families. What type of care are you looking for? (Elder care, post-surgery recovery, special needs, etc.)";
        messageType = 'question';
        contextData = { topic: 'care_type', leadQualification: true };
        updatedLeadScore += 20; // Interested in care services
      }
      else if (lowerCaseMessage.includes('elder') || lowerCaseMessage.includes('senior') || lowerCaseMessage.includes('old')) {
        botResponse = "We have many qualified caregivers specialized in elder care. When do you need this care to start?";
        messageType = 'question';
        contextData = { topic: 'elder_care', careType: 'elder', leadQualification: true };
        updatedLeadScore += 15; // Specific care need identified
      }
      else if (lowerCaseMessage.includes('caregiver') || lowerCaseMessage.includes('job') || lowerCaseMessage.includes('work')) {
        botResponse = "Great! We're always looking for qualified healthcare professionals. Do you have experience as a caregiver or nurse?";
        messageType = 'question';
        contextData = { topic: 'caregiver_inquiry', userType: 'professional' };
      }
      else if (lowerCaseMessage.includes('price') || lowerCaseMessage.includes('cost') || lowerCaseMessage.includes('fee')) {
        botResponse = "Our care services are personalized to your specific needs. Pricing depends on the level of care required, frequency, and duration. Would you like to provide some details about your care needs so I can give you a better estimate?";
        messageType = 'question';
        contextData = { topic: 'pricing', leadQualification: true };
        updatedLeadScore += 25; // Price-sensitive, likely serious
      }
      else if (lowerCaseMessage.includes('register') || lowerCaseMessage.includes('sign up') || lowerCaseMessage.includes('account')) {
        botResponse = "I'd be happy to help you register! Are you looking to register as a family in need of care services, or as a healthcare professional looking for opportunities?";
        messageType = 'question';
        contextData = { topic: 'registration', leadQualification: true };
        updatedLeadScore += 30; // Ready to register
      }
      else if (lowerCaseMessage.includes('urgent') || lowerCaseMessage.includes('emergency') || lowerCaseMessage.includes('asap')) {
        botResponse = "I understand you need care urgently. We can expedite the matching process. Can I collect your contact information to have our care coordinator reach out to you immediately?";
        messageType = 'question';
        contextData = { topic: 'urgent_care', priority: 'high', leadQualification: true };
        updatedLeadScore += 40; // Urgent need, very hot lead
      }
      else if (lowerCaseMessage.includes('contact') || lowerCaseMessage.includes('phone') || lowerCaseMessage.includes('call me')) {
        botResponse = "I'd be happy to have someone contact you directly. Could you please provide your name and the best phone number to reach you?";
        messageType = 'question';
        contextData = { topic: 'contact_request', leadQualification: true };
        updatedLeadScore += 35; // Ready for personal contact
      }
      else if (lowerCaseMessage.includes('thank')) {
        botResponse = "You're welcome! Is there anything else I can help you with today?";
        messageType = 'question';
        contextData = { topic: 'gratitude' };
      }
      else {
        // Default response
        botResponse = "Thank you for your message. To better assist you, could you share what type of care services you're interested in, or if you'd like to learn about becoming a caregiver with us?";
        messageType = 'question';
        contextData = { topic: 'general_inquiry' };
      }
      
      // Simulate a delay for more natural conversation (1-2 seconds)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 1000));
      
      // Update lead score in database if it changed
      if (conversation && updatedLeadScore !== conversation.leadScore) {
        await (supabase as any)
          .from('chatbot_conversations')
          .update({ lead_score: updatedLeadScore })
          .eq('id', conversation.id);
          
        // Update local state
        setConversation(prev => prev ? {
          ...prev,
          leadScore: updatedLeadScore
        } : null);
      }
      
      return {
        id: uuidv4(),
        message: botResponse,
        senderType: 'bot',
        timestamp: new Date().toISOString(),
        messageType,
        contextData
      };
    } catch (error) {
      console.error('Error processing bot response:', error);
      return {
        id: uuidv4(),
        message: "I apologize, but I'm having trouble connecting right now. Please try again or contact our support team for immediate assistance.",
        senderType: 'bot',
        timestamp: new Date().toISOString(),
        messageType: 'response',
        contextData: { error: true }
      };
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !conversation) return;
    
    // Create user message object
    const userMessage: ChatbotMessage = {
      id: uuidv4(),
      message,
      senderType: 'user',
      timestamp: new Date().toISOString(),
    };
    
    // Add to UI immediately
    setMessages(prev => [...prev, userMessage]);
    
    // Save user message to database
    await saveMessage(userMessage);
    
    // Process and generate bot response
    const botResponse = await processBotResponse(message);
    
    // Add bot response to UI
    setMessages(prev => [...prev, botResponse]);
    
    // Save bot response to database
    await saveMessage(botResponse);
    
    // Clear current message input
    setCurrentMessage('');
  }, [conversation, messages]);

  const toggleChatbot = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const openChatbot = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeChatbot = useCallback(() => {
    setIsOpen(false);
  }, []);

  const requestHandoff = useCallback(async () => {
    if (!conversation) return;
    
    try {
      // Update conversation to request handoff
      await (supabase as any)
        .from('chatbot_conversations')
        .update({
          handoff_requested: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversation.id);
        
      // Update local state
      setConversation(prev => prev ? {
        ...prev,
        handoffRequested: true
      } : null);
      
      // Add system message
      const systemMessage: ChatbotMessage = {
        id: uuidv4(),
        message: "Your conversation has been queued for a human support agent. Someone will reach out to you soon.",
        senderType: 'system',
        timestamp: new Date().toISOString(),
        messageType: 'action',
      };
      
      // Add to UI
      setMessages(prev => [...prev, systemMessage]);
      
      // Save to database
      await saveMessage(systemMessage);
      
      toast.success("Support request received. Our team will contact you soon.");
    } catch (err) {
      console.error('Error requesting handoff:', err);
      toast.error("We couldn't process your request right now. Please try again.");
    }
  }, [conversation]);

  const startRegistration = useCallback((role: 'family' | 'professional' | 'community') => {
    if (!conversation) return;
    
    // Update conversation to mark conversion
    (supabase as any)
      .from('chatbot_conversations')
      .update({
        converted_to_registration: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversation.id)
      .then(() => {
        // Navigate to appropriate registration page
        navigate(`/registration/${role.toLowerCase()}`);
      })
      .catch((error: any) => {
        console.error('Error starting registration:', error);
        // Navigate anyway even if tracking fails
        navigate(`/registration/${role.toLowerCase()}`);
      });
  }, [conversation, navigate]);

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
