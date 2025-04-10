
import { ChatOption } from "@/types/chatTypes";

/**
 * Returns a random introductory message for the chat from a predefined list
 */
export const getIntroMessage = (): string => {
  const introMessages = [
    "Welcome to Tavara! Are you here to find care for someone, or are you a caregiver looking for opportunities?",
    "Hi there, happy to have you here. Can you tell me if you're looking for care—or looking to provide it?",
    "Good day and welcome! Are you hoping to connect with a caregiver, or interested in joining our team?",
    "Hello and welcome to Tavara. Just to get started—are you here as someone seeking care or as a professional caregiver?",
    "Warm welcome! Can I help you find trusted care for a loved one, or are you looking to offer your caregiving services?",
    "Nice to meet you! Are you looking for support at home or hoping to offer support as a caregiver?",
    "Welcome! Are you hoping to match with a caregiver, or are you looking for work as one?",
    "Hi there! Are you looking for care for someone in your life, or are you hoping to join Tavara as a caregiver?",
    "Good day! Would you like help finding a caregiver—or are you here to explore caregiving jobs?",
    "Hello and thanks for visiting Tavara. Are you here to request care or offer it?",
    "Welcome to Tavara! Just to get you started—are you looking to hire a caregiver or to find caregiving work?",
    "Hi! Are you here today as someone looking for support, or as someone ready to provide it?",
    "Good to see you here. Are you hoping to find reliable care or to join Tavara as a caregiver?",
    "Hello and welcome! May I ask—are you here to arrange care for someone or to apply as a caregiver?",
    "Thanks for stopping by! Are you looking for care for a loved one, or are you a caregiver seeking new opportunities?",
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
    "How often do you need care? Daily, weekly, or for specific hours?",
    "When would you like to start receiving care?",
    "Do you have any specific requirements or preferences for your caregiver?"
  ];
  
  const professionalQuestions = [
    "What type of caregiving do you specialize in?",
    "How many years of experience do you have in caregiving?",
    "Do you have any certifications or special training?",
    "What areas of Trinidad & Tobago are you available to work in?",
    "What is your typical availability? (Days, evenings, weekends)"
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
    message: "Not sure if you're leaning toward family care or professional caregiver services?",
    prompt: "Let's chat and figure things out"
  },
  professional: {
    message: "So you're a care pro? Let me help you register with Tavara. We have families looking for your skills right now!",
    prompt: "Let's get you hired"
  },
  community: {
    message: "Welcome! Discover how you can support your community with Tavara. Ready to sign up?",
    prompt: "Here to support or for Tech?"
  },
  default: {
    message: "Good day! How can Tavara help you today?",
    prompt: "Let's chat"
  }
};

export type { ChatOption } from "@/types/chatTypes";
