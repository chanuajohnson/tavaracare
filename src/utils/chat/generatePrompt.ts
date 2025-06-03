
import { ChatMessage, ChatOption } from '@/types/chatTypes';
import { phrasings } from './phrasings';
import { getRegistrationFlowByRole, ChatRegistrationQuestion } from "@/data/chatRegistrationFlows";
import { getCurrentQuestion } from '@/services/chat/responseUtils';
import { getChatCompletion } from '@/services/aiService';

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
  console.log("Generating prompt for:", { role, sectionIndex, questionIndex });
  
  // Get the current question from the registration flow
  const question = getCurrentQuestion(role, sectionIndex, questionIndex);
  
  if (!question) {
    console.warn("No question found for specified indices");
    return {
      message: "Let's continue with your registration. What would you like to share next?",
      options: [
        { id: "restart", label: "Start over" },
        { id: "form", label: "Switch to form view" }
      ]
    };
  }

  console.log("Found question:", { questionLabel: question.label, questionType: question.type });
  
  // Extract the user's name if they've provided it already
  const userName = extractUserName(chatHistory);
  
  // Create a personalized greeting when we know the user's name
  const personalizedGreeting = userName ? `${userName}, ` : '';
  
  // Check if we're starting a new section
  const isNewSection = questionIndex === 0;
  
  // Use OpenAI to generate a context-aware prompt for the current question
  try {
    // Format the chat history for the AI
    const formattedHistory = formatChatHistoryForAI(chatHistory);
    
    // Create a system prompt for the AI
    const systemPrompt = `You are a warm, friendly assistant for Tavara.care, helping someone register for a caregiving platform in Trinidad & Tobago.

Current role: ${role}
Current question: ${question.label}
Question type: ${question.type}
${isNewSection ? "This is the first question in a new section." : "This is a question in the middle of a section."}
${userName ? `The user's name is ${userName}.` : "We don't know the user's name yet."}

Your task is to generate a warm, conversational prompt for the next question in our registration flow. 
Use Trinidad & Tobago friendly language, be warm but professional.

Guidelines:
- Keep it concise (1-3 sentences)
- Sound like a real person, not a form
- Avoid robotic language like "Please enter your email address"
- Include occasional friendly expressions when appropriate
- If this is the first question in a new section, add a brief transition
- If we know the user's name, personalize the message
- Don't sound overly corporate or stiff
- NEVER start sentences with "a" (like "a, what's your name?")
- NEVER use "Yuh" as it sounds artificial

Examples:
- Instead of "Email Address:" say "What's an email I can reach you at?"
- Instead of "Select availability" say "When would you usually be available to provide care?"
- Add brief transitions like "Great! Now let's talk about your availability."

The resulting prompt should match the tone of a friendly person in Trinidad & Tobago.`;

    // Call OpenAI to generate the prompt
    const aiResponse = await getChatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Please generate a conversational prompt for: "${question.label}"` }
      ],
      sessionId: 'prompt-generation',
      userRole: role
    });
    
    if (aiResponse.error) {
      throw new Error(`Error generating AI prompt: ${aiResponse.error}`);
    }
    
    // Get the generated prompt
    let promptMessage = aiResponse.message;
    
    // Clean up any problematic phrases
    promptMessage = cleanupPrompt(promptMessage);
    
    // Apply additional warmth if needed
    if (!promptMessage.includes(userName) && userName) {
      promptMessage = `${personalizedGreeting}${promptMessage}`;
    }
    
    console.log("AI generated prompt:", promptMessage);
    
    // For select/multiselect/checkbox questions, provide options
    if (question.type === 'select' || question.type === 'multiselect' || question.type === 'checkbox') {
      const options = question.options?.map(option => ({
        id: option,
        label: option
      }));
      
      return {
        message: promptMessage,
        options
      };
    }
    
    // For confirm questions, provide yes/no options
    if (question.type === 'confirm') {
      return {
        message: promptMessage,
        options: [
          { id: "yes", label: "Yes" },
          { id: "no", label: "No" }
        ]
      };
    }
    
    // For text input, just return the message
    return { message: promptMessage };
  } catch (error) {
    console.error("Error using AI to generate prompt:", error);
    
    // Fallback to the simple prompt generation if AI fails
    return generateSimplePrompt(question, personalizedGreeting, isNewSection);
  }
};

