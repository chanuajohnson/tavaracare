
import { ChatMessage, ChatOption } from '@/types/chatTypes';
import { ChatConfig, ChatResponse } from './types';

/**
 * Handles scripted conversation flow based on predefined responses.
 * 
 * @param messages Chat messages history
 * @param userRole Selected user role
 * @param questionIndex Current question index
 * @param config Chat configuration
 * @returns Response object with message and optional UI options
 */
export const handleScriptedFlow = (
  messages: ChatMessage[],
  userRole: string | null,
  questionIndex: number,
  config: ChatConfig
): ChatResponse => {
  // Role selection flow
  if (!userRole || userRole === 'unknown') {
    return handleRoleSelectionFlow(messages);
  }

  // Role-specific conversation flows
  switch (userRole) {
    case 'family':
      return handleFamilyFlow(questionIndex);
    case 'professional':
      return handleProfessionalFlow(questionIndex);
    case 'community':
      return handleCommunityFlow(questionIndex);
    default:
      return {
        message: "I'm not sure how to help with that role. Would you like to select a different role?",
        options: getRoleOptions()
      };
  }
};

/**
 * Handles the initial role selection flow
 */
const handleRoleSelectionFlow = (messages: ChatMessage[]): ChatResponse => {
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
  
  if (lastMessage.includes('care') || lastMessage.includes('help')) {
    return {
      message: "It sounds like you might be looking for caregiving assistance. Are you:",
      options: getRoleOptions()
    };
  }
  
  return {
    message: "Welcome to Tavara Care! How can I assist you today?",
    options: getRoleOptions()
  };
};

/**
 * Returns the standard role selection options
 */
const getRoleOptions = (): ChatOption[] => {
  return [
    { id: "family", label: "Looking for care for a loved one" },
    { id: "professional", label: "A professional caregiver" },
    { id: "community", label: "Interested in community support" }
  ];
};

/**
 * Scripted flow for family role
 */
const handleFamilyFlow = (questionIndex: number): ChatResponse => {
  const questions = [
    {
      message: "What type of care are you looking for?",
      options: [
        { id: "elder", label: "Elder care" },
        { id: "child", label: "Child care" },
        { id: "special_needs", label: "Special needs care" },
        { id: "medical", label: "Medical care" },
        { id: "other", label: "Other" }
      ]
    },
    {
      message: "How soon do you need care?",
      options: [
        { id: "immediately", label: "Immediately" },
        { id: "within_week", label: "Within a week" },
        { id: "within_month", label: "Within a month" },
        { id: "planning_ahead", label: "Just planning ahead" }
      ]
    },
    {
      message: "What's your email address? This helps us create your account.",
      validationNeeded: "email"
    },
    {
      message: "Thank you! Would you like to complete your registration now?",
      options: [
        { id: "yes", label: "Yes, complete registration" },
        { id: "later", label: "I'll do it later" }
      ]
    }
  ];
  
  return questions[questionIndex] || {
    message: "Thank you for providing this information. Would you like to create a full profile now?",
    options: [
      { id: "register", label: "Yes, create my profile" },
      { id: "later", label: "Not right now" }
    ]
  };
};

/**
 * Scripted flow for professional role
 */
const handleProfessionalFlow = (questionIndex: number): ChatResponse => {
  const questions = [
    {
      message: "What type of care services do you provide?",
      options: [
        { id: "elder", label: "Elder care" },
        { id: "child", label: "Child care" },
        { id: "special_needs", label: "Special needs care" },
        { id: "medical", label: "Medical care" },
        { id: "other", label: "Other" }
      ]
    },
    {
      message: "How many years of experience do you have?",
      options: [
        { id: "less_than_1", label: "Less than 1 year" },
        { id: "1_to_3", label: "1-3 years" },
        { id: "4_to_7", label: "4-7 years" },
        { id: "8_plus", label: "8+ years" }
      ]
    },
    {
      message: "What's your phone number? This helps us verify your account.",
      validationNeeded: "phone"
    },
    {
      message: "Thank you! Would you like to complete your caregiver profile now?",
      options: [
        { id: "yes", label: "Yes, complete my profile" },
        { id: "later", label: "I'll do it later" }
      ]
    }
  ];
  
  return questions[questionIndex] || {
    message: "Thank you for providing this information. Would you like to create your professional profile now?",
    options: [
      { id: "register", label: "Yes, create my profile" },
      { id: "later", label: "Not right now" }
    ]
  };
};

/**
 * Scripted flow for community role
 */
const handleCommunityFlow = (questionIndex: number): ChatResponse => {
  const questions = [
    {
      message: "What brings you to our community?",
      options: [
        { id: "support_family", label: "Support families" },
        { id: "support_caregivers", label: "Support caregivers" },
        { id: "resources", label: "Find resources" },
        { id: "volunteer", label: "Volunteer opportunities" },
        { id: "other", label: "Other" }
      ]
    },
    {
      message: "What's your name?",
      validationNeeded: "name"
    },
    {
      message: "What's your email address?",
      validationNeeded: "email"
    },
    {
      message: "Thank you! Would you like to join our community now?",
      options: [
        { id: "yes", label: "Yes, join the community" },
        { id: "later", label: "I'll do it later" }
      ]
    }
  ];
  
  return questions[questionIndex] || {
    message: "Thank you for your interest in our community. Would you like to create your community profile now?",
    options: [
      { id: "register", label: "Yes, create my profile" },
      { id: "later", label: "Not right now" }
    ]
  };
};
