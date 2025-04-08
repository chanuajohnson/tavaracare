
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Bot, User, AlertCircle } from 'lucide-react';
import { ChatbotMessage } from '@/types/chatbot';
import { format } from 'date-fns';

interface ChatMessageProps {
  message: ChatbotMessage;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.senderType === 'user';
  const isSystem = message.senderType === 'system';
  
  return (
    <div className={cn(
      "flex w-full",
      isUser ? "justify-end" : "justify-start"
    )}>
      {!isUser && !isSystem && (
        <Avatar className="h-8 w-8 mr-2">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        "max-w-[80%] px-4 py-2 rounded-lg text-sm",
        isUser && "bg-primary text-primary-foreground rounded-tr-none",
        isSystem && "bg-muted/50 text-foreground border border-muted",
        !isUser && !isSystem && "bg-muted text-foreground rounded-tl-none"
      )}>
        {isSystem && (
          <div className="flex items-center mb-1 text-amber-500">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span className="text-xs font-medium">System Message</span>
          </div>
        )}
        
        <p className="whitespace-pre-wrap">{message.message}</p>
        
        <div className="text-xs opacity-70 mt-1 text-right">
          {format(new Date(message.timestamp), 'p')}
        </div>
      </div>
      
      {isUser && (
        <Avatar className="h-8 w-8 ml-2">
          <AvatarFallback className="bg-muted text-muted-foreground">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessage;
