
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useChat } from './ChatProvider';
import { ChatbotWidget } from './ChatbotWidget';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

interface ChatbotLauncherProps {
  position?: 'left-of-fab' | 'bottom-right' | 'bottom-left' | 'above-fab';
  spacing?: number; // Space in px between FAB and chatbot
  width?: string;  // Width of the chatbot widget
  className?: string;
}

// Create a wrapper component that handles the case when no ChatProvider exists
export const ChatbotLauncher: React.FC<ChatbotLauncherProps> = (props) => {
  try {
    return <ChatbotLauncherInner {...props} />;
  } catch (error) {
    console.error("ChatbotLauncher error:", error);
    return (
      <motion.div 
        className="fixed bottom-24 right-6 z-50 safe-bottom"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <Button
          onClick={() => toast.error("Chat system is not available. Please refresh the page.")}
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
        >
          <MessageSquare size={24} />
        </Button>
      </motion.div>
    );
  }
};

// Main component implementation that uses the hook
const ChatbotLauncherInner: React.FC<ChatbotLauncherProps> = ({ 
  position = 'above-fab',
  spacing = 24, // Default spacing of 24px
  width = '320px',
  className
}) => {
  const { isOpen, toggleChat, closeChat, isFullScreen } = useChat();
  const isMobile = useIsMobile();
  
  // Adjust spacing for mobile
  const mobileSpacing = isMobile ? 16 : spacing;
  const safeBottomSpacing = isMobile ? 'env(safe-area-inset-bottom, 16px)' : '0px';

  // Don't render the floating chat if we're in full-screen mode
  if (isFullScreen) {
    return null;
  }

  // Calculate positions based on the selected layout
  const fabPositionClasses = {
    'left-of-fab': `bottom-[calc(${mobileSpacing}px + ${safeBottomSpacing})] right-[calc(${mobileSpacing}px + env(safe-area-inset-right, 0px))]`,
    'bottom-right': `bottom-[calc(${mobileSpacing}px + ${safeBottomSpacing})] right-[calc(${mobileSpacing}px + env(safe-area-inset-right, 0px))]`,
    'bottom-left': `bottom-[calc(${mobileSpacing}px + ${safeBottomSpacing})] left-[calc(${mobileSpacing}px + env(safe-area-inset-left, 0px))]`,
    'above-fab': `bottom-[calc(${mobileSpacing}px + ${safeBottomSpacing})] right-[calc(${mobileSpacing}px + env(safe-area-inset-right, 0px))]`,
  };

  // Calculate chatbot position based on the selected layout and spacing
  const getChatbotPositionClasses = () => {
    const fabWidth = 56; // Width of FAB in px (14 * 4)
    const fabHeight = 56; // Height of FAB in px (14 * 4)
    
    switch(position) {
      case 'left-of-fab':
        return `fixed bottom-[calc(${mobileSpacing}px + ${safeBottomSpacing})] right-[calc(${fabWidth + mobileSpacing * 2}px + env(safe-area-inset-right, 0px))]`;
      case 'above-fab':
        return `fixed bottom-[calc(${fabHeight + mobileSpacing * 2}px + ${safeBottomSpacing})] right-[calc(${mobileSpacing}px + env(safe-area-inset-right, 0px))]`;
      case 'bottom-right':
        return `fixed bottom-[calc(${mobileSpacing}px + ${safeBottomSpacing})] right-[calc(${mobileSpacing}px + env(safe-area-inset-right, 0px))]`;
      case 'bottom-left':
        return `fixed bottom-[calc(${mobileSpacing}px + ${safeBottomSpacing})] left-[calc(${mobileSpacing}px + env(safe-area-inset-left, 0px))]`;
      default:
        return `fixed bottom-[calc(${mobileSpacing}px + ${safeBottomSpacing})] right-[calc(${mobileSpacing}px + env(safe-area-inset-right, 0px))]`;
    }
  };

  return (
    <>
      {/* Standalone FAB button (only used if not integrated with the main FAB) */}
      {!position.includes('fab') && (
        <motion.div 
          className={`fixed ${fabPositionClasses[position]} z-50`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={toggleChat}
            size="icon"
            className={cn("h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90", className)}
          >
            <MessageSquare size={24} />
          </Button>
        </motion.div>
      )}
      
      {/* Chatbot Widget - with improved positioning and responsive width */}
      {isOpen && !isFullScreen && (
        <div className={cn(getChatbotPositionClasses(), "z-40", isMobile && "left-4 right-4")}>
          <ChatbotWidget 
            width={isMobile ? "100%" : width}
            onClose={closeChat}
          />
        </div>
      )}
    </>
  );
};
