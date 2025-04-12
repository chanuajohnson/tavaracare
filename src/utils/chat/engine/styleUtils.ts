
import { phrasings } from '@/utils/chat/phrasings';

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

/**
 * Slightly modify a message to avoid exact repetition
 */
export const avoidRepetition = (message: string): string => {
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
