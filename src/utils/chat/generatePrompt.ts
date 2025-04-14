
import { ChatMessage, ChatOption } from '@/types/chatTypes';
import { phrasings } from './phrasings';
import { getRegistrationFlowByRole, ChatRegistrationQuestion } from "@/data/chatRegistrationFlows";
import { getCurrentQuestion } from '@/services/chat/responseUtils';

interface PromptResponse {
  message: string;
  options?: ChatOption[];
}

/**
 * Generates a natural, culturally appropriate prompt based on user role, chat history,
 * and the next field in the registration flow.
 */
export const generatePrompt = async (
  role: string,
  chatHistory: ChatMessage[],
  sectionIndex: number,
  questionIndex: number
): Promise<PromptResponse> => {
  // Get the current question from the registration flow
  const question = getCurrentQuestion(role, sectionIndex, questionIndex);
  
  if (!question) {
    return {
      message: "Let's continue with your registration. What would you like to share next?",
      options: [
        { id: "restart", label: "Start over" },
        { id: "form", label: "Switch to form view" }
      ]
    };
  }

  // Extract the user's name if they've provided it already
  const userName = extractUserName(chatHistory);
  
  // Create a personalized greeting when we know the user's name
  const personalizedGreeting = userName ? `${userName}, ` : '';
  
  // Add warmth and cultural style to the prompt
  const warmPrompt = addWarmth(question.label, personalizedGreeting);
  
  // For select/multiselect/checkbox questions, provide options
  if (question.type === 'select' || question.type === 'multiselect' || question.type === 'checkbox') {
    const options = question.options?.map(option => ({
      id: option,
      label: option
    }));
    
    return {
      message: warmPrompt,
      options
    };
  }
  
  // For confirm questions, provide yes/no options
  if (question.type === 'confirm') {
    return {
      message: warmPrompt,
      options: [
        { id: "yes", label: "Yes" },
        { id: "no", label: "No" }
      ]
    };
  }
  
  // For text input, just return the warm message
  return { message: warmPrompt };
};

/**
 * Extracts the user's name from chat history if available
 */
const extractUserName = (chatHistory: ChatMessage[]): string | null => {
  // Look for first_name or full_name in the chat history
  for (const message of chatHistory) {
    if (message.isUser && message.content) {
      // This is a very simple implementation that assumes the first user message
      // might contain their name. In a real implementation, we would need more
      // sophisticated logic to extract the name.
      const content = message.content.trim();
      if (content && !content.includes(' ') && content.length < 30) {
        return content; // Simple heuristic for a name
      }
    }
  }
  return null;
};

/**
 * Adds warmth and cultural style to the prompt
 */
const addWarmth = (prompt: string, personalizedGreeting: string): string => {
  // Pick a random greeting if we're at the start of a section
  let warmPrompt = prompt;

  // Replace standard question structure with more conversational tone
  warmPrompt = warmPrompt.replace(
    /what is your (.*?)\?/i,
    (match, field) => `${personalizedGreeting}what's your ${field}?`
  );
  
  warmPrompt = warmPrompt.replace(
    /please (select|choose|provide) (.*)/i,
    (match, verb, rest) => `${personalizedGreeting}could you ${verb} ${rest}?`
  );

  // Add occasional cultural expressions
  if (Math.random() < 0.3) {
    const expressions = phrasings.expressions;
    const randomExpression = expressions[Math.floor(Math.random() * expressions.length)];
    warmPrompt = `${randomExpression} ${warmPrompt}`;
  }

  // Add occasional acknowledgments for continuing flow
  if (personalizedGreeting && Math.random() < 0.5) {
    const acknowledgments = phrasings.acknowledgments;
    const randomAcknowledgment = acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
    warmPrompt = `${randomAcknowledgment}! ${warmPrompt}`;
  }

  return warmPrompt;
};

/**
 * Convert chat history to OpenAI-compatible format for context
 */
export const formatChatHistoryForAI = (chatHistory: ChatMessage[], limit = 10): { role: string, content: string }[] => {
  // Take the most recent messages up to the limit
  const recentMessages = chatHistory.slice(-limit);
  
  return recentMessages.map(msg => ({
    role: msg.isUser ? 'user' : 'assistant',
    content: msg.content
  }));
};

/**
 * Apply Trinidadian tone to a message
 */
export const toTriniTone = (text: string): string => {
  // Apply Trinidadian cultural style to a message
  // This is a simplified implementation, actual implementation would be more nuanced
  
  // Replace formal phrases with more casual ones
  let result = text
    .replace(/how are you/gi, "how yuh going")
    .replace(/hello|hi /gi, "hiya ")
    .replace(/thank you very much/gi, "thanks plenty")
    .replace(/good morning/gi, "mornin'");
  
  // Add occasional expressions
  if (Math.random() < 0.2) {
    const endings = ["eh?", "for true!", "nah?"];
    const ending = endings[Math.floor(Math.random() * endings.length)];
    if (!result.endsWith("?") && !result.endsWith("!")) {
      result = result.replace(/\.$/, ` ${ending}`);
    }
  }
  
  return result;
};
