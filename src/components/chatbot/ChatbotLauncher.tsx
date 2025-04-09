
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useChat } from './ChatProvider';
import { ChatbotWidget } from './ChatbotWidget';
import { cn } from '@/lib/utils';

interface ChatbotLauncherProps {
  position?: 'left-of-fab' | 'bottom-right' | 'bottom-left';
  spacing?: number; // Space in px between FAB and chatbot
  width?: string;  // Width of the chatbot widget
  className?: string;
}

export const ChatbotLauncher: React.FC<ChatbotLauncherProps> = ({ 
  position = 'left-of-fab',
  spacing = 24, // Default spacing of 24px (6rem)
  width = '320px',
  className
}) => {
  const { isOpen, toggleChat } = useChat();

  // Calculate positions based on the selected layout
  const fabPositionClasses = {
    'left-of-fab': 'bottom-6 right-6',
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
  };

  // Calculate chatbot position based on the selected layout and spacing
  const getChatbotPositionClasses = () => {
    const fabWidth = 56; // Width of FAB in px (14 * 4)
    
    switch(position) {
      case 'left-of-fab':
        // Position to the left of the FAB with the specified spacing
        return `fixed bottom-6 right-[calc(${fabWidth}px+${spacing}px)]`;
      case 'bottom-right':
        return 'fixed bottom-6 right-6';
      case 'bottom-left':
        return 'fixed bottom-6 left-6';
      default:
        return 'fixed bottom-6 right-6';
    }
  };

  return (
    <>
      {/* FAB button */}
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
      
      {/* Chatbot Widget */}
      {isOpen && (
        <div className={cn(getChatbotPositionClasses(), "z-40")}>
          <ChatbotWidget 
            width={width}
            onClose={toggleChat}
          />
        </div>
      )}
    </>
  );
};
