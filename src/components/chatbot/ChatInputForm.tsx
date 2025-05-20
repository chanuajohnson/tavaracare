import React, { KeyboardEvent, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { SendIcon } from '@/utils/lazyIcons';

interface ChatInputFormProps {
  input: string;
  setInput: (value: string) => void;
  handleSendMessage: (e?: React.FormEvent, inputValue?: string) => void;
  isTyping: boolean;
  conversationStage: "intro" | "questions" | "completion";
  isResuming: boolean;
  validationError?: string;
  fieldType: string | null;
}

export const ChatInputForm: React.FC<ChatInputFormProps> = ({
  input,
  setInput,
  handleSendMessage,
  isTyping,
  conversationStage,
  isResuming,
  validationError,
  fieldType
}) => {
  const isMobile = useIsMobile();
  const [isFocused, setIsFocused] = useState(false);
  
  // Determine if we should show input or not
  // Hide input during intro stage unless we're resuming
  const shouldShowInput = 
    conversationStage === "completion" || 
    (conversationStage === "questions" && !isTyping) ||
    (isResuming && !isTyping);

  // Determine placeholder based on field type and focus state
  const getPlaceholder = (): string => {
    if (validationError) {
      return validationError;
    }
    
    if (fieldType === "email") {
      return isFocused ? "Enter your email" : "Enter your email (e.g., name@example.com)";
    }
    
    if (fieldType === "phone") {
      return isFocused ? "Enter your phone number" : "Enter phone number (e.g., +1 868 123 4567)";
    }
    
    if (fieldType === "name") {
      return isFocused ? "Enter your name" : "Enter your name (First Last)";
    }
    
    if (fieldType === "budget") {
      return isFocused ? "Enter budget" : "Enter budget range (e.g., $20-30/hour)";
    }
    
    return isMobile ? "Type message..." : "Type your message...";
  };

  // Handle keyboard events for the input field
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && input.trim() && shouldShowInput) {
      e.preventDefault();
      handleSendMessage(undefined, input);
    }
  };

  return (
    <div className={`border-t ${validationError ? "border-red-300 bg-red-50" : "border-border"} ${isMobile ? "px-2 py-1" : "p-2"} flex flex-col safe-bottom`}>
      <form 
        className="flex w-full items-center gap-2" 
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim() && shouldShowInput) {
            handleSendMessage(e, input);
          }
        }}
        style={{ opacity: shouldShowInput ? 1 : 0.5 }}
      >
        <input
          type="text"
          className={`flex-1 ${isMobile ? "text-sm py-2 px-2" : ""} bg-background rounded-md border ${
            validationError ? "border-red-300 placeholder-red-400" : "border-input"
          } px-3 py-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={getPlaceholder()}
          disabled={!shouldShowInput}
          aria-invalid={!!validationError}
          aria-describedby={validationError ? "input-error-message" : undefined}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <button
          type="submit"
          className={`rounded-md ${
            input.trim() ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          } ${isMobile ? "p-2 min-w-8" : "p-2"} transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50`}
          disabled={!shouldShowInput || !input.trim()}
        >
          <SendIcon size={isMobile ? 18 : 18} />
        </button>
      </form>
    </div>
  );
};
