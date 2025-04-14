
import React from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ChatInputFormProps {
  input: string;
  setInput: (value: string) => void;
  handleSendMessage: (e?: React.FormEvent) => Promise<void>;
  isTyping: boolean;
  conversationStage: "intro" | "questions" | "completion";
  isResuming: boolean;
  validationError?: string;
}

export const ChatInputForm: React.FC<ChatInputFormProps> = ({
  input,
  setInput,
  handleSendMessage,
  isTyping,
  conversationStage,
  isResuming,
  validationError
}) => {
  return (
    <div className="border-t p-3 flex flex-col gap-2">
      <form onSubmit={(e) => {
        e.preventDefault();
        if (input.trim() && !isTyping && conversationStage !== "intro" && !isResuming && !validationError) {
          handleSendMessage(e);
        }
      }} className="flex gap-2">
        <Input
          placeholder={conversationStage === "completion" ? "Ask a follow-up question..." : "Type a message..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={cn(
            "flex-1",
            validationError && "border-red-500 focus-visible:ring-red-500"
          )}
          disabled={isTyping || conversationStage === "intro" || isResuming}
          aria-invalid={!!validationError}
          onFocus={() => validationError && setInput("")}
          aria-label="Chat message input"
          data-testid="chat-input"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isTyping || conversationStage === "intro" || isResuming || !!validationError}
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
    </div>
  );
};
