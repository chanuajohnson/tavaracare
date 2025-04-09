
import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';

interface MessageProps {
  content: string;
  isUser: boolean;
  timestamp: number;
}

export const MessageBubble: React.FC<MessageProps> = ({ content, isUser, timestamp }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2 flex-shrink-0 self-end">
          <Bot size={16} className="text-primary" />
        </div>
      )}
      <div
        className={`rounded-lg px-4 py-2 max-w-[80%] ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        }`}
      >
        <div className="whitespace-pre-wrap break-words">{content}</div>
        <div className={`text-xs mt-1 ${isUser ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
          {new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center ml-2 flex-shrink-0 self-end">
          <User size={16} className="text-primary" />
        </div>
      )}
    </motion.div>
  );
};
