
import React from 'react';
import { ChatbotProvider } from '@/contexts/ChatbotContext';
import ChatbotInterface from '@/components/chatbot/ChatbotInterface';

const ChatbotTestPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto bg-card rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-4">Chatbot Demo</h1>
        <p className="text-muted-foreground mb-8">
          This page demonstrates the Tavara Care chatbot capabilities. The chatbot is designed to
          engage visitors, qualify potential families, and guide them through registration.
        </p>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Features</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Initial engagement with friendly greeting</li>
            <li>Need assessment through conversation</li>
            <li>Qualification and information gathering</li>
            <li>Personalized responses based on user input</li>
            <li>Conversion actions when appropriate</li>
          </ul>
          
          <div className="bg-muted p-4 rounded-md mt-6">
            <p className="font-medium">Try asking the chatbot:</p>
            <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
              <li>What types of care services do you offer?</li>
              <li>I need help with elder care</li>
              <li>How much do your services cost?</li>
              <li>I want to sign up as a caregiver</li>
              <li>I need urgent care for my mother</li>
            </ul>
          </div>
        </div>
      </div>
      
      <ChatbotProvider>
        <ChatbotInterface />
      </ChatbotProvider>
    </div>
  );
};

export default ChatbotTestPage;
