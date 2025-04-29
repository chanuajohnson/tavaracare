
import React, { useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatOptionsRenderer } from './ChatOptionsRenderer';
import { TypingIndicator } from './TypingIndicator';
import { ChatMessage } from '@/types/chatTypes';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Smooth scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    // Ensure initial messages are visible
    if (messagesContainerRef.current && messages.length <= 2) {
      messagesContainerRef.current.scrollTop = 0;
    }
  }, [messages.length]);

  // Prevent multiple option renderers for the same message by tracking the last rendered option
  let lastRenderedOptionMessageIndex = -1;
  
  return (
    <div ref={messagesContainerRef} className={`flex-1 ${isMobile ? "p-2" : "p-4"} overflow-y-auto`}>
      <div className="flex flex-col">
        {messages.map((message, index) => {
          // Skip rendering options if this message already has options rendered
          const shouldRenderOptions = !message.isUser && message.options && index > lastRenderedOptionMessageIndex;
          
          // Update the last rendered option index if we're showing options
          if (shouldRenderOptions) {
            lastRenderedOptionMessageIndex = index;
          }
          
          return (
            <React.Fragment key={index}>
              <MessageBubble
                content={message.content}
                isUser={message.isUser}
                timestamp={message.timestamp}
              />
              
              {/* Only show options for the most recent bot message with options */}
              {shouldRenderOptions && (
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
          );
        })}
        
        {isTyping && <TypingIndicator />}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
};
