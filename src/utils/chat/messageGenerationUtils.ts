
import { getRegistrationFlowByRole } from "@/data/chatRegistrationFlows";
import { ChatResponseData } from "@/services/chat/types";
import { phrasings } from "@/utils/chat/phrasings";
import { getFormatGuidance } from "@/utils/chat/engine/styleUtils";

// Track the last used transition phrase to avoid repetition
let lastUsedTransitionPhrase = '';

// Track the last used question intro to avoid repetition
let lastUsedQuestionIntro = '';

/**
 * Get a random transition phrase that's not the same as the last used one
 */
const getRandomTransitionPhrase = (): string => {
  if (!phrasings.transitions || phrasings.transitions.length === 0) {
    return "Now let's talk about";
  }
  
  // Filter out the last used phrase to avoid repetition
  const availablePhrases = phrasings.transitions.filter(phrase => phrase !== lastUsedTransitionPhrase);
  
  // Get a random phrase from the available options
  const randomIndex = Math.floor(Math.random() * availablePhrases.length);
  const selectedPhrase = availablePhrases[randomIndex];
  
  // Store this phrase as the last used one
  lastUsedTransitionPhrase = selectedPhrase;
  
  return selectedPhrase;
};

/**
 * Get a random question introduction that's not the same as the last used one
 */
const getRandomQuestionIntro = (): string => {
  if (!phrasings.questionIntros || phrasings.questionIntros.length === 0) {
    return "";
  }
  
  // Filter out the last used intro to avoid repetition
  const availableIntros = phrasings.questionIntros.filter(intro => intro !== lastUsedQuestionIntro);
  
  // Get a random intro from the available options
  const randomIndex = Math.floor(Math.random() * availableIntros.length);
  const selectedIntro = availableIntros[randomIndex];
  
  // Store this intro as the last used one
  lastUsedQuestionIntro = selectedIntro;
  
  return selectedIntro;
};

/**
 * Generate next question message based on role, section and question index
 */
export const generateNextQuestionMessage = (
  role: string,
  sectionIndex: number,
  questionIndex: number,
  isFirstQuestion: boolean = false
): ChatResponseData => {
  try {
    const flow = getRegistrationFlowByRole(role);
    
    if (
      sectionIndex < 0 ||
      sectionIndex >= flow.sections.length ||
      questionIndex < 0 ||
      questionIndex >= flow.sections[sectionIndex].questions.length
    ) {
      return {
        message: "I'm not sure what to ask next. Let's try something else.",
        options: [
          { id: "restart", label: "Start over" },
          { id: "form", label: "Fill out registration form" }
        ]
      };
    }
    
    const section = flow.sections[sectionIndex];
    const question = section.questions[questionIndex];
    
    // For select/multi-select, provide options
    let options;
    if (
      question.type === "select" ||
      question.type === "multi-select"
    ) {
      options = question.options?.map(option => ({
        id: option.value,
        label: option.label
      }));
    }
    
    // Get a random question intro to add variety
    const questionIntro = getRandomQuestionIntro();
    
    // Use the question text with random intro for variety
    let message = questionIntro + question.text;
    
    // Detect field type for format guidance
    let fieldType: string | null = null;
    const questionText = (question.text || "").toLowerCase();
    const questionId = (question.id || "").toLowerCase();
    
    if (questionId.includes("email") || questionText.includes("email")) {
      fieldType = "email";
    } else if (questionId.includes("phone") || questionText.includes("phone") || questionText.includes("contact number")) {
      fieldType = "phone";
    } else if (questionId.includes("name") || questionText.includes("name")) {
      fieldType = "name";
    }
    
    // Add format guidance for specific field types
    if (fieldType) {
      const guidance = getFormatGuidance(fieldType);
      if (guidance) {
        message = `${message} ${guidance}`;
      }
    }
    
    // Add special prompts for specific question types based on question ID or text
    if (question.id === "budget") {
      message = `${questionIntro}${question.text} Please specify an hourly range (e.g., $20-30/hour) or say 'Negotiable'.`;
    }
    
    // For multi-select questions, add instruction
    if (question.type === "multi-select") {
      message = `${questionIntro}${question.text} (Please select all that apply)`;
      
      // Add "Done selecting" option for multi-select
      if (options && options.length > 0) {
        options.push({ id: "done_selecting", label: "✓ Done selecting" });
      }
    }
    
    // Add section title handling - consider if this is the very first question after role selection
    if (isFirstQuestion) {
      // For the first question after role selection, use a more natural format
      message = `${message}`;
    }
    else if (questionIndex === 0) {
      // Only add section transition for subsequent sections, not the first one after role selection
      const transitionPhrase = getRandomTransitionPhrase();
      message = `${transitionPhrase} ${section.title.toLowerCase()}.\n\n${message}`;
    }
    
    return {
      message,
      options
    };
  } catch (err) {
    console.error("Error generating question message:", err);
    return {
      message: "I'm sorry, I encountered an error. Would you like to try again?",
      options: [
        { id: "retry", label: "Try again" },
        { id: "form", label: "Go to registration form" }
      ]
    };
  }
};
