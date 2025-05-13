
import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '@/types/chatTypes';
import { MessageBubble } from './MessageBubble';
import { ChatOptionsRenderer } from './ChatOptionsRenderer';
import { TypingIndicator } from './TypingIndicator';
import { FadeIn } from '@/components/framer';

interface ChatMessagesListProps {
  messages: ChatMessage[];
  isTyping: boolean;
  isResuming?: boolean;
  conversationStage: 'intro' | 'questions' | 'completion';
  handleRoleSelection?: (role: string) => void;
  handleOptionSelection?: (optionId: string) => void;
  alwaysShowOptions?: boolean;
  currentSectionIndex?: number;
}

export const ChatMessagesList: React.FC<ChatMessagesListProps> = ({
  messages,
  isTyping,
  isResuming = false,
  conversationStage,
  handleRoleSelection,
  handleOptionSelection,
  alwaysShowOptions = false,
  currentSectionIndex = 0,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-2">
        {messages.map((message, index) => {
          const isNewSection = !message.isUser && 
            index > 0 && 
            messages[index-1]?.isUser && 
            conversationStage === 'questions';
          
          return (
            <div key={message.id || `message-${index}-${message.timestamp}`}>
              <MessageBubble
                content={message.content}
                formattedContent={message.formattedContent}
                isUser={message.isUser}
                timestamp={message.timestamp}
                isNewSection={isNewSection}
              />
              
              {!message.isUser && message.options && message.options.length > 0 && (
                <ChatOptionsRenderer
                  options={message.options}
                  onSelect={
                    conversationStage === 'intro' && handleRoleSelection 
                      ? handleRoleSelection 
                      : handleOptionSelection || (() => {})
                  }
                />
              )}
            </div>
          );
        })}
        
        {isTyping && !isResuming && (
          <FadeIn duration={0.3}>
            <TypingIndicator />
          </FadeIn>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
