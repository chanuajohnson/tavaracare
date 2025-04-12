
import React, { useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatOptionsRenderer } from './ChatOptionsRenderer';
import { TypingIndicator } from './TypingIndicator';
import { ChatMessage } from '@/types/chatTypes';

interface ChatMessagesListProps {
  messages: ChatMessage[];
  isTyping: boolean;
  isResuming: boolean;
  conversationStage: "intro" | "questions" | "completion";
  handleRoleSelection: (roleId: string) => void;
  handleOptionSelection: (optionId: string) => void;
  alwaysShowOptions?: boolean;
}

export const ChatMessagesList: React.FC<ChatMessagesListProps> = ({
  messages,
  isTyping,
  isResuming,
  conversationStage,
  handleRoleSelection,
  handleOptionSelection,
  alwaysShowOptions = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Smooth scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      {messages.map((message, index) => (
        <React.Fragment key={index}>
          <MessageBubble
            content={message.content}
            isUser={message.isUser}
            timestamp={message.timestamp}
          />
          {!message.isUser && message.options && (
            <ChatOptionsRenderer 
              options={message.options} 
              onSelect={
                isResuming ? handleRoleSelection : 
                conversationStage === "intro" ? handleRoleSelection : 
                handleOptionSelection
              } 
            />
          )}
        </React.Fragment>
      ))}
      {isTyping && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
};
