import { phrasings } from '@/utils/chat/phrasings';

// Tracking for previously used dialect phrases to avoid repetition
let lastUsedDialectPhrases: Record<string, string> = {
  alright: '',
  greeting: '',
  thankYou: '',
  affirmative: '',
  confirmation: '',
  email: '',
  phone: ''
};

/**
 * Get a random item from an array that's different from the last used item
 * @param items Array of items to choose from
 * @param category Category key for tracking last used item
 */
export const getVariedPhrase = (items: string[], category: string): string => {
  if (!items || items.length === 0) return '';
  
  // Filter out the last used phrase to avoid repetition
  const availableItems = items.filter(item => item !== lastUsedDialectPhrases[category]);
  
  // If we've exhausted all options or there's only one, reset and use any
  if (availableItems.length === 0) {
    const randomIndex = Math.floor(Math.random() * items.length);
    lastUsedDialectPhrases[category] = items[randomIndex];
    return items[randomIndex];
  }
  
  // Pick a random phrase from available options
  const randomIndex = Math.floor(Math.random() * availableItems.length);
  const selectedPhrase = availableItems[randomIndex];
  
  // Store this phrase as the last used one for this category
  lastUsedDialectPhrases[category] = selectedPhrase;
  
  return selectedPhrase;
};

/**
 * Get appropriate format guidance for a field type
 * @param fieldType Type of field (email, phone, etc.)
 */
export const getFormatGuidance = (fieldType: string | null): string => {
  if (!fieldType) return '';
  
  switch (fieldType.toLowerCase()) {
    case 'email':
      return getVariedPhrase(phrasings.formatGuidance.email, 'email');
    case 'phone':
      return getVariedPhrase(phrasings.formatGuidance.phone, 'phone');
    case 'name':
      return getVariedPhrase(phrasings.formatGuidance.name, 'name');
    default:
      return '';
  }
};

/**
 * Apply Trinidadian cultural style transformations to messages
 * @param message Message to transform
 * @param messageType Optional context type (greeting, confirmation, etc.)
 * @param fieldType Optional field type for format guidance
 */
export const formatDialect = (
  message: string, 
  messageType: 'greeting' | 'transition' | 'confirmation' | 'question' | 'response' = 'response',
  fieldType: string | null = null
): string => {
  if (!message) return message;
  
  let formattedMessage = message;
  
  // Start with message-wide replacements, only for complete phrases at the start
  if (formattedMessage.startsWith('Alright') || formattedMessage.match(/^Alright[,\.]/)) {
    const replacement = getVariedPhrase(phrasings.trinidadianDialect.alrightVariants, 'alright');
    formattedMessage = formattedMessage.replace(/^Alright[,\.\s]*/i, `${replacement} `);
  }
  
  // Replace greeting phrases if this is a greeting message
  if (messageType === 'greeting') {
    if (formattedMessage.match(/\b(Hello|Hi there)\b/i)) {
      const replacement = getVariedPhrase(phrasings.trinidadianDialect.greetingVariants, 'greeting');
      formattedMessage = formattedMessage.replace(/\b(Hello|Hi there)\b/i, replacement);
    }
  }
  
  // Replace thank you phrases
  formattedMessage = formattedMessage.replace(
    /\b(Thank you|Thanks)\b/i, 
    () => getVariedPhrase(phrasings.trinidadianDialect.thankYouVariants, 'thankYou')
  );
  
  // Add format guidance for input fields if applicable
  if (fieldType && (formattedMessage.toLowerCase().includes(fieldType.toLowerCase()) || 
      messageType === 'question')) {
    const guidance = getFormatGuidance(fieldType);
    
    // Only add guidance if it's not already included and there is guidance to add
    if (guidance && !formattedMessage.includes('example:') && !formattedMessage.includes('format:')) {
      formattedMessage = `${formattedMessage} ${guidance}`;
    }
  }
  
  return formattedMessage;
};

/**
 * Apply Trinidadian style transformations to a message
 * Enhanced version with varied expressions and tracked usage
 */
export const applyTrinidadianStyle = (message: string, fieldType: string | null = null): string => {
  return formatDialect(message, 'response', fieldType);
};

/**
 * Checks if a message is a repeat of the last message
 * @param sessionId Session ID to track messages
 * @param message Message to check
 */
export const isRepeatMessage = (sessionId: string, message: string): boolean => {
  // Retrieve the last message for this session from local storage
  const lastMessage = localStorage.getItem(`lastMessage_${sessionId}`);
  
  // If the current message is the same as the last message, it's a repeat
  return lastMessage === message;
};

/**
 * Prevents repetition in messages by adding a phrase
 * @param message Message to modify
 */
export const avoidRepetition = (message: string): string => {
  // Add a phrase to the message to avoid repetition
  const phrases = [
    "So, ",
    "Well, ",
    "Okay, ",
    "Right, ",
    "Now, "
  ];
  const phrase = phrases[Math.floor(Math.random() * phrases.length)];
  return phrase + message;
};

/**
 * Stores the last message in local storage to check for repetition
 * @param sessionId Session ID to track messages
 * @param message Message to store
 */
export const setLastMessage = (sessionId: string, message: string): void => {
  // Store the message in local storage
  localStorage.setItem(`lastMessage_${sessionId}`, message);
};

// Export the new utilities for use elsewhere
export { phrasings } from '@/utils/chat/phrasings';
