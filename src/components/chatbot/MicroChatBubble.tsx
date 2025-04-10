
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from './ChatProvider';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MicroChatBubbleProps {
  role: 'family' | 'professional' | 'community';
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

// Role-specific greeting messages with Trinidad & Tobago flavor
const roleGreetings: Record<string, { message: string, prompt: string }> = {
  family: {
    message: "You're looking for the right caregiver, aren't you? Let me get a few details so we can match you with Tavara.care caregivers who meet your needs.",
    prompt: "Let's get you that care you need"
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

export const MicroChatBubble: React.FC<MicroChatBubbleProps> = ({
  role,
  className,
  position = 'top'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { openChat } = useChat();
  const isMobile = useIsMobile();
  
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

  // Adjust interactions for mobile vs desktop
  const handleInteraction = isMobile 
    ? { onClick: handleStartChat } 
    : { 
        onMouseEnter: () => setIsVisible(true),
        onMouseLeave: () => setIsVisible(false),
        onClick: handleStartChat
      };
  
  return (
    <div 
      className={cn("relative cursor-pointer", className)}
      {...handleInteraction}
    >
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={cn(
              "absolute z-50 w-64 bg-white rounded-lg shadow-lg p-3 border border-gray-200",
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
      
      <div className="flex items-center justify-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white shadow-md relative"
        >
          <MessageCircle size={20} />
          
          {/* Text label that appears on desktop hover */}
          <AnimatePresence>
            {isVisible && !isMobile && (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="absolute left-full ml-2 whitespace-nowrap bg-white text-primary-900 text-sm py-1 px-2 rounded shadow-sm"
              >
                {greeting.prompt}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};
