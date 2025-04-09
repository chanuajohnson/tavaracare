
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
    { id: "family", label: "👪 I'm looking for care for a loved one" },
    { id: "professional", label: "👩‍⚕️ I'm a professional caregiver" },
    { 
      id: "community", 
      label: "🤝 I want to help or get involved",
      subtext: "Includes volunteers, educators, and tech innovators" 
    },
  ];
};

/**
 * Returns follow-up messages based on the selected role
 */
export const getRoleFollowupMessage = (role: string): string => {
  switch (role) {
    case "family":
      return "I understand you're looking for care for a loved one. I'll help guide you through the process of finding the right support.";
    
    case "professional":
      return "Welcome, professional caregiver! I can help you connect with families who need your expertise and experience.";
    
    case "community":
      return "Thank you for your interest in helping! Whether you're interested in volunteering, education, or technology, there are many ways to contribute to our community.";
    
    default:
      return "Thank you for reaching out. Let me guide you through the next steps.";
  }
};

export type { ChatOption } from "@/types/chatTypes";
