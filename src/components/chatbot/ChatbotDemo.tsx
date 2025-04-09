
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
        <div className="flex gap-4">
          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-medium mb-2">Default Position</h2>
            <p className="text-sm text-gray-600">
              Standard bottom-right positioning
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-medium mb-2">Left of FAB</h2>
            <p className="text-sm text-gray-600">
              Positioned to the left of a Floating Action Button
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-medium mb-2">Custom Width</h2>
            <p className="text-sm text-gray-600">
              Adjustable widget width for different screen sizes
            </p>
          </div>
        </div>
      </div>
      <ChatbotLauncher 
        position="left-of-fab" 
        className="bg-primary-500 hover:bg-primary-600 text-white" 
      />
    </ChatProvider>
  );
};
