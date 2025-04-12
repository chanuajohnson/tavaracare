import { getChatCompletion, convertToOpenAIMessages, syncMessagesToSupabase } from '@/services/aiService';
import { getIntroMessage, getRoleFollowupMessage, getRoleOptions } from '@/data/chatIntroMessage';
import { ChatMessage, ChatOption } from '@/types/chatTypes';
import { phrasings } from '@/utils/chat/phrasings';
import {
  getCurrentQuestion,
  generateNextQuestionMessage,
  isEndOfSection,
  isEndOfFlow,
  generateDataSummary,
  getSectionTitle
} from '@/services/chatbotService';
import { getRegistrationFlowByRole } from '@/data/chatRegistrationFlows';

export interface ChatConfig {
  mode: 'ai' | 'scripted' | 'hybrid';
  temperature?: number;
  fallbackThreshold?: number; // Number of retries before falling back to scripted
}

// Default configuration
export const defaultChatConfig: ChatConfig = {
  mode: 'ai',
  temperature: 0.7,
  fallbackThreshold: 2
};

// Interface for tracking retry attempts
interface RetryState {
  count: number;
  lastError: string | null;
}

// Keep track of retry attempts per session
const retryStates = new Map<string, RetryState>();

// Get or initialize retry state for a session
const getRetryState = (sessionId: string): RetryState => {
  if (!retryStates.has(sessionId)) {
    retryStates.set(sessionId, { count: 0, lastError: null });
  }
  return retryStates.get(sessionId)!;
};

// Reset retry state for a session
const resetRetryState = (sessionId: string): void => {
  retryStates.set(sessionId, { count: 0, lastError: null });
};

// Keep track of the last message sent to avoid repetition
const lastMessages = new Map<string, string>();

/**
 * Processes the conversation and generates the next message
 */
export const processConversation = async (
  messages: ChatMessage[],
  sessionId: string,
  userRole: string | null,
  questionIndex: number,
  config: ChatConfig = defaultChatConfig
): Promise<{ message: string; options?: ChatOption[] }> => {
  // For intro stage or scripted mode, use scripted flow
  if (config.mode === 'scripted' || messages.length === 0) {
    return handleScriptedFlow(messages, userRole, sessionId, questionIndex);
  }

  // Handle registration flow once a role is selected
  if (userRole && questionIndex > 0) {
    return handleRegistrationFlow(messages, userRole, sessionId, questionIndex);
  }

  // For AI or hybrid modes, try the AI flow first
  if (config.mode === 'ai' || config.mode === 'hybrid') {
    try {
      const aiResponse = await handleAIFlow(messages, sessionId, userRole, questionIndex);
      
      // Reset retry count after successful AI response
      resetRetryState(sessionId);
      
      return aiResponse;
    } catch (error) {
      console.error('Error in AI flow:', error);
      
      // Update retry state
      const retryState = getRetryState(sessionId);
      retryState.count++;
      retryState.lastError = error instanceof Error ? error.message : 'Unknown error';
      
      // If hybrid mode and exceeded fallback threshold, fall back to scripted
      if (config.mode === 'hybrid' && retryState.count > (config.fallbackThreshold || 2)) {
        console.log(`Falling back to scripted mode after ${retryState.count} failed AI attempts`);
        return handleScriptedFlow(messages, userRole, sessionId, questionIndex);
      }
      
      // Otherwise, return an error message with options
      return { 
        message: `Sorry, I'm having trouble understanding. Please select one of the options below:`,
        options: [
          { id: "family", label: "I need care for someone" },
          { id: "professional", label: "I provide care services" },
          { id: "community", label: "I want to support the community" },
          { id: "restart", label: "Start over" }
        ]
      };
    }
  }

  // Default fallback
  return handleScriptedFlow(messages, userRole, sessionId, questionIndex);
};

/**
 * Handle registration flow with structured questions based on the selected role
 */
