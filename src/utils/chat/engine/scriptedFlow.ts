
import { ChatMessage, ChatOption } from '@/types/chatTypes';
import { getIntroMessage, getRoleFollowupMessage, getRoleOptions } from '@/data/chatIntroMessage';
import { getRegistrationFlowByRole } from '@/data/chatRegistrationFlows';
import { applyTrinidadianStyle } from './styleUtils';
import { setLastMessage, getLastMessage } from './messageCache';
import { ChatResponse } from './types';
import { handleRegistrationFlow } from './registrationFlow';

/**
 * Get a random intro message that won't repeat the last one
 */
const getRandomIntroMessage = (sessionId: string): string => {
  const introMessage = getIntroMessage();
  
  // Check if this message is the same as the last one
  if (getLastMessage(sessionId) === introMessage) {
    // Try again to get a different message
    return getRandomIntroMessage(sessionId);
  }
  
  // Store this message and return it
  setLastMessage(sessionId, introMessage);
  return introMessage;
};

/**
 * Handles scripted conversation flow
 */
export const handleScriptedFlow = async (
  messages: ChatMessage[],
  userRole: string | null,
  sessionId: string,
  questionIndex: number
): Promise<ChatResponse> => {
  // Intro stage - no messages yet or only 1-2 messages
  if (messages.length <= 2) {
    // Get a random intro message that won't be the same as the last one
    const introMessage = getRandomIntroMessage(sessionId);
    return {
      message: applyTrinidadianStyle(introMessage),
      options: getRoleOptions()
    };
  }

  // Role selection followup
  if (messages.length <= 4 && userRole) {
    const followupMessage = getRoleFollowupMessage(userRole);
    return {
      message: applyTrinidadianStyle(followupMessage)
    };
  }

  // Handle registration flow once a role is selected
  if (userRole && questionIndex > 0) {
    return await handleRegistrationFlow(messages, userRole, sessionId, questionIndex);
  }

  // Generate questions based on the role and question index
  if (userRole) {
    // For this implementation, we'll create some sample questions
    const questions = {
      family: [
        "Who are you seeking care for? A parent, spouse, child, or someone else?",
        "What type of care assistance do you need?",
        "How often do you need care? Daily, weekly, or on specific days?",
        "When would you like to start receiving care?",
        "Do you have any specific requirements for your caregiver?"
      ],
      professional: [
        "What type of caregiving do you provide?",
        "How many years of experience do you have in caregiving?",
        "What certifications or qualifications do you have?",
        "What areas of Trinidad & Tobago are you available to work in?",
        "What are your weekly availability and preferred hours?"
      ],
      community: [
        "How would you like to support our caregiving community?",
        "Do you have specific skills or resources you'd like to contribute?",
        "How much time can you commit to volunteer activities?",
        "What motivated you to get involved with caregiving support?",
        "Have you been involved with similar initiatives before?"
      ]
    };
    
    let questionList: string[];
    if (userRole === 'family') {
      questionList = questions.family;
    } else if (userRole === 'professional') {
      questionList = questions.professional;
    } else if (userRole === 'community') {
      questionList = questions.community;
    } else {
      questionList = [];
    }
    
    if (questionIndex < questionList.length) {
      // Add options based on the current question
      let options: ChatOption[] | undefined;
      
      if (questionIndex === 0) {
        if (userRole === 'family') {
          options = [
            { id: "parent", label: "For my parent" },
            { id: "spouse", label: "For my spouse" },
            { id: "child", label: "For my child" },
            { id: "other", label: "Someone else" }
          ];
        } else if (userRole === 'professional') {
          options = [
            { id: "home_care", label: "Home care" },
            { id: "medical_care", label: "Medical care" },
            { id: "therapy", label: "Therapy" },
            { id: "specialized", label: "Specialized care" }
          ];
        } else if (userRole === 'community') {
          options = [
            { id: "volunteer", label: "Volunteer" },
            { id: "donate", label: "Donate resources" },
            { id: "advocate", label: "Advocacy" },
            { id: "other", label: "Other ways" }
          ];
        }
      }
      
      return {
        message: applyTrinidadianStyle(questionList[questionIndex]),
        options: options
      };
    }
    
    // If we've gone through all the questions
    return {
      message: applyTrinidadianStyle("Thank you for sharing that information! It will help us understand your needs better. Would you like to continue with registration?"),
      options: [
        { id: "continue", label: "Yes, continue to registration" },
        { id: "questions", label: "I have more questions first" }
      ]
    };
  }

  // Fallback generic message with options
  return { 
    message: applyTrinidadianStyle("I'd be happy to help you. What would you like to know about our caregiving services?"),
    options: [
      { id: "family", label: "I need care for someone" },
      { id: "professional", label: "I provide care services" },
      { id: "community", label: "I want to support the community" }
    ]
  };
};
