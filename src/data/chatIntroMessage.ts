
import { ChatbotMessageType } from '@/types/chatbotTypes';

export const ChatIntroMessage = {
  message: "Hi there! I'm the Tavara Care Assistant. How can I help you today?",
  messageType: 'text' as ChatbotMessageType,
  options: [
    { label: "I need care for a loved one", value: "need_care" },
    { label: "I'm a caregiver looking for work", value: "offer_care" },
    { label: "I want to support my community", value: "community" }
  ]
};