const handleRegistrationFlow = async (
  messages: ChatMessage[],
  userRole: string,
  sessionId: string,
  questionIndex: number
): Promise<{ message: string; options?: ChatOption[] }> => {
  try {
    // Extract the section index from the progress
    // For this implementation, we'll use questionIndex / 10 as the section index
    // This allows up to 10 questions per section
    const sectionIndex = Math.floor(questionIndex / 10);
    const questionInSectionIndex = questionIndex % 10;
    
    // If we've reached the end of all sections
    if (isEndOfFlow(userRole, sectionIndex)) {
      return {
        message: `Thank you for providing all this information! This will help us get you set up with the right care services. Would you like to proceed to the registration form with this information pre-filled?`,
        options: [
          { id: "proceed_to_registration", label: "Yes, proceed to registration" },
          { id: "talk_to_representative", label: "I'd like to talk to a representative first" }
        ]
      };
    }
    
    // If we've reached the end of the current section
    if (isEndOfSection(userRole, sectionIndex, questionInSectionIndex)) {
      // Prepare to move to the next section
      const nextSectionIndex = sectionIndex + 1;
      
      if (nextSectionIndex < getRegistrationFlowByRole(userRole).sections.length) {
        const nextSectionTitle = getSectionTitle(userRole, nextSectionIndex);
        
        return {
          message: `Great! Let's move on to the next section: ${nextSectionTitle}. Are you ready to continue?`,
          options: [
            { id: "continue", label: "Yes, continue" },
            { id: "take_break", label: "I need a break" }
          ]
        };
      }
    }
    
    // Generate the next question based on the role, section, and question index
    const questionResponse = generateNextQuestionMessage(userRole, sectionIndex, questionInSectionIndex);
    
    if (!questionResponse) {
      // If we couldn't generate a question, provide a generic fallback
      return {
        message: "Can you tell me more about your care needs?",
        options: [
          { id: "medical_care", label: "Medical care" },
          { id: "daily_assistance", label: "Daily assistance" },
          { id: "companionship", label: "Companionship" }
        ]
      };
    }
    
    // Return the generated question and options
    return questionResponse;
  } catch (error) {
    console.error('Error in registration flow:', error);
    
    // Fallback response
    return { 
      message: `I'm sorry, I'm having trouble with our registration process. You can also register using our form instead.`,
      options: [
        { id: "retry", label: "Try again" },
        { id: "go_to_form", label: "Go to registration form" }
      ]
    };
  }
};

/**
 * Handles AI-based conversation flow
 */
const handleAIFlow = async (
  messages: ChatMessage[],
  sessionId: string,
  userRole: string | null,
  questionIndex: number
): Promise<{ message: string; options?: ChatOption[] }> => {
  // Convert messages to OpenAI format
  const openAIMessages = convertToOpenAIMessages(messages);

  // Add role context to help the AI generate better responses
  let systemPrompt = `You are Tavara, a friendly assistant for Tavara.care, a platform connecting families with caregivers in Trinidad & Tobago.
    
Use warm, conversational language with occasional local phrases from Trinidad & Tobago like "${phrasings.greetings.join('", "')}" or "${phrasings.acknowledgments.join('", "')}" or expressions like "${phrasings.expressions.join('", "')}" to sound authentic but not overdone.

${userRole ? `The user has indicated they are a ${userRole}.` : ''}
${userRole === 'family' ? "Help them find caregiving support for their loved ones." : ''}
${userRole === 'professional' ? "Help them register as a caregiver on our platform." : ''}
${userRole === 'community' ? "Help them find ways to contribute to our caregiving community." : ''}

You are currently helping them through the registration process. We are at question ${questionIndex + 1}.
Keep your responses concise (1-3 sentences), friendly, and focused on gathering relevant information.
Do NOT list multiple questions at once. Focus on ONE question at a time.

Keep your responses natural and conversational. Use direct, warm language that reflects how real people speak.
DO NOT use phrases like "how would you like to engage with us today" or other artificial corporate language.`;

  // Special instructions for first interaction
  if (!userRole && messages.length <= 3) {
    systemPrompt += `\n\nSince this is the beginning of our conversation, help the user identify which role they fall into (family, professional, or community) so we can direct them to the right registration flow. Be warm and welcoming.`;
  }

  // Add system message if it doesn't exist already
  if (!openAIMessages.some(msg => msg.role === 'system')) {
    openAIMessages.unshift({
      role: 'system',
      content: systemPrompt
    });
  }

  // Call the AI service
  const response = await getChatCompletion({
    messages: openAIMessages,
    sessionId,
    userRole: userRole || undefined
  });

  if (response.error) {
    throw new Error(`AI service error: ${response.error}`);
  }

  // Process the AI response
  const message = response.message || "I'm here to help you with your caregiving needs.";
  
  // Apply T&T cultural transformations
  const styledMessage = applyTrinidadianStyle(message);
  
  // Check for repetition and fix if necessary
  const finalMessage = lastMessages.has(sessionId) && lastMessages.get(sessionId) === styledMessage 
    ? avoidRepetition(styledMessage)
    : styledMessage;
  
  // Store this message for repetition detection
  lastMessages.set(sessionId, finalMessage);
  
  // Always provide options for the user to select from if at the beginning of the conversation
  let options: ChatOption[] | undefined;
  if (!userRole && messages.length <= 3) {
    options = [
      { id: "family", label: "I need care for someone" },
      { id: "professional", label: "I provide care services" },
      { id: "community", label: "I want to support the community" }
    ];
  } else if (questionIndex < 5) {
    // For subsequent questions, provide some contextual options based on the question
    // This ensures users can click rather than type free text
    switch (userRole) {
      case 'family':
        if (questionIndex === 0) {
          options = [
            { id: "parent", label: "For my parent" },
            { id: "spouse", label: "For my spouse" },
            { id: "child", label: "For my child" },
            { id: "other", label: "Someone else" }
          ];
        } else if (questionIndex === 1) {
          options = [
            { id: "daily_activities", label: "Help with daily activities" },
            { id: "medical", label: "Medical care" },
            { id: "companionship", label: "Companionship" },
            { id: "specialized", label: "Specialized care" }
          ];
        }
        break;
      case 'professional':
        if (questionIndex === 0) {
          options = [
            { id: "home_care", label: "Home care" },
            { id: "medical_care", label: "Medical care" },
            { id: "therapy", label: "Therapy" },
            { id: "specialized", label: "Specialized care" }
          ];
        } else if (questionIndex === 1) {
          options = [
            { id: "0-2", label: "0-2 years" },
            { id: "3-5", label: "3-5 years" },
            { id: "5-10", label: "5-10 years" },
            { id: "10+", label: "10+ years" }
          ];
        }
        break;
    }
  }
  
  return { message: finalMessage, options };
};

