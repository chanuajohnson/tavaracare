
import React from 'react';
import { ChatProvider, useChat } from './ChatProvider';
import { ChatbotLauncher } from './ChatbotLauncher';
import { FullScreenChatDialog } from './FullScreenChatDialog';

interface ChatbotSystemProps {
  children?: React.ReactNode;
  position?: 'left-of-fab' | 'bottom-right' | 'bottom-left' | 'above-fab';
  spacing?: number;
  className?: string;
}

// Inner component that uses the chat context
const ChatbotSystemInner: React.FC<Omit<ChatbotSystemProps, 'children'>> = ({
  position = 'above-fab',
  spacing = 24,
  className
}) => {
  const { isOpen, closeChat, isFullScreen, closeFullScreenChat } = useChat();
  
  return (
    <>
      {/* Regular floating chat launcher */}
      <ChatbotLauncher 
        position={position}
        spacing={spacing}
        className={className}
      />
      
      {/* Full-screen chat dialog */}
      <FullScreenChatDialog
        open={isFullScreen}
        onClose={closeFullScreenChat}
      />
    </>
  );
};

// Wrapper component that provides the chat context
export const ChatbotSystem: React.FC<ChatbotSystemProps> = ({
  children,
  ...props
}) => {
  return (
    <ChatProvider>
      {children}
      <ChatbotSystemInner {...props} />
    </ChatProvider>
  );
};
