import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, ChatOption } from '@/types/chatTypes';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { 
  validateChatInput,
  isMultiSelectQuestion,
  getCurrentQuestion, 
  getFieldTypeForQuestion
} from '@/services/chat';
import { processConversation } from '@/utils/chat/chatFlowEngine';
import { loadChatConfig } from '@/utils/chat/chatConfig';
import { toast } from "sonner";

interface ChatWidgetProps {
  className?: string;
  initialMessages?: ChatMessage[];
  onSend?: (message: string) => void;
  onOptionSelect?: (optionId: string) => void;
  displayOptions?: boolean;
  isTyping?: boolean;
  sessionId: string;
  userRole?: string | null;
  questionIndex?: number;
  hideHeader?: boolean;
}

export const ChatWidget = ({
  className,
  initialMessages = [],
  onSend,
  onOptionSelect,
  displayOptions = true,
  isTyping = false,
  sessionId,
  userRole = null,
  questionIndex = -1,
  hideHeader = false
}: ChatWidgetProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [validationError, setValidationError] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const config = loadChatConfig();
  
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    // Scroll to bottom of messages
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!input.trim()) return;
    
    // Perform field validation if we have a role and question index
    if (userRole && questionIndex >= 0) {
      const sectionIndex = Math.floor(questionIndex / 10);
      const sectionQuestionIndex = questionIndex % 10;
      
      // Get field type for validation
      const fieldType = getFieldTypeForQuestion(userRole, sectionIndex, sectionQuestionIndex);
      
      if (fieldType) {
        const validationResult = validateChatInput(input, fieldType);
        
        if (!validationResult.isValid) {
          setValidationError(validationResult.errorMessage);
          toast.error(validationResult.errorMessage || "Invalid input");
          return;
        }
      }
    }
    
    // Clear validation error
    setValidationError(undefined);
    
    // Add user message to the chat
    const newMessage: ChatMessage = {
      content: input,
      isUser: true,
      timestamp: Date.now()
    };
    
    setMessages([...messages, newMessage]);
    
    // Call external handler if provided
    if (onSend) {
      onSend(input);
    }
    // Otherwise handle locally
    else {
      // Process the message
      processConversation(
        [...messages, newMessage],
        sessionId,
        userRole,
        questionIndex,
        config
      ).then((response) => {
        // Add bot response
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            content: response.message,
            isUser: false,
            timestamp: Date.now(),
            options: response.options
          }
        ]);
      }).catch(error => {
        console.error("Error processing message:", error);
        // Add error message
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            content: "Sorry, I couldn't process that message. Please try again.",
            isUser: false,
            timestamp: Date.now()
          }
        ]);
      });
    }
    
    // Clear input
    setInput("");
  };

  const handleOptionClick = (optionId: string) => {
    if (onOptionSelect) {
      onOptionSelect(optionId);
    }
  };

  const getInputType = (): "text" | "textarea" => {
    if (!userRole || questionIndex < 0) return "text";
    
    const sectionIndex = Math.floor(questionIndex / 10);
    const sectionQuestionIndex = questionIndex % 10;
    const question = getCurrentQuestion(userRole, sectionIndex, sectionQuestionIndex);
    
    return question?.type === "textarea" ? "textarea" : "text";
  };

  return (
    <div className={cn("flex flex-col h-full bg-background rounded-lg", className)}>
      {!hideHeader && (
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-medium">Tavara Assistant</h3>
        </div>
      )}
      
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-4">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={cn(
                "max-w-[80%] rounded-lg px-4 py-2",
                message.isUser 
                  ? "bg-primary text-primary-foreground self-end" 
                  : "bg-muted text-muted-foreground self-start"
              )}
            >
              <div className="text-sm">{message.content}</div>
              
              {/* Show options if available and this is a bot message */}
              {!message.isUser && message.options && displayOptions && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.options.map((option) => (
                    <Button
                      key={option.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleOptionClick(option.id)}
                      className="text-xs"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="max-w-[80%] bg-muted text-muted-foreground rounded-lg px-4 py-2 self-start">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Typing...</span>
              </div>
            </div>
          )}
          
          {/* This div helps us scroll to the bottom */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <form onSubmit={handleSend} className="p-4 border-t border-border">
        {validationError && (
          <div className="text-destructive text-xs mb-2">{validationError}</div>
        )}
        
        <div className="flex gap-2">
          {getInputType() === "textarea" ? (
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className={cn(
                "flex-1",
                validationError && "border-destructive focus-visible:ring-destructive"
              )}
              disabled={isTyping}
            />
          ) : (
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className={cn(
                "flex-1",
                validationError && "border-destructive focus-visible:ring-destructive"
              )}
              disabled={isTyping}
            />
          )}
          
          <Button 
            type="submit" 
            size="icon"
            disabled={!input.trim() || isTyping}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};
