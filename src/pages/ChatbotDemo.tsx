
import React from 'react';
import { ChatInterface } from '@/components/chatbot/ChatInterface';

const ChatbotDemo = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Chatbot Demo</h1>
      <div className="max-w-xl mx-auto">
        <ChatInterface />
      </div>
    </div>
  );
};

export default ChatbotDemo;
