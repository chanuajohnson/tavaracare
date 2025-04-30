
import React, { KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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
  
  // Determine if we should show input or not
  // Hide input during intro stage unless we're resuming
  const shouldShowInput = 
    conversationStage === "completion" || 
    (conversationStage === "questions" && !isTyping) ||
    (isResuming && !isTyping);

  // Determine placeholder based on field type
  const getPlaceholder = (): string => {
    if (validationError) {
      return validationError;
    }
    
    if (fieldType === "email") {
      return "Enter your email";
    }
    
    if (fieldType === "phone") {
      return "Enter your phone number";
    }
    
    if (fieldType === "name") {
      return "Enter your name";
    }
    
    if (fieldType === "budget") {
      return "Enter budget range";
    }
    
    return "Type your message...";
  };

  // Get helper text for input format guidance
  const getHelperText = (): string | null => {
    if (fieldType === "email") {
      return "Format: name@example.com";
    }
    
    if (fieldType === "phone") {
      return "Format: +1 868 123 4567";
    }
    
    return null;
  };

  const helperText = getHelperText();

  // Handle keyboard events for the input field
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && input.trim() && shouldShowInput) {
      e.preventDefault();
      handleSendMessage(undefined, input);
    }
  };

  return (
    <div className={`border-t ${validationError ? "border-red-300 bg-red-50" : "border-border"} p-2 flex flex-col safe-bottom`}>
      {helperText && !validationError && (
        <div className="text-xs text-muted-foreground mb-1 px-2">
          {helperText}
        </div>
      )}
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
          className={`flex-1 ${isMobile ? "text-sm py-3" : ""} bg-background rounded-md border ${
            validationError ? "border-red-300 placeholder-red-400" : "border-input"
          } px-3 py-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={getPlaceholder()}
          disabled={!shouldShowInput}
          aria-invalid={!!validationError}
          aria-describedby={validationError ? "input-error-message" : undefined}
          onKeyDown={handleKeyDown}
        />
        <button
          type="submit"
          className={`rounded-md ${
            input.trim() ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          } ${isMobile ? "p-3" : "p-2"} transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50`}
          disabled={!shouldShowInput || !input.trim()}
        >
          <Send size={isMobile ? 20 : 18} />
        </button>
      </form>
    </div>
  );
};
