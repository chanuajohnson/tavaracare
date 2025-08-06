
import React from 'react';
import { useChat } from './ChatProvider';
import { ChatbotLauncher } from './ChatbotLauncher';
import { FullScreenChatDialog } from './FullScreenChatDialog';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { AsyncErrorBoundary } from '@/components/common/AsyncErrorBoundary';

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
      <ErrorBoundary level="component" name="ChatbotLauncher">
        <ChatbotLauncher 
          position={position}
          spacing={spacing}
          className={className}
        />
      </ErrorBoundary>
      
      {/* Full-screen chat dialog */}
      {isFullScreen && (
        <AsyncErrorBoundary name="FullScreenChat">
          <FullScreenChatDialog
            open={isFullScreen}
            onClose={closeFullScreenChat}
          />
        </AsyncErrorBoundary>
      )}
    </>
  );
};

// Wrapper component that provides the chat context
export const ChatbotSystem: React.FC<ChatbotSystemProps> = ({
  children,
  ...props
}) => {
  try {
    // This will throw an error if no ChatProvider exists
    useChat();
    
    // If we get here, we're already inside a ChatProvider
    return <ChatbotSystemInner {...props} />;
  } catch (error) {
    console.error("ChatbotSystem: No ChatProvider found in context, component will not render properly", error);
    return null; // Return null to prevent rendering without proper context
  }
};
