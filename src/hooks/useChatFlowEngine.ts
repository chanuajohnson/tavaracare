
import { useState, useEffect } from 'react';
import { ChatbotConversation, ChatbotMessage } from '@/types/chatbotTypes';
import { updateConversationRole } from '@/services/chatbot/sessionService';

export function useChatFlowEngine(conversation: ChatbotConversation | null) {
  const [currentStep, setCurrentStep] = useState<string>('intro');
  const [userRole, setUserRole] = useState<'family' | 'professional' | 'community' | null>(null);
  
  // Initialize user role from conversation if available
  useEffect(() => {
    if (conversation?.userRole) {
      setUserRole(conversation.userRole);
    }
  }, [conversation]);
  
  // Process user responses and determine next steps
  const processUserResponse = async (
    response: string,
    step: string
  ): Promise<ChatbotMessage> => {
    // Handle user selecting a role
    if (step === 'intro' && ['family', 'professional', 'community'].includes(response)) {
      const selectedRole = response as 'family' | 'professional' | 'community';
      setUserRole(selectedRole);
      setCurrentStep('role_selected');
      
      // Update the conversation with the selected role
      if (conversation?.id) {
        await updateConversationRole(conversation.id, selectedRole);
      }
      
      // Return next message based on selected role
      return {
        senderType: 'bot',
        message: getRoleSpecificNextMessage(selectedRole),
        messageType: 'option',
        options: getRoleSpecificOptions(selectedRole)
      };
    }
    
    // Default response for other steps or unhandled responses
    return {
      senderType: 'bot',
      message: "Thanks for sharing that information. How can I help you further?",
      messageType: 'text'
    };
  };
  
  // Get options for the current step in the flow
  const getOptionsForCurrentStep = (): { label: string; value: string }[] => {
    if (currentStep === 'intro') {
      return [
        { label: '🏠 I\'m looking for care for a loved one', value: 'family' },
        { label: '👩‍⚕️ I\'m a care professional', value: 'professional' },
        { label: '🫂 I want to help or contribute to the community', value: 'community' },
      ];
    }
    
    if (currentStep === 'role_selected' && userRole) {
      return getRoleSpecificOptions(userRole);
    }
    
    return [];
  };
  
  // Helper function to get role-specific next messages
  const getRoleSpecificNextMessage = (role: 'family' | 'professional' | 'community'): string => {
    switch (role) {
      case 'family':
        return "Thanks for sharing. What kind of care support are you looking for?";
      case 'professional':
        return "Great! What type of care professional are you?";
      case 'community':
        return "That's wonderful! How would you like to contribute to our community?";
      default:
        return "Thanks for sharing. How can I help you today?";
    }
  };
  
  // Helper function to get role-specific options
  const getRoleSpecificOptions = (role: 'family' | 'professional' | 'community'): { label: string; value: string }[] => {
    switch (role) {
      case 'family':
        return [
          { label: 'Find a caregiver', value: 'find_caregiver' },
          { label: 'Learn about care options', value: 'learn_options' },
          { label: 'Register now', value: '/registration/family' }
        ];
      case 'professional':
        return [
          { label: 'Find care opportunities', value: 'find_opportunities' },
          { label: 'List your services', value: 'list_services' },
          { label: 'Register as a professional', value: '/registration/professional' }
        ];
      case 'community':
        return [
          { label: 'Volunteer opportunities', value: 'volunteer' },
          { label: 'Technology contribution', value: 'tech_contribution' },
          { label: 'Register for the community', value: '/registration/community' }
        ];
      default:
        return [];
    }
  };
  
  // Generate prefill data for registration forms
  const generatePrefillData = (): Record<string, any> | null => {
    if (!conversation || !userRole) return null;
    
    const prefillData: Record<string, any> = {
      userRole
    };
    
    // Add contact info if available
    if (conversation.contactInfo) {
      Object.assign(prefillData, conversation.contactInfo);
    }
    
    // Add care needs for family role
    if (userRole === 'family' && conversation.careNeeds) {
      Object.assign(prefillData, conversation.careNeeds);
    }
    
    return prefillData;
  };
  
  return {
    currentStep,
    userRole,
    processUserResponse,
    getOptionsForCurrentStep,
    generatePrefillData
  };
}
