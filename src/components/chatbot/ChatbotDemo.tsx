
import React from 'react';
import { ChatProvider } from './ChatProvider';
import { ChatbotLauncher } from './ChatbotLauncher';

export const ChatbotDemo: React.FC = () => {
  return (
    <ChatProvider>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Chatbot Demo</h1>
        <p className="mb-4">
          Click on the chat button in the bottom right corner to test the chatbot.
        </p>
      </div>
      <ChatbotLauncher position="bottom-right" />
    </ChatProvider>
  );
};
