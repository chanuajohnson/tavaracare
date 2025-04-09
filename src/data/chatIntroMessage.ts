
import { ChatOption } from "@/types/chatTypes";

/**
 * Returns the introductory message for the chat
 */
export const getIntroMessage = (): string => {
  return "Hi there 👋 I'm here to help you get started. Can you tell me how you'd like to engage with Tavara today?";
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
 * Returns community contribution options
 */
export const getCommunityOptions = (): ChatOption[] => {
  return [
    { id: "volunteer", label: "🙋 Volunteer, mentor or assist families" },
    { id: "innovator", label: "💡 Contribute tech or design skills to Tavara" },
    { id: "educator", label: "📚 Share expertise or educational resources" },
  ];
};

export type { ChatOption } from "@/types/chatTypes";
