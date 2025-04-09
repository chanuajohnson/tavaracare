
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UserIcon, Bot, User } from 'lucide-react';
import { ChatSenderType } from '@/types/chatbotTypes';

interface ChatbotAvatarProps {
  senderType: ChatSenderType;
  className?: string;
}

export function ChatbotAvatar({ senderType, className = '' }: ChatbotAvatarProps) {
  return (
    <Avatar className={`h-8 w-8 ${className}`}>
      <AvatarImage 
        src={senderType === ChatSenderType.BOT ? "/lovable-uploads/442348ff-8c87-4db3-bcb9-fd007795375c.png" : undefined}
        alt={senderType === ChatSenderType.BOT ? "Tavara Bot" : "User"}
      />
      <AvatarFallback className={
        senderType === ChatSenderType.BOT 
          ? "bg-primary-100 text-primary-600" 
          : "bg-secondary text-secondary-foreground"
      }>
        {senderType === ChatSenderType.BOT ? (
          <Bot className="h-4 w-4" />
        ) : senderType === ChatSenderType.USER ? (
          <User className="h-4 w-4" />
        ) : (
          <UserIcon className="h-4 w-4" />
        )}
      </AvatarFallback>
    </Avatar>
  );
}
