
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getConversation } from '@/services/chatbotService';
import { ChatbotConversation, ContactInfo, CareNeeds } from '@/types/chatbotTypes';

// Type for the hook return value
interface ChatbotPrefillResult {
  isLoading: boolean;
  conversationId: string | null;
  contactInfo: ContactInfo | null;
  careNeeds: CareNeeds | null;
  conversation: ChatbotConversation | null;
}

/**
 * Hook to handle prefilling registration forms from chatbot data
 */
export function useChatbotPrefill(): ChatbotPrefillResult {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ChatbotConversation | null>(null);

  // Extract conversationId from URL on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const prefillParam = searchParams.get('prefill');
    
    if (prefillParam) {
      setConversationId(prefillParam);
    }
  }, [location]);

  // Fetch conversation data when conversationId changes
  useEffect(() => {
    const fetchConversation = async () => {
      if (!conversationId) return;
      
      setIsLoading(true);
      
      try {
        const data = await getConversation(conversationId);
        
        if (data) {
          setConversation(data);
          console.log('Prefilled data:', data);
        }
      } catch (error) {
        console.error('Error fetching chatbot conversation data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversation();
  }, [conversationId]);

  return {
    isLoading,
    conversationId,
    contactInfo: conversation?.contactInfo || null,
    careNeeds: conversation?.careNeeds || null,
    conversation,
  };
}
