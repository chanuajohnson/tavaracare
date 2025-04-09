
import React from 'react';
import { motion } from 'framer-motion';
import { ChatbotMessage, ChatSenderType, ChatMessageType } from '@/types/chatbotTypes';
import { ChatbotAvatar } from './ChatbotAvatar';
import { ChatOptions } from './ChatOptions';

interface ChatMessageProps {
  message: ChatbotMessage;
  onOptionSelect?: (value: string) => void;
}

export function ChatMessage({ message, onOptionSelect }: ChatMessageProps) {
  const isBot = message.senderType === ChatSenderType.BOT;
  const hasOptions = message.messageType === ChatMessageType.OPTION && 
    message.contextData?.options && 
    message.contextData.options.length > 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-2 mb-4 ${isBot ? '' : 'justify-end'}`}
    >
      {isBot && (
        <div className="flex-shrink-0">
          <ChatbotAvatar senderType={ChatSenderType.BOT} />
        </div>
      )}
      
      <div className={`max-w-[80%] flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
        <div
          className={`px-4 py-2 rounded-lg ${
            isBot
              ? 'bg-white border border-gray-200'
              : 'bg-primary-500 text-white'
          }`}
        >
          <p className="text-sm">{message.message}</p>
        </div>
        
        {hasOptions && (
          <ChatOptions 
            options={message.contextData?.options || []}
            onSelect={onOptionSelect} 
          />
        )}
      </div>
      
      {!isBot && (
        <div className="flex-shrink-0">
          <ChatbotAvatar senderType={ChatSenderType.USER} />
        </div>
      )}
    </motion.div>
  );
}