/**
 * Handles scripted conversation flow
 */
const handleScriptedFlow = (
  messages: ChatMessage[],
  userRole: string | null,
  sessionId: string,
  questionIndex: number
): { message: string; options?: ChatOption[] } => {
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
    return handleRegistrationFlow(messages, userRole, sessionId, questionIndex);
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

/**
 * Get a random intro message that won't repeat the last one
 */
const getRandomIntroMessage = (sessionId: string): string => {
  const introMessage = getIntroMessage();
  
  // Check if this message is the same as the last one
  if (lastMessages.has(sessionId) && lastMessages.get(sessionId) === introMessage) {
    // Try again to get a different message
    return getRandomIntroMessage(sessionId);
  }
  
  // Store this message and return it
  lastMessages.set(sessionId, introMessage);
  return introMessage;
};

/**
 * Slightly modify a message to avoid exact repetition
 */
const avoidRepetition = (message: string): string => {
  // List of prefixes to add variety
  const prefixes = [
    "Just to confirm, ",
    "To be clear, ",
    "In other words, ",
    "Let me rephrase that, ",
    "What I meant was, ",
  ];
  
  // Choose a random prefix
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  
  // Add the prefix to the message
  return prefix + message.toLowerCase();
};

/**
 * Applies Trinidad & Tobago cultural style to messages
 */
export const applyTrinidadianStyle = (message: string): string => {
  // Don't modify empty messages
  if (!message) return message;

  // Random chance of applying each transformation for variety
  const shouldApplyGreeting = Math.random() < 0.3 && (message.includes('hello') || message.includes('hi'));
  const shouldApplyAcknowledgment = Math.random() < 0.4 && (message.includes('thank') || message.includes('great'));
  const shouldApplyExpression = Math.random() < 0.2;

  let modifiedMessage = message;

  // Replace greetings
  if (shouldApplyGreeting) {
    const greetingIndex = Math.floor(Math.random() * phrasings.greetings.length);
    const greeting = phrasings.greetings[greetingIndex];
    modifiedMessage = modifiedMessage
      .replace(/\b(hello|hi)\b/i, greeting);
  }

  // Add acknowledgments
  if (shouldApplyAcknowledgment) {
    const ackIndex = Math.floor(Math.random() * phrasings.acknowledgments.length);
    const acknowledgment = phrasings.acknowledgments[ackIndex];
    modifiedMessage = modifiedMessage
      .replace(/\b(thank you|thanks)\b/i, acknowledgment);
  }

  // Add expressions
  if (shouldApplyExpression) {
    const exprIndex = Math.floor(Math.random() * phrasings.expressions.length);
    const expression = phrasings.expressions[exprIndex];
    
    // 50% chance to add at beginning, 50% at end
    if (Math.random() < 0.5) {
      modifiedMessage = `${expression} ${modifiedMessage}`;
    } else {
      modifiedMessage = `${modifiedMessage} ${expression}`;
    }
  }

  // Remove AI-sounding phrases
  modifiedMessage = modifiedMessage
    .replace(/how would you like to engage with us today/gi, "how can I help you today")
    .replace(/engage with (our|the) platform/gi, "use Tavara")
    .replace(/engage with (our|the) service/gi, "use our service");

  return modifiedMessage;
};
