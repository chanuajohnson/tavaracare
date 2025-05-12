
import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";

interface MessageProps {
  content: string;
  formattedContent?: string; // Add formattedContent prop
  isUser: boolean;
  timestamp: number;
  isNewSection?: boolean;
}

export const MessageBubble: React.FC<MessageProps> = ({ 
  content, 
  formattedContent,
  isUser, 
  timestamp,
  isNewSection = false
}) => {
  const isMobile = useIsMobile();
  
  // Use the pre-formatted content if available, otherwise use original content
  // This ensures we're not re-formatting on every render
  const displayContent = isUser ? content : (formattedContent || content);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2 flex-shrink-0 self-end">
          <Bot size={16} className="text-primary" />
        </div>
      )}
      <div
        className={`rounded-lg px-4 py-2.5 max-w-[78vw] sm:max-w-[70%] ${
          isUser
            ? "bg-primary text-primary-foreground"
            : isNewSection 
              ? "bg-primary/10 border-l-4 border-primary text-foreground"
              : "bg-muted text-foreground"
        }`}
      >
        <div className="whitespace-pre-wrap break-words overflow-hidden text-sm sm:text-base">
          {displayContent}
        </div>
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
