
import { useState, useCallback } from 'react';
import { useFormDetection, FormField } from './useFormDetection';

export interface ConversationState {
  isActive: boolean;
  currentField: FormField | null;
  mode: 'guidance' | 'filling' | 'editing' | 'complete';
  collectedValues: Record<string, any>;
  conversationHistory: Array<{
    id: string;
    type: 'user' | 'tav';
    content: string;
    fieldId?: string;
    timestamp: number;
  }>;
  formContext?: {
    formTitle: string;
    userRole?: string;
    journeyStage?: string;
    autoGreetingMessage?: string;
  };
}

export const useConversationalForm = () => {
  const { currentForm, isFormPage, getFieldByName, getNextField } = useFormDetection();
  const [conversationState, setConversationState] = useState<ConversationState>({
    isActive: false,
    currentField: null,
    mode: 'guidance',
    collectedValues: {},
    conversationHistory: [],
    formContext: undefined
  });

  const startConversation = useCallback((mode: 'guidance' | 'filling' = 'guidance') => {
    if (!currentForm) return;

    const firstField = currentForm.fields[0];
    const welcomeMessage = currentForm.autoGreetingMessage || 
      `I'll help you with the ${currentForm.formTitle} form. ${mode === 'filling' 
        ? `Let's start with the first question: ${firstField?.conversationalPrompt || 'Let me guide you through this step by step.'}` 
        : 'Would you like me to guide you through it step by step?'}`;

    setConversationState(prev => ({
      ...prev,
      isActive: true,
      currentField: firstField,
      mode,
      formContext: {
        formTitle: currentForm.formTitle,
        userRole: currentForm.userRole,
        journeyStage: currentForm.journeyStage,
        autoGreetingMessage: currentForm.autoGreetingMessage
      },
      conversationHistory: [
        {
          id: Date.now().toString(),
          type: 'tav',
          content: welcomeMessage,
          timestamp: Date.now()
        }
      ]
    }));
  }, [currentForm]);

  const addMessage = useCallback((content: string, type: 'user' | 'tav', fieldId?: string) => {
    setConversationState(prev => ({
      ...prev,
      conversationHistory: [
        ...prev.conversationHistory,
        {
          id: Date.now().toString(),
          type,
          content,
          fieldId,
          timestamp: Date.now()
        }
      ]
    }));
  }, []);

  const handleUserResponse = useCallback((response: string) => {
    if (!conversationState.currentField) return;

    // Add user message
    addMessage(response, 'user', conversationState.currentField.id);

    // Store the value
    setConversationState(prev => ({
      ...prev,
      collectedValues: {
        ...prev.collectedValues,
        [prev.currentField!.name]: response
      }
    }));

    // Move to next field
    const nextField = getNextField(conversationState.currentField.name);
    
    if (nextField) {
      setConversationState(prev => ({
        ...prev,
        currentField: nextField
      }));
      
      // Add TAV response for next field with role-appropriate language
      setTimeout(() => {
        const roleBasedResponse = getRoleBasedResponse(nextField, conversationState.formContext?.userRole);
        addMessage(roleBasedResponse, 'tav', nextField.id);
      }, 1000);
    } else {
      // Form complete
      setConversationState(prev => ({
        ...prev,
        currentField: null,
        mode: 'complete'
      }));
      
      setTimeout(() => {
        const completionMessage = getCompletionMessage(conversationState.formContext?.userRole);
        addMessage(completionMessage, 'tav');
      }, 1000);
    }
  }, [conversationState.currentField, conversationState.formContext?.userRole, addMessage, getNextField]);

  const getRoleBasedResponse = (field: FormField, userRole?: string): string => {
    const baseResponse = `Great! Now, ${field.conversationalPrompt}`;
    
    switch (userRole) {
      case 'professional':
        return `🤝 ${baseResponse}`;
      case 'family':
        return `💙 ${baseResponse}`;
      case 'community':
        return `🌟 ${baseResponse}`;
      default:
        return baseResponse;
    }
  };

  const getCompletionMessage = (userRole?: string): string => {
    const baseMessage = "Perfect! I've gathered all the information.";
    
    switch (userRole) {
      case 'professional':
        return `🤝 ${baseMessage} Would you like me to help you review and submit your professional profile, or would you prefer to complete it yourself?`;
      case 'family':
        return `💙 ${baseMessage} Would you like me to help you submit this information, or would you prefer to review everything first?`;
      case 'community':
        return `🌟 ${baseMessage} Thank you for sharing! Would you like me to help you complete your community registration?`;
      default:
        return `${baseMessage} Would you like me to fill out the form for you, or would you prefer to review and submit it yourself?`;
    }
  };

  const stopConversation = useCallback(() => {
    setConversationState(prev => ({
      ...prev,
      isActive: false,
      currentField: null,
      mode: 'guidance'
    }));
  }, []);

  const getSuggestedResponses = useCallback((): string[] => {
    if (!conversationState.currentField) return [];

    const field = conversationState.currentField;
    
    if (field.type === 'select' && field.options) {
      return field.options;
    }
    
    if (field.type === 'checkbox' && field.options) {
      return field.options;
    }

    // Role-specific helpful responses
    const userRole = conversationState.formContext?.userRole;
    switch (field.type) {
      case 'email':
        return ['Use my primary email', 'I need to provide a different email'];
      case 'tel':
        return ['Use my primary number', 'I need to provide a different number'];
      case 'textarea':
        if (userRole === 'professional') {
          return ['Help me write this professionally', 'I need examples', 'Skip this for now'];
        } else if (userRole === 'family') {
          return ['Help me express this', 'I need more time to think', 'Skip this for now'];
        }
        return ['Help me with this', 'I need examples', 'Skip this for now'];
      default:
        return ['Help me with this', 'Skip this for now', 'I need more information'];
    }
  }, [conversationState.currentField, conversationState.formContext?.userRole]);

  const generateFormGuidance = useCallback((userQuery: string): string => {
    if (!currentForm) return "I can help you once you're on a form page.";

    const lowerQuery = userQuery.toLowerCase();
    const userRole = currentForm.userRole;
    const roleEmoji = userRole === 'professional' ? '🤝' : userRole === 'family' ? '💙' : userRole === 'community' ? '🌟' : '';
    
    if (lowerQuery.includes('start') || lowerQuery.includes('begin') || lowerQuery.includes('fill')) {
      return `${roleEmoji} I can help you fill out the ${currentForm.formTitle} form step by step. This is an important part of your ${currentForm.journeyStage || 'journey'}. Would you like me to guide you through each field?`;
    }
    
    if (lowerQuery.includes('help') || lowerQuery.includes('guide')) {
      const fieldCount = currentForm.fields.length;
      const fieldText = fieldCount > 0 ? `${fieldCount} fields` : 'several sections';
      return `${roleEmoji} This form has ${fieldText}. I can walk you through each one, explain what's needed, or help you fill them out conversationally. As always, you can work independently, but I'm here to make this delightful. What would be most helpful?`;
    }
    
    // Check if user is asking about a specific field
    const mentionedField = currentForm.fields.find(field => 
      lowerQuery.includes(field.name.toLowerCase()) || 
      lowerQuery.includes(field.label.toLowerCase())
    );
    
    if (mentionedField) {
      return `${roleEmoji} For ${mentionedField.label}: ${mentionedField.conversationalPrompt} ${mentionedField.helpText ? mentionedField.helpText : ''}`;
    }
    
    // Journey-specific guidance
    const journeyGuidance = getJourneySpecificGuidance(currentForm.journeyStage, userRole);
    return `${roleEmoji} I can help you with the ${currentForm.formTitle} form. ${journeyGuidance} You can ask me about specific fields, or I can guide you through the entire form step by step.`;
  }, [currentForm]);

  const getJourneySpecificGuidance = (journeyStage?: string, userRole?: string): string => {
    switch (journeyStage) {
      case 'registration':
        return userRole === 'professional' 
          ? "This is where you showcase your expertise to connect with families who need your skills."
          : userRole === 'family'
          ? "This helps us understand your care needs so we can provide the best support."
          : "This helps us understand how you'd like to contribute to our caring community.";
      case 'profile-completion':
        return "Completing your profile helps create better matches and builds trust.";
      case 'assessment':
        return "This assessment helps us create a personalized care plan for your loved one.";
      case 'care-tools':
        return "These tools help you manage care more effectively and stay organized.";
      case 'skill-development':
        return "Continuous learning helps you provide the best possible care.";
      default:
        return "This is an important step in your journey with us.";
    }
  };

  return {
    conversationState,
    currentForm,
    isFormPage,
    startConversation,
    stopConversation,
    handleUserResponse,
    addMessage,
    getSuggestedResponses,
    generateFormGuidance
  };
};
