
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useChat } from './ChatProvider';
import { ChatbotWidget } from './ChatbotWidget';

interface ChatbotLauncherProps {
  position?: 'bottom-right' | 'bottom-left';
}

export const ChatbotLauncher: React.FC<ChatbotLauncherProps> = ({ 
  position = 'bottom-right' 
}) => {
  const { isOpen, toggleChat } = useChat();

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
  };

  return (
    <>
      {/* FAB button */}
      <motion.div 
        className={`fixed ${positionClasses[position]} z-50`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={toggleChat}
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90"
        >
          <MessageSquare size={24} />
        </Button>
      </motion.div>
      
      {/* Chatbot Widget */}
      {isOpen && <ChatbotWidget />}
    </>
  );
};
