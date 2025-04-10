
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from './ChatProvider';
import { cn } from '@/lib/utils';

interface MicroChatBubbleProps {
  role: 'family' | 'professional' | 'community';
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

// Role-specific greeting messages with Trinidad & Tobago flavor
const roleGreetings: Record<string, { message: string, prompt: string }> = {
  family: {
    message: "Good day, friend! Yuh looking for family care, right? Let's get some quick info to connect yuh with the right care providers.",
    prompt: "Looking after a loved one? I can help—click here!"
  },
  professional: {
    message: "So you're a care pro? Let me help you register with Tavara. We have families looking for your skills right now!",
    prompt: "A care professional, eh? Let's get you hired—click here!"
  },
  community: {
    message: "Welcome! Discover how you can support your community with Tavara. Ready to sign up?",
    prompt: "Join the village and support your community—click here!"
  },
  default: {
    message: "Good day! How can Tavara help you today?",
    prompt: "Ready to begin? Let's pick your role!"
  }
};

export const MicroChatBubble: React.FC<MicroChatBubbleProps> = ({
  role,
  className,
  position = 'top'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { openChat } = useChat();
  
  // Don't show if user has dismissed
  if (isDismissed) {
    return null;
  }
  
  const greeting = roleGreetings[role] || roleGreetings.default;
  
  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };
  
  const handleStartChat = () => {
    // Store the selected role in localStorage for the main chat to pick up
    localStorage.setItem('tavara_chat_initial_role', role);
    openChat();
    setIsVisible(false);
  };
  
  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    setIsVisible(false);
  };
  
  return (
    <div 
      className={cn("relative cursor-pointer group", className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={handleStartChat}
    >
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className={cn(
              "absolute z-10 w-64 bg-white rounded-lg shadow-lg p-3 border border-gray-200",
              positionClasses[position]
            )}
          >
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-1 right-1 h-6 w-6 text-gray-500 hover:bg-gray-100 rounded-full"
              onClick={handleDismiss}
            >
              <X size={14} />
            </Button>
            <p className="text-sm">{greeting.message}</p>
            <div className="mt-2 text-right">
              <Button
                size="sm"
                variant="link"
                className="text-primary p-0"
                onClick={handleStartChat}
              >
                Continue →
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:underline">
        <MessageSquare size={16} className="text-primary" />
        <span>{greeting.prompt}</span>
      </div>
    </div>
  );
};
