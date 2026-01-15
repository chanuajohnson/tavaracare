
import { ChatOption } from "@/types/chatTypes";

/**
 * Returns a random introductory message for the chat from a predefined list
 */
export const getIntroMessage = (): string => {
  const introMessages = [
    "Welcome to Tavara! Are you looking for care for someone, or are you a caregiver?",
    "Hi there! Need help finding a caregiver, or are you looking to offer care?",
    "Good day! Are you here to find care or to provide care services?",
    "Hello! Are you looking for a caregiver or would you like to work as one?",
    "Welcome! Are you searching for care support or offering your caregiving skills?",
    "Hi! Need help finding care for a loved one, or are you a care professional?",
    "Good day! Looking for a caregiver or want to join as a care provider?",
    "Welcome to Tavara! Here for care or to provide care?",
    "Hello there! Need care assistance or offering your services?",
    "Hi! Are you looking to find a caregiver or become one?",
  ];
  
  // Get a random message from the list
  const randomIndex = Math.floor(Math.random() * introMessages.length);
  return introMessages[randomIndex];
};

/**
 * Returns the role selection options for the chat
 */
export const getRoleOptions = (): ChatOption[] => {
  return [
    { 
      id: "family", 
      label: "👪 I'm looking for care for a loved one",
      subtext: "We'll ask about their care needs, schedule, and your preferences."
    },
    { 
      id: "professional", 
      label: "👩‍⚕️ I'm a professional caregiver",
      subtext: "You'll share your experience, availability, and care specialties."
    },
    { 
      id: "community", 
      label: "🤝 I want to help or get involved",
      subtext: "Whether you're a volunteer or innovator, we'd love to collaborate." 
    },
  ];
};

/**
 * Returns follow-up messages based on the selected role
 */
export const getRoleFollowupMessage = (role: string): string => {
  switch (role) {
    case "family":
      return "I understand you're looking for care for a loved one. Let's collect some information to help match you with the right professional.";
    
    case "professional":
      return "Welcome, professional caregiver! I'll ask you a few questions to understand your expertise and help connect you with families who need your skills.";
    
    case "community":
      return "Thank you for your interest in helping! I'll ask a few questions to understand how you'd like to contribute to our caregiving community.";
    
    default:
      return "Thank you for reaching out. Let me guide you through the next steps.";
  }
};

/**
 * Returns questions for the next step based on user role and current question index
 */
export const getNextQuestion = (role: string, questionIndex: number): string => {
  const familyQuestions = [
    "Who are you seeking care for? A parent, spouse, child, or someone else?",
    "What type of care assistance do you need? For example, daily activities, medical care, companionship?",
    "What schedule works best for your care needs? We have options from standard daytime shifts to 24/7 care.",
    "When would you like to start receiving care?",
    "Do you have any specific requirements or preferences for your caregiver?"
  ];
  
  const professionalQuestions = [
    "What type of caregiving do you specialize in?",
    "How many years of experience do you have in caregiving?",
    "Do you have any certifications or special training?",
    "What areas of Trinidad & Tobago are you available to work in?",
    "What's your typical availability? We have options from standard shifts to live-in care."
  ];
  
  const communityQuestions = [
    "What skills or resources can you contribute to our caregiving community?",
    "Are you interested in volunteering, mentoring, or some other form of support?",
    "How much time can you commit to community support activities?",
    "Do you have previous experience in community or caregiving initiatives?",
    "What motivated you to get involved with our caregiving community?"
  ];
  
  let questions: string[];
  
  switch (role) {
    case "family":
      questions = familyQuestions;
      break;
    case "professional":
      questions = professionalQuestions;
      break;
    case "community":
      questions = communityQuestions;
      break;
    default:
      return "What else would you like to know about our services?";
  }
  
  // Return the appropriate question based on the index, or a final message if we've gone through all questions
  if (questionIndex < questions.length) {
    return questions[questionIndex];
  } else {
    return "Thank you for sharing all this information! It will help us better assist you with your needs.";
  }
};

/**
 * Returns community contribution options
 */
export const getCommunityOptions = (): ChatOption[] => {
  return [
    { id: "volunteer", label: "🙋 Volunteer, mentor or assist families" },
    { id: "innovator", label: "💡 Contribute tech or design skills to Tavara" },
    { id: "educator", label: "📚 Share expertise or educational resources" },
  ];
};

/**
 * Returns role-specific greeting messages with Trinidad & Tobago flavor
 */
export const roleGreetings: Record<string, { message: string, prompt: string }> = {
  family: {
    message: "Need help finding care for a loved one?",
    prompt: "Let's chat about care options"
  },
  professional: {
    message: "Are you a care professional? Let's get you connected with families who need your skills!",
    prompt: "Join as a caregiver"
  },
  community: {
    message: "Want to support your community through Tavara?",
    prompt: "Get involved"
  },
  default: {
    message: "How can I help you today?",
    prompt: "Let's chat"
  }
};

export type { ChatOption } from "@/types/chatTypes";
