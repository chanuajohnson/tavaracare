
import React, { useState, useEffect } from 'react';
import { useChat } from './ChatProvider';
import { MessageCircle, X } from 'lucide-react';
import { ChatbotWidget } from './ChatbotWidget';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatbotLauncherProps {
  position?: 'left-of-fab' | 'bottom-right' | 'bottom-left' | 'above-fab';
  spacing?: number;
  className?: string;
}

export const ChatbotLauncher: React.FC<ChatbotLauncherProps> = ({
  position = 'above-fab',
  spacing = 24,
  className
}) => {
  const { isOpen, toggleChat, closeChat } = useChat();
  const [isExiting, setIsExiting] = useState(false);
  const isMobile = useIsMobile();
  
  // Calculate position-based classes and styles
  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-right':
        return {
          style: { 
            right: spacing,
            bottom: spacing
          },
          containerClass: 'right-0 bottom-0',
          buttonClass: ''
        };
      case 'bottom-left':
        return {
          style: { 
            left: spacing, 
            bottom: spacing 
          },
          containerClass: 'left-0 bottom-0',
          buttonClass: ''
        };
      case 'left-of-fab':
        return {
          style: {
            right: 76 + spacing,
            bottom: spacing
          },
          containerClass: 'right-0 bottom-0',
          buttonClass: ''
        };
      case 'above-fab':
      default:
        return {
          style: {
            right: spacing,
            bottom: 76 + spacing
          },
          containerClass: 'right-0 bottom-0',
          buttonClass: ''
        };
    }
  };
  
  const { style, containerClass, buttonClass } = getPositionStyles();
  
  // Handle animation timing
  useEffect(() => {
    if (!isOpen) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setIsExiting(false);
      }, 300); // Match the transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  return (
    <div
      className={cn(
        "fixed overflow-visible z-40",
        containerClass,
        className
      )}
      style={style}
    >
      {/* Chat widget */}
      {isOpen && (
        <div 
          className={`${isMobile ? 'fixed inset-0 z-50 flex items-end justify-center bg-black/20' : 'absolute mb-2 bottom-full right-0'}`}
        >
          <div 
            className={`transition-all duration-300 ${
              isExiting ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'
            }`}
          >
            <ChatbotWidget
              width={isMobile ? "100%" : "320px"}
              onClose={closeChat}
            />
          </div>
        </div>
      )}
      
      {/* Toggle button */}
      <button
        onClick={toggleChat}
        className={cn(
          "h-12 w-12 rounded-full bg-primary shadow-lg flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95",
          buttonClass
        )}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X size={22} />
        ) : (
          <MessageCircle size={22} />
        )}
      </button>
    </div>
  );
};
