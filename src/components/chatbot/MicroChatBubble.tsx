
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from './ChatProvider';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { createPortal } from 'react-dom';
import { roleGreetings } from '@/data/chatIntroMessage';
import { toast } from 'sonner';

interface MicroChatBubbleProps {
  role: 'family' | 'professional' | 'community';
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  useFullScreen?: boolean;
}

export const MicroChatBubble: React.FC<MicroChatBubbleProps> = ({
  role,
  className,
  position = 'top',
  useFullScreen = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const isMobile = useIsMobile();
  const [bubbleRect, setBubbleRect] = useState<DOMRect | null>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // Animation timing effect
  useEffect(() => {
    if (isVisible) {
      setIsMounted(true);
    } else {
      const timer = setTimeout(() => {
        setIsMounted(false);
      }, 300); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [isVisible]);
  
  // Try to get chat context, if it fails, provide fallback behavior
  let chatContextAvailable = true;
  let openChat = () => {};
  let openFullScreenChat = () => {};
  let setInitialRole = (role: string | null) => {};
  
  try {
    const chatContext = useChat();
    openChat = chatContext.openChat;
    openFullScreenChat = chatContext.openFullScreenChat;
    setInitialRole = chatContext.setInitialRole;
    chatContextAvailable = true;
  } catch (error) {
    console.error('MicroChatBubble: No ChatProvider found in context', error);
    chatContextAvailable = false;
    
    // Fallback functions to avoid crashes but notify the user
    openChat = () => {
      toast.error("Chat functionality is not available. Please refresh the page.");
      console.warn('MicroChatBubble: openChat called but no ChatProvider available');
    };
    openFullScreenChat = openChat;
    setInitialRole = () => {};
  }
  
  // Don't show if user has dismissed
  if (isDismissed) {
    return null;
  }
  
  const greeting = roleGreetings[role] || roleGreetings.default;
  
  const handleStartChat = (e: React.MouseEvent) => {
    // Prevent event from bubbling up
    e.stopPropagation();
    e.preventDefault();
    
    console.log('MicroChatBubble: handleStartChat called', { role, useFullScreen });
    
    if (!chatContextAvailable) {
      toast.error("Chat functionality is not available. Please refresh the page.");
      return;
    }
    
    // Store the selected role using both methods to ensure it's available
    localStorage.setItem('tavara_chat_initial_role', role);
    setInitialRole(role);
    
    if (useFullScreen) {
      console.log('MicroChatBubble: Opening full screen chat');
      openFullScreenChat();
    } else {
      console.log('MicroChatBubble: Opening regular chat');
      openChat();
    }
    
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
        <div
          className={cn(
            "h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white shadow-md relative transition-transform hover:scale-105 active:scale-95",
            {
              "bg-blue-600": role === "family",
              "bg-green-600": role === "professional",
              "bg-amber-600": role === "community"
            }
          )}
          title={`Chat about ${role} care`}
        >
          <MessageCircle size={20} />
          
          {/* Render text label using portal to appear on top of everything */}
          {isVisible && !isMobile && chatContextAvailable && createPortal(
            <div 
              className={`fixed whitespace-nowrap bg-white text-primary-900 text-sm py-1 px-2 rounded shadow-sm z-[1000] transition-all duration-300 ${
                isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[10px]'
              }`}
              style={{
                top: bubbleRect ? bubbleRect.top + bubbleRect.height/2 - 10 : 0,
                left: bubbleRect ? bubbleRect.right + 10 : 0,
              }}
            >
              {greeting.prompt}
            </div>,
            document.body
          )}
        </div>
      </div>

      {/* Render popup in a portal to avoid stacking context issues */}
      {isMounted && bubbleRect && chatContextAvailable && createPortal(
        <div
          className={`fixed z-[1000] w-64 bg-white rounded-lg shadow-lg p-3 border border-gray-200 transition-all duration-300 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
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
        </div>,
        document.body
      )}
    </div>
  );
};
