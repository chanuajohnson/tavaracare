
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
      <div className="flex flex-wrap gap-4">
        <div className="p-4 border rounded-lg w-full sm:w-[calc(33%-1rem)]">
          <h2 className="text-lg font-medium mb-2">Role-Based Conversations</h2>
          <p className="text-sm text-gray-600">
            Personalized flows for families, professionals, and community members
          </p>
        </div>
        <div className="p-4 border rounded-lg w-full sm:w-[calc(33%-1rem)]">
          <h2 className="text-lg font-medium mb-2">Guided Interactions</h2>
          <p className="text-sm text-gray-600">
            Step-by-step questions based on the selected role
          </p>
        </div>
        <div className="p-4 border rounded-lg w-full sm:w-[calc(33%-1rem)]">
          <h2 className="text-lg font-medium mb-2">Registration Path</h2>
          <p className="text-sm text-gray-600">
            Collects key information before handing off to registration forms
          </p>
        </div>
      </div>
      
      {/* Place just the FAB with integrated chatbot */}
      <Fab
        position="bottom-right"
        icon={<HelpCircle className="h-5 w-5" />}
        className="bg-primary-500 hover:bg-primary-600 text-white"
      />
    </div>
  );
};
