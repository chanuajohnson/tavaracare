
import React, { useState } from "react";
import { useChatbot } from "@/hooks/useChatbot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/**
 * Chat interface component using our chatbot hook
 */
export const ChatInterface: React.FC = () => {
  const {
    messages,
    loading,
    error,
    sendMessage,
    addBotResponse,
  } = useChatbot();
  
  const [inputValue, setInputValue] = useState<string>("");
  const [processingMessage, setProcessingMessage] = useState<boolean>(false);
  
  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || processingMessage) return;
    
    setProcessingMessage(true);
    
    try {
      // Send user message
      const sentMessage = await sendMessage(inputValue);
      
      if (sentMessage) {
        setInputValue("");
        
        // Simulate bot response (in a real app, this would come from an API)
        setTimeout(async () => {
          await addBotResponse(`Echo: ${sentMessage.message}`);
          setProcessingMessage(false);
        }, 1000);
      } else {
        setProcessingMessage(false);
      }
    } catch (err) {
      console.error("Error in message flow:", err);
      setProcessingMessage(false);
    }
  };
  
  return (
    <Card className="flex flex-col h-[500px] w-full max-w-md mx-auto">
      <div className="p-4 bg-primary text-primary-foreground rounded-t-lg">
        <h2 className="text-xl font-semibold">Chatbot</h2>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p>Loading conversation...</p>
          </div>
        ) : error ? (
          <div className="text-red-500 p-4 text-center">
            {error}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id || `${msg.timestamp}-${Math.random()}`}
              className={`flex ${
                msg.senderType === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.senderType === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary"
                }`}
              >
                <p>{msg.message}</p>
                <div className="text-xs opacity-70 mt-1">
                  {new Date(msg.timestamp || "").toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        {processingMessage && (
          <div className="flex justify-start">
            <div className="bg-secondary max-w-[80%] rounded-lg p-3">
              <p>Typing...</p>
            </div>
          </div>
        )}
      </div>
      
      <Separator />
      
      {/* Input area */}
      <form onSubmit={handleSendMessage} className="p-4 flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          disabled={loading || processingMessage}
          className="flex-1"
        />
        <Button 
          type="submit" 
          disabled={loading || processingMessage || !inputValue.trim()}
        >
          Send
        </Button>
      </form>
    </Card>
  );
};
