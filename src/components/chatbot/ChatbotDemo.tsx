
import React from 'react';
import { ChatProvider } from './ChatProvider';
import { Fab } from '@/components/ui/fab';
import { HelpCircle } from 'lucide-react';

export const ChatbotDemo: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Chatbot Demo</h1>
      <p className="mb-4">
        Click on the support button in the bottom right corner and select "Chat with Assistant" to test the chatbot.
      </p>
      <div className="flex gap-4">
        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-medium mb-2">Integrated with FAB</h2>
          <p className="text-sm text-gray-600">
            Chatbot accessible through the FAB menu
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-medium mb-2">Clean Interface</h2>
          <p className="text-sm text-gray-600">
            No UI clutter with multiple floating buttons
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-medium mb-2">Responsive Design</h2>
          <p className="text-sm text-gray-600">
            Works on all screen sizes consistently
          </p>
        </div>
      </div>
      
      {/* Place just the FAB with integrated chatbot */}
      <Fab
        position="bottom-right"
        icon={<HelpCircle className="h-5 w-5" />}
        className="bg-primary-500 hover:bg-primary-600 text-white"
        showMenu={true}
      />
    </div>
  );
};
