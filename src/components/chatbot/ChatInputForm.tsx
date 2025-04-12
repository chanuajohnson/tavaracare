
import React from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputFormProps {
  input: string;
  setInput: (value: string) => void;
  handleSendMessage: (e?: React.FormEvent) => Promise<void>;
  isTyping: boolean;
  conversationStage: "intro" | "questions" | "completion";
  isResuming: boolean;
}

export const ChatInputForm: React.FC<ChatInputFormProps> = ({
  input,
  setInput,
  handleSendMessage,
  isTyping,
  conversationStage,
  isResuming
}) => {
  return (
    <form onSubmit={handleSendMessage} className="border-t p-3 flex gap-2">
      <Input
        placeholder="Type a message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="flex-1"
        disabled={isTyping || conversationStage === "intro" || isResuming}
      />
      <Button
        type="submit"
        size="icon"
        disabled={!input.trim() || isTyping || conversationStage === "intro" || isResuming}
        title="Send message"
      >
        <Send size={18} />
      </Button>
    </form>
  );
};
