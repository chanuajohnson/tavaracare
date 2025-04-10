
import React from 'react';
import { ChatProvider } from './ChatProvider';
import { ChatbotLauncher } from './ChatbotLauncher';
import { FullScreenChatDialog } from './FullScreenChatDialog';

export const ChatbotSystem: React.FC = () => {
  console.log('ChatbotSystem: Rendering ChatbotSystem with FullScreenChatDialog');
  return (
    <ChatProvider>
      <ChatbotLauncher 
        position="left-of-fab" 
        spacing={24}
        className="bg-primary-500 hover:bg-primary-600 text-white"
      />
      <FullScreenChatDialog />
    </ChatProvider>
  );
};