/**
 * Clean up problematic phrases from the AI-generated prompt
 */
const cleanupPrompt = (prompt: string): string => {
  // Remove "a," at the beginning of sentences
  let cleanedPrompt = prompt.replace(/^a,\s*/i, '');
  cleanedPrompt = cleanedPrompt.replace(/\.\s+a,\s*/g, '. ');
  
  // Remove "Yuh" phrases
  cleanedPrompt = cleanedPrompt.replace(/\byuh\b/gi, '');
  
  // Fix any double spaces
  cleanedPrompt = cleanedPrompt.replace(/\s{2,}/g, ' ');
  
  // Fix any punctuation issues from removals
  cleanedPrompt = cleanedPrompt.replace(/\s+\./g, '.');
  cleanedPrompt = cleanedPrompt.replace(/\s+\?/g, '?');
  cleanedPrompt = cleanedPrompt.replace(/\s+\!/g, '!');
  cleanedPrompt = cleanedPrompt.replace(/\s+,/g, ',');
  
  return cleanedPrompt;
};

/**
 * Fallback prompt generator that doesn't use AI
 */
const generateSimplePrompt = (
  question: ChatRegistrationQuestion,
  personalizedGreeting: string,
  isNewSection: boolean
): PromptResponse => {
  // Add warmth and cultural style to the prompt
  const warmPrompt = addWarmth(question.label, personalizedGreeting, isNewSection);
  
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
  // Look for name in chat responses
  for (const message of chatHistory) {
    if (message.isUser && message.content) {
      // This is a very simple implementation
      const content = message.content.trim();
      if (content && !content.includes(' ') && content.length < 30) {
        return content; // Simple heuristic for a name
      }
    }
  }
  
  // If no obvious name found from messages, look for name patterns in content
  for (const message of chatHistory) {
    if (message.isUser && message.content) {
      // Look for "my name is" patterns
      const nameMatch = message.content.match(/(?:my name is|i am|i'm) (\w+)/i);
      if (nameMatch && nameMatch[1]) {
        return nameMatch[1];
      }
    }
  }
  
  return null;
};

/**
 * Adds warmth and cultural style to the prompt
 */
const addWarmth = (prompt: string, personalizedGreeting: string, isNewSection: boolean): string => {
  // Convert formal field labels to conversational questions
  if (prompt.includes("First Name")) {
    return `${personalizedGreeting ? personalizedGreeting + "now " : ""}what's your first name?`;
  }
  
  if (prompt.includes("Last Name")) {
    return `${personalizedGreeting ? "Thanks! And " : ""}what's your last name?`;
  }
  
  if (prompt.includes("Email Address") || prompt.includes("Email")) {
    return `${personalizedGreeting ? personalizedGreeting + " " : ""}what email address can we use to reach you?`;
  }

  if (prompt.includes("Phone Number") || prompt.includes("Phone")) {
    return `${personalizedGreeting ? personalizedGreeting + " " : ""}what's a good phone number to contact you?`;
  }

  // Pick a random greeting if we're at the start of a section
  let warmPrompt = prompt;
  
  // Add a section transition if this is the first question in a section
  if (isNewSection) {
    const transitions = [
      "Great! Now let's talk about ",
      "Excellent! Moving on to ",
      "Thanks for that. Next, let's focus on ",
      "Well nice! Let's switch to talking about ",
    ];
    
    const transition = transitions[Math.floor(Math.random() * transitions.length)];
    warmPrompt = `${transition}${warmPrompt.toLowerCase()}`;
  }

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

  // Clean up any problematic phrases (like starting with "a," or using "Yuh")
  return cleanupPrompt(warmPrompt);
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
