
import React from 'react';
import { Button } from '@/components/ui/button';
import { useChatbot } from '@/contexts/ChatbotContext';
import { MessageSquare, UserRoundPlus, CalendarCheck, Headphones } from 'lucide-react';

const suggestions = [
  {
    text: "I need care services",
    icon: <MessageSquare className="h-3 w-3 mr-1" />,
    message: "I'm looking for a caregiver for my parent."
  },
  {
    text: "I'm a healthcare professional",
    icon: <UserRoundPlus className="h-3 w-3 mr-1" />,
    message: "I'm a nurse looking for caregiver opportunities."
  },
  {
    text: "How does matching work?",
    icon: <CalendarCheck className="h-3 w-3 mr-1" />,
    message: "Can you explain how your caregiver matching process works?"
  },
  {
    text: "Talk to support",
    icon: <Headphones className="h-3 w-3 mr-1" />,
    action: "handoff"
  }
];

const ChatbotSuggestions: React.FC = () => {
  const { sendMessage, requestHandoff } = useChatbot();
  
  const handleSuggestionClick = (suggestion: typeof suggestions[number]) => {
    if (suggestion.action === "handoff") {
      requestHandoff();
    } else if (suggestion.message) {
      sendMessage(suggestion.message);
    }
  };
  
  return (
    <div className="flex flex-wrap gap-2 py-1">
      {suggestions.map((suggestion, index) => (
        <Button 
          key={index} 
          variant="outline" 
          size="sm"
          className="text-xs h-7"
          onClick={() => handleSuggestionClick(suggestion)}
        >
          {suggestion.icon}
          {suggestion.text}
        </Button>
      ))}
    </div>
  );
};

export default ChatbotSuggestions;
