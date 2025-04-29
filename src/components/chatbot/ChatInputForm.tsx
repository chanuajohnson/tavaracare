
import React from 'react';
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
      return "Enter your email address...";
    }
    
    if (fieldType === "phone") {
      return "Enter your phone number...";
    }
    
    if (fieldType === "name") {
      return "Enter your name (letters only)...";
    }
    
    if (fieldType === "budget") {
      return "Enter a budget range (e.g., $15-20/hr)...";
    }
    
    return "Type your message...";
  };

  return (
    <div className={`border-t ${validationError ? "border-red-300 bg-red-50" : "border-border"} p-2 flex`}>
      <form 
        className="flex w-full items-center gap-2" 
        onSubmit={handleSendMessage}
        style={{ opacity: shouldShowInput ? 1 : 0.5 }}
      >
        <input
          type="text"
          className={`flex-1 ${isMobile ? "text-sm" : ""} bg-background rounded-md border ${
            validationError ? "border-red-300 placeholder-red-400" : "border-input"
          } px-3 py-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={getPlaceholder()}
          disabled={!shouldShowInput}
          aria-invalid={!!validationError}
          aria-describedby={validationError ? "input-error-message" : undefined}
        />
        <button
          type="submit"
          className={`rounded-md ${
            input ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          } p-2 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50`}
          disabled={!shouldShowInput || !input}
        >
          <Send size={isMobile ? 16 : 18} />
        </button>
      </form>
    </div>
  );
};
