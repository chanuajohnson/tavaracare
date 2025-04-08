
import React, { useRef, useEffect } from 'react';
import { useChatbot } from '@/contexts/ChatbotContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { MessageCircle, X, SendHorizonal, User, Bot, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import ChatMessage from './ChatMessage';
import ChatbotSuggestions from './ChatbotSuggestions';

const ChatbotInterface: React.FC = () => {
  const {
    messages,
    isOpen,
    currentMessage,
    setCurrentMessage,
    sendMessage,
    toggleChatbot,
    isTyping
  } = useChatbot();
  
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Auto-scroll to the most recent message
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);
  
  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentMessage.trim()) {
      sendMessage(currentMessage);
    }
  };

  // Render toggle button when chat is closed
  if (!isOpen) {
    return (
      <Button 
        onClick={toggleChatbot} 
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }
  
  // Render full chat interface when open
  return (
    <Card className={cn(
      "fixed bottom-4 right-4 w-full max-w-md h-[500px] shadow-xl flex flex-col z-50",
      "transition-all duration-300 ease-in-out"
    )}>
      <CardHeader className="bg-primary text-primary-foreground py-3 px-4 flex flex-row justify-between items-center">
        <div className="flex items-center">
          <Bot className="h-5 w-5 mr-2" />
          <h3 className="font-medium">Tavara Care Assistant</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleChatbot} className="h-8 w-8 text-primary-foreground">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isTyping && (
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Bot className="h-8 w-8 text-primary" />
            <span className="bg-muted rounded-full px-3 py-2 text-sm flex items-center">
              <Loader2 className="h-3 w-3 animate-spin mr-2" />
              Typing...
            </span>
          </div>
        )}
        
        <div ref={messageEndRef} />
      </CardContent>
      
      <div className="px-4 py-2 border-t">
        <ChatbotSuggestions />
      </div>
      
      <CardFooter className="p-2">
        <form onSubmit={handleSubmit} className="flex w-full space-x-2">
          <Input
            ref={inputRef}
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!currentMessage.trim()}>
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatbotInterface;
