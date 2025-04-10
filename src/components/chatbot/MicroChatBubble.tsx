
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from './ChatProvider';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { createPortal } from 'react-dom';

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
  const [bubbleRect, setBubbleRect] = useState<DOMRect | null>(null);
  const bubbleRef = React.useRef<HTMLDivElement>(null);
  
  // Don't show if user has dismissed
  if (isDismissed) {
    return null;
  }
  
  const greeting = roleGreetings[role] || roleGreetings.default;
  
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
    ? { 
        onClick: handleStartChat,
        ref: bubbleRef 
      } 
    : { 
        onMouseEnter: () => {
          setBubbleRect(bubbleRef.current?.getBoundingClientRect() || null);
          setIsVisible(true);
        },
        onMouseLeave: () => setIsVisible(false),
        onClick: handleStartChat,
        ref: bubbleRef
      };

  // Calculate popup position based on the bubble's position and selected position type
  const getPopupPosition = () => {
    if (!bubbleRect) return {};
    
    const positions = {
      top: {
        bottom: window.innerHeight - bubbleRect.top + 5,
        left: bubbleRect.left + bubbleRect.width/2 - 128, // center the 256px popup
      },
      bottom: {
        top: bubbleRect.bottom + 5,
        left: bubbleRect.left + bubbleRect.width/2 - 128,
      },
      left: {
        top: bubbleRect.top,
        right: window.innerWidth - bubbleRect.left + 5,
      },
      right: {
        top: bubbleRect.top,
        left: bubbleRect.right + 5,
      }
    };
    
    return positions[position];
  };
  
  return (
    <div 
      className={cn("relative cursor-pointer", className)}
      {...handleInteraction}
    >
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

      {/* Render popup in a portal to avoid stacking context issues */}
      {isVisible && bubbleRect && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed z-[1000] w-64 bg-white rounded-lg shadow-lg p-3 border border-gray-200"
            style={{
              ...getPopupPosition(),
              position: 'fixed'
            }}
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
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
