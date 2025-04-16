
import React, { useEffect } from "react";
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
  // Validate input whenever it changes
  useEffect(() => {
    if (fieldType && input) {
      // Direct validation on input change without delay
      const validationResult = validateChatInput(input, fieldType);
      if (!validationResult.isValid) {
        console.log(`Validation error for ${fieldType}: ${validationResult.errorMessage}`);
      }
    }
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
      default:
        return "Type a message...";
    }
  };

  // Check if button should be enabled
  const isButtonDisabled = () => {
    // Basic conditions
    if (!input.trim() || isTyping || conversationStage === "intro" || isResuming) {
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
            input && !validationError ? "border-green-500 focus-visible:ring-green-500" : ""
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
          ) : null}
        </p>
      )}
    </div>
  );
};
