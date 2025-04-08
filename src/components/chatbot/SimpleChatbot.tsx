
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import useChatbot from '@/hooks/useChatbot';
import { Loader2 } from 'lucide-react';

const SimpleChatbot = () => {
  const { isLoading, messages, sendMessage, error } = useChatbot();
  const [inputValue, setInputValue] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    sendMessage(inputValue);
    setInputValue('');
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <Card className="p-4 max-w-md mx-auto">
      <div className="space-y-4">
        <div className="text-xl font-bold">Chatbot</div>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-2 rounded">
            {error}
          </div>
        )}
        
        <div className="h-80 overflow-y-auto space-y-2 p-2 bg-muted/20 rounded">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`p-2 rounded max-w-[80%] ${
                message.sender === 'user' 
                  ? 'bg-primary text-primary-foreground ml-auto' 
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {message.content}
            </div>
          ))}
          
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground">
              No messages yet. Start a conversation!
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" disabled={!inputValue.trim()}>
            Send
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default SimpleChatbot;
