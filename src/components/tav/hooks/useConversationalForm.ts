
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
}

export const useConversationalForm = () => {
  const { currentForm, isFormPage, getFieldByName, getNextField } = useFormDetection();
  const [conversationState, setConversationState] = useState<ConversationState>({
    isActive: false,
    currentField: null,
    mode: 'guidance',
    collectedValues: {},
    conversationHistory: []
  });

  const startConversation = useCallback((mode: 'guidance' | 'filling' = 'guidance') => {
    if (!currentForm) return;

    const firstField = currentForm.fields[0];
    setConversationState(prev => ({
      ...prev,
      isActive: true,
      currentField: firstField,
      mode,
      conversationHistory: [
        {
          id: Date.now().toString(),
          type: 'tav',
          content: mode === 'filling' 
            ? `I'll help you fill out the ${currentForm.formTitle} form. Let's start with the first question: ${firstField.conversationalPrompt}`
            : `I'm here to help you with the ${currentForm.formTitle} form. Would you like me to guide you through it step by step?`,
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
      
      // Add TAV response for next field
      setTimeout(() => {
        addMessage(
          `Great! Now, ${nextField.conversationalPrompt}`,
          'tav',
          nextField.id
        );
      }, 1000);
    } else {
      // Form complete
      setConversationState(prev => ({
        ...prev,
        currentField: null,
        mode: 'complete'
      }));
      
      setTimeout(() => {
        addMessage(
          "Perfect! I've gathered all the information. Would you like me to fill out the form for you, or would you prefer to review and submit it yourself?",
          'tav'
        );
      }, 1000);
    }
  }, [conversationState.currentField, addMessage, getNextField]);

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

    // Generic helpful responses based on field type
    switch (field.type) {
      case 'email':
        return ['Use my primary email', 'I need to provide a different email'];
      case 'tel':
        return ['Use my primary number', 'I need to provide a different number'];
      default:
        return ['Help me with this', 'Skip this for now', 'I need more information'];
    }
  }, [conversationState.currentField]);

  const generateFormGuidance = useCallback((userQuery: string): string => {
    if (!currentForm) return "I can help you once you're on a form page.";

    const lowerQuery = userQuery.toLowerCase();
    
    if (lowerQuery.includes('start') || lowerQuery.includes('begin') || lowerQuery.includes('fill')) {
      return `I can help you fill out the ${currentForm.formTitle} form step by step. Would you like me to guide you through each field?`;
    }
    
    if (lowerQuery.includes('help') || lowerQuery.includes('guide')) {
      return `This form has ${currentForm.fields.length} fields. I can walk you through each one, explain what's needed, or help you fill them out conversationally. What would be most helpful?`;
    }
    
    // Check if user is asking about a specific field
    const mentionedField = currentForm.fields.find(field => 
      lowerQuery.includes(field.name.toLowerCase()) || 
      lowerQuery.includes(field.label.toLowerCase())
    );
    
    if (mentionedField) {
      return `For ${mentionedField.label}: ${mentionedField.conversationalPrompt} ${mentionedField.helpText ? mentionedField.helpText : ''}`;
    }
    
    return `I can help you with the ${currentForm.formTitle} form. You can ask me about specific fields, or I can guide you through the entire form step by step.`;
  }, [currentForm]);

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
