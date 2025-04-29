
import { phrasings } from '@/utils/chat/phrasings';

/**
 * Applies Trinidad & Tobago cultural style to messages
 */
export const applyTrinidadianStyle = (message: string): string => {
  // Don't modify empty messages
  if (!message) return message;

  // Random chance of applying each transformation for variety
  // Reduced probabilities for less frequent dialect phrases
  const shouldApplyGreeting = Math.random() < 0.15 && (message.includes('hello') || message.includes('hi') || message.match(/^(hi|hey|hello)\b/i));
  const shouldApplyAcknowledgment = Math.random() < 0.2 && (message.includes('thank') || message.includes('great') || message.includes('good'));
  const shouldApplyExpression = Math.random() < 0.15;
  const shouldApplyClosing = Math.random() < 0.1;

  let modifiedMessage = message;

  // Replace greetings
  if (shouldApplyGreeting) {
    const greetingIndex = Math.floor(Math.random() * phrasings.greetings.length);
    const greeting = phrasings.greetings[greetingIndex];
    modifiedMessage = modifiedMessage
      .replace(/\b(hello|hi|hey)\b/i, greeting);
  }

  // Add acknowledgments
  if (shouldApplyAcknowledgment) {
    const ackIndex = Math.floor(Math.random() * phrasings.acknowledgments.length);
    const acknowledgment = phrasings.acknowledgments[ackIndex];
    modifiedMessage = modifiedMessage
      .replace(/\b(thank you|thanks)\b/i, acknowledgment);
  }

  // Add expressions at the beginning
  if (shouldApplyExpression) {
    const exprIndex = Math.floor(Math.random() * phrasings.expressions.length);
    const expression = phrasings.expressions[exprIndex];
    
    // Make sure we're not doubling up expressions
    if (!modifiedMessage.includes(expression)) {
      modifiedMessage = `${expression} ${modifiedMessage}`;
    }
  }
  
  // Add closing expressions at the end
  if (shouldApplyClosing && (message.endsWith('.') || message.endsWith('?') || message.endsWith('!'))) {
    const closingOptions = [
      "Alright?",
      "Eh?",
      "Yes?",
      "For so!",
      "You see?",
      "You get me?",
      "Understand?"
    ];
    
    // Don't add closings to sentences that already have one
    if (!closingOptions.some(closing => message.includes(closing))) {
      const closing = closingOptions[Math.floor(Math.random() * closingOptions.length)];
      
      // Remove the ending punctuation and add the closing
      modifiedMessage = modifiedMessage.replace(/[.!?]$/, ` ${closing}`);
    }
  }

  // Remove AI-sounding phrases
  modifiedMessage = modifiedMessage
    .replace(/how would you like to engage with us today/gi, "how can I help you today")
    .replace(/engage with (our|the) platform/gi, "use Tavara")
    .replace(/engage with (our|the) service/gi, "use our service")
    .replace(/provide us with/gi, "give me")
    .replace(/we would like to know/gi, "I'd like to know")
    .replace(/please provide/gi, "please share")
    .replace(/please select/gi, "please choose")
    .replace(/please enter/gi, "please type");
  
  // Add more natural contractions
  modifiedMessage = modifiedMessage
    .replace(/\bit is\b/gi, "it's")
    .replace(/\byou are\b/gi, "you're")
    .replace(/\bdo not\b/gi, "don't")
    .replace(/\bcannot\b/gi, "can't")
    .replace(/\bi am\b/gi, "I'm")
    .replace(/\bwill not\b/gi, "won't")
    .replace(/\bwhat is\b/gi, "what's")
    .replace(/\bthat is\b/gi, "that's");
  
  // Ensure we have emoji occasionally, but not too many
  const hasEmoji = /[\u{1F300}-\u{1F6FF}]/u.test(modifiedMessage);
  if (!hasEmoji && Math.random() < 0.1) { // Reduced probability for emojis
    const emojis = ["😊", "👋", "✨", "🌺", "💯", "🙌", "👍", "🌴", "🏝️", "☀️"];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    // Add it near the end
    if (modifiedMessage.endsWith('.') || modifiedMessage.endsWith('!') || modifiedMessage.endsWith('?')) {
      modifiedMessage = modifiedMessage.slice(0, -1) + ` ${emoji}` + modifiedMessage.slice(-1);
    } else {
      modifiedMessage = `${modifiedMessage} ${emoji}`;
    }
  }

  return modifiedMessage;
};

/**
 * Slightly modify a message to avoid exact repetition
 */
export const avoidRepetition = (message: string): string => {
  // List of prefixes to add variety
  const prefixes = [
    "Just to be clear, ",
    "To clarify, ",
    "In other words, ",
    "Let me say it again, ",
    "What I meant was, ",
    "To put it another way, ",
    "Let me explain it differently, ",
    "For better understanding, "
  ];
  
  // Choose a random prefix
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  
  // Add the prefix to the message
  return prefix + message.charAt(0).toLowerCase() + message.slice(1);
};

/**
 * Apply validation error message with Trinidad & Tobago style
 */
export const stylizeValidationError = (errorType: string): string => {
  const errorResponses = phrasings.validationResponses[errorType as keyof typeof phrasings.validationResponses];
  if (!errorResponses || errorResponses.length === 0) {
    return "That doesn't seem right. Could you check it and try again?";
  }
  
  // Apply an expression randomly
  const shouldAddExpression = Math.random() < 0.3;
  let message = errorResponses[Math.floor(Math.random() * errorResponses.length)];
  
  if (shouldAddExpression) {
    const expression = phrasings.expressions[Math.floor(Math.random() * phrasings.expressions.length)];
    message = `${expression} ${message}`;
  }
  
  return message;
};
