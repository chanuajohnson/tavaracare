
import { ChatbotMessage } from '@/types/chatbotTypes';

export const ChatIntroMessage: ChatbotMessage = {
  senderType: 'bot',
  message: "Hi there 👋 Looking for care support or wanting to get involved? What brings you here today?",
  messageType: 'option',
  options: [
    { label: "🏠 I'm looking for care for a loved one", value: 'family' },
    { label: "👩‍⚕️ I'm a care professional", value: 'professional' },
    { label: "🫂 I want to help or contribute to the community", value: 'community' },
  ]
};
