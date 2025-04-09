
import React from 'react';
import { ChatProvider } from './ChatProvider';
import { ChatbotLauncher } from './ChatbotLauncher';
import { Fab } from '@/components/ui/fab';
import { HelpCircle } from 'lucide-react';

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
            <h2 className="text-lg font-medium mb-2">Side-by-Side Layout</h2>
            <p className="text-sm text-gray-600">
              Chatbot positioned to the left of FAB
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-medium mb-2">No Overlap</h2>
            <p className="text-sm text-gray-600">
              Components have appropriate spacing between them
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-medium mb-2">Responsive Design</h2>
            <p className="text-sm text-gray-600">
              Works on all screen sizes with proper spacing
            </p>
          </div>
        </div>
      </div>
      
      {/* Place both the ChatbotLauncher and FAB */}
      <ChatbotLauncher 
        position="left-of-fab"
        className="bg-primary-500 hover:bg-primary-600 text-white" 
      />
      
      <Fab
        position="bottom-right"
        icon={<HelpCircle className="h-5 w-5" />}
        className="bg-primary-500 hover:bg-primary-600 text-white"
      />
    </ChatProvider>
  );
};
