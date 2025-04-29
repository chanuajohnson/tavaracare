
import React, { useRef, useEffect, useState } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatOptionsRenderer } from './ChatOptionsRenderer';
import { TypingIndicator } from './TypingIndicator';
import { ChatMessage } from '@/types/chatTypes';
import { useIsMobile } from '@/hooks/use-mobile';
import { SectionTransition } from './components/SectionTransition';
import { getRegistrationFlowByRole } from '@/data/chatRegistrationFlows';

interface ChatMessagesListProps {
  messages: ChatMessage[];
  isTyping: boolean;
  isResuming: boolean;
  conversationStage: "intro" | "questions" | "completion";
  handleRoleSelection: (roleId: string) => void;
  handleOptionSelection: (optionId: string) => void;
  alwaysShowOptions?: boolean;
  currentSectionIndex?: number;
}

export const ChatMessagesList: React.FC<ChatMessagesListProps> = ({
  messages,
  isTyping,
  isResuming,
  conversationStage,
  handleRoleSelection,
  handleOptionSelection,
  alwaysShowOptions = false,
  currentSectionIndex = 0,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [lastSectionIndex, setLastSectionIndex] = useState<number>(0);
  const [showSectionTransition, setShowSectionTransition] = useState<boolean>(false);
  const [transitionTitle, setTransitionTitle] = useState<string>("");
  
  // Handle section transitions
  useEffect(() => {
    if (conversationStage === "questions" && currentSectionIndex > 0 && currentSectionIndex !== lastSectionIndex) {
      // Find the role from messages
      const roleMessage = messages.find(msg => 
        msg.isUser && (msg.content.includes("family") || 
        msg.content.includes("professional") || 
        msg.content.includes("community"))
      );
      
      let role = "";
      if (roleMessage) {
        if (roleMessage.content.includes("family")) role = "family";
        else if (roleMessage.content.includes("professional")) role = "professional";
        else if (roleMessage.content.includes("community")) role = "community";
      }
      
      if (role) {
        try {
          const flow = getRegistrationFlowByRole(role);
          if (flow && flow.sections && flow.sections[currentSectionIndex]) {
            setTransitionTitle(flow.sections[currentSectionIndex].title);
            setShowSectionTransition(true);
            
            // Hide transition after 3 seconds
            setTimeout(() => {
              setShowSectionTransition(false);
            }, 3000);
          }
        } catch (err) {
          console.error("[ChatMessagesList] Error getting section title:", err);
        }
      }
      
      setLastSectionIndex(currentSectionIndex);
    }
  }, [currentSectionIndex, lastSectionIndex, conversationStage, messages]);

  useEffect(() => {
    // Smooth scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, showSectionTransition]);

  useEffect(() => {
    // Ensure initial messages are visible
    if (messagesContainerRef.current && messages.length <= 2) {
      messagesContainerRef.current.scrollTop = 0;
    }
  }, [messages.length]);

  // Prevent multiple option renderers for the same message by tracking the last rendered option
  let lastRenderedOptionMessageIndex = -1;
  
  // Check if a message is the start of a new section
  const isNewSectionMessage = (message: ChatMessage, index: number) => {
    if (message.isUser || index === 0) return false;
    
    // Check if message contains section title announcement
    return message.content.includes("Now let's talk about") || 
           message.content.includes("Now let's move on to") ||
           message.content.includes("Moving to new section");
  };
  
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
          
          // Check if this is a new section announcement
          const isNewSection = isNewSectionMessage(message, index);
          
          return (
            <React.Fragment key={index}>
              <MessageBubble
                content={message.content}
                isUser={message.isUser}
                timestamp={message.timestamp}
                isNewSection={isNewSection}
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
        
        {/* Show section transition */}
        {showSectionTransition && (
          <SectionTransition 
            title={transitionTitle}
            show={showSectionTransition}
          />
        )}
        
        {isTyping && <TypingIndicator />}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
};
