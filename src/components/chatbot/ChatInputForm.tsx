
import React, { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { validateChatInput } from "@/services/chat/utils/inputValidation";

interface ChatInputFormProps {
  input: string;
  setInput: (value: string) => void;
  handleSendMessage: (e?: React.FormEvent) => Promise<void>;
  isTyping: boolean;
  conversationStage: "intro" | "questions" | "completion";
  isResuming: boolean;
  validationError?: string;
  fieldType?: string | null;
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
  const [typingDebounce, setTypingDebounce] = useState<NodeJS.Timeout | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showSuccessFeedback, setShowSuccessFeedback] = useState(false);
  
  // Validate input whenever it changes
  useEffect(() => {
    if (fieldType && input) {
      // Clear previous timeout if it exists
      if (typingDebounce) {
        clearTimeout(typingDebounce);
      }
      
      // Set validating state immediately
      if (input.length > 1) {
        setIsValidating(true);
      }
      
      // Debounce validation to avoid too many checks while typing
      const timeout = setTimeout(() => {
        if (input.length > 1) {
          const validationResult = validateChatInput(input, fieldType);
          setIsValidating(false);
          
          if (validationResult.isValid && fieldType !== 'text') {
            // Show visual feedback for valid input
            setShowSuccessFeedback(true);
            setTimeout(() => setShowSuccessFeedback(false), 2000);
          }
        }
      }, 500);
      
      setTypingDebounce(timeout);
    } else if (!input) {
      setIsValidating(false);
      setShowSuccessFeedback(false);
    }
    
    return () => {
      if (typingDebounce) {
        clearTimeout(typingDebounce);
      }
    };
  }, [input, fieldType]);

  // Generate placeholder based on field type
  const getPlaceholder = () => {
    if (conversationStage === "intro") {
      return "Please select an option...";
    }
    
    if (isTyping) {
      return "Wait for response...";
    }
    
    if (conversationStage === "completion") {
      return "Ask a follow-up question...";
    }
    
    switch (fieldType) {
      case "email":
        return "Enter a valid email (example@domain.com)";
      case "phone":
        return "Enter a phone number (+1868XXXXXXX)";
      case "name":
        return "Enter your name";
      case "budget":
        return "Enter a budget (e.g. $20-30/hour)";
      case "address":
        return "Enter your address";
      case "zipcode":
        return "Enter your postal/zip code";
      case "date":
        return "Enter a date (MM/DD/YYYY)";
      default:
        return "Type a message...";
    }
  };

  // Check if button should be enabled
  const isButtonDisabled = () => {
    // Basic conditions
    if (!input.trim() || isTyping || conversationStage === "intro" || isResuming || isValidating) {
      return true;
    }
    
    // If there's a validation error, disable the button
    if (validationError) {
      return true;
    }
    
    // If we have a field type requiring validation, do a final validation check
    if (fieldType && input) {
      const result = validateChatInput(input, fieldType);
      return !result.isValid;
    }
    
    return false;
  };

  return (
    <div className="border-t p-3 flex flex-col gap-2">
      <form onSubmit={(e) => {
        e.preventDefault();
        if (!isButtonDisabled()) {
          handleSendMessage(e).catch(err => {
            console.error("Error sending message:", err);
            toast.error("Failed to send message. Please try again.");
          });
        }
      }} className="flex gap-2">
        <Input
          placeholder={getPlaceholder()}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={cn(
            "flex-1",
            validationError ? "border-red-500 focus-visible:ring-red-500" : "",
            showSuccessFeedback ? "border-green-500 focus-visible:ring-green-500" : "",
            isValidating ? "animate-pulse" : ""
          )}
          disabled={isTyping || conversationStage === "intro" || isResuming}
          aria-invalid={!!validationError}
          aria-label="Chat message input"
          data-testid="chat-input"
        />
        <Button
          type="submit"
          size="icon"
          disabled={isButtonDisabled()}
          title="Send message"
          aria-label="Send message"
          data-testid="send-message-button"
          className={cn(
            showSuccessFeedback && "bg-green-600 hover:bg-green-700"
          )}
        >
          <Send size={18} />
        </Button>
      </form>
      {validationError && (
        <p className="text-red-500 text-sm px-1 animate-pulse" role="alert" aria-live="assertive">{validationError}</p>
      )}
      {fieldType && !validationError && input && (
        <p className="text-muted-foreground text-xs px-1">
          {fieldType === "email" ? (
            "Please enter a valid email address like example@domain.com"
          ) : fieldType === "phone" ? (
            "Enter your phone number including country code (e.g., +1868XXXXXXX)"
          ) : fieldType === "name" ? (
            "Enter your name as you'd like to be addressed"
          ) : fieldType === "budget" ? (
            "Enter budget as a range (e.g. $20-30/hour) or 'Negotiable'"
          ) : null}
        </p>
      )}
      {isValidating && (
        <p className="text-amber-500 text-xs px-1">Checking input...</p>
      )}
    </div>
  );
};
