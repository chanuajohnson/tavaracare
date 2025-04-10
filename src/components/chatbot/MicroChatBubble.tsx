
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from './ChatProvider';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { createPortal } from 'react-dom';
import { roleGreetings } from '@/data/chatIntroMessage';

interface MicroChatBubbleProps {
  role: 'family' | 'professional' | 'community';
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const MicroChatBubble: React.FC<MicroChatBubbleProps> = ({
  role,
  className,
  position = 'top'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { setInitialRole, setFullScreen, openChat } = useChat();
  const isMobile = useIsMobile();
  const [bubbleRect, setBubbleRect] = useState<DOMRect | null>(null);
  const bubbleRef = React.useRef<HTMLDivElement>(null);
  
  // Don't show if user has dismissed
  if (isDismissed) {
    return null;
  }
  
  const greeting = roleGreetings[role] || roleGreetings.default;
  
  const handleStartChat = () => {
    console.log('MicroChatBubble: Starting chat with role:', role);
    
    // Store the selected role in localStorage for the main chat to pick up
    localStorage.setItem('tavara_chat_initial_role', role);
    setInitialRole(role);
    
    // Open chat in full-screen mode
    openChat(); // Ensure the chat is open first
    setFullScreen(true); // Then set full screen mode
    setIsVisible(false);
    
    console.log('MicroChatBubble: Chat should now be in full screen mode');
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
          
          {/* Render text label using portal to appear on top of everything */}
          {isVisible && !isMobile && createPortal(
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="fixed whitespace-nowrap bg-white text-primary-900 text-sm py-1 px-2 rounded shadow-sm z-[1000]"
              style={{
                top: bubbleRect ? bubbleRect.top + bubbleRect.height/2 - 10 : 0,
                left: bubbleRect ? bubbleRect.right + 10 : 0,
              }}
            >
              {greeting.prompt}
            </motion.div>,
            document.body
          )}
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
            onClick={handleStartChat}
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
            {/* Removed the Continue button and arrow */}
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
