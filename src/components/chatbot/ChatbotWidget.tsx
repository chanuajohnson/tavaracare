
import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useChatUI } from '@/components/providers/ChatUIProvider';

interface ChatbotWidgetProps {
  delay?: number; // Delay in ms before showing the chatbot
}

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ delay = 5000 }) => {
  const { isChatOpen, setIsChatOpen, toggleChat } = useChatUI();
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Array<{text: string, isUser: boolean}>>([
    { text: "Hi there 👋 Looking for care support? I'm here to help match you with the right caregiver.", isUser: false }
  ]);
  
  // Auto open chat after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChatOpen(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay, setIsChatOpen]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { text: inputText, isUser: true }]);
    
    // Clear input
    setInputText('');
    
    // Simulate bot response (in a real app, this would call an API)
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: "Thank you for your message. How can I help you with care services today?", 
        isUser: false 
      }]);
    }, 1000);
  };
  
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };
  
  const closeChat = () => {
    setIsChatOpen(false);
  };

  if (!isChatOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-20 right-4 z-40"
      >
        <Card className="w-80 md:w-96 shadow-lg border-primary-100">
          {/* Header */}
          <div className="bg-primary-500 text-white p-3 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageCircle size={20} />
              <h3 className="font-semibold">Tavara Care Assistant</h3>
            </div>
            <div className="flex gap-1">
              <button 
                onClick={toggleMinimize} 
                className="p-1 hover:bg-primary-400 rounded-full transition-colors"
                aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
              >
                {isMinimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              <button 
                onClick={closeChat} 
                className="p-1 hover:bg-primary-400 rounded-full transition-colors"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          
          {/* Chat area */}
          <AnimatePresence>
            {!isMinimized && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CardContent className="p-0">
                  {/* Messages container */}
                  <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.map((msg, index) => (
                      <div 
                        key={index}
                        className={`max-w-[80%] p-3 rounded-lg ${
                          msg.isUser 
                            ? "ml-auto bg-primary-500 text-white rounded-br-none" 
                            : "mr-auto bg-white shadow-sm border border-gray-100 rounded-bl-none"
                        }`}
                      >
                        {msg.text}
                      </div>
                    ))}
                  </div>
                  
                  {/* Input area */}
                  <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 flex gap-2">
                    <Input
                      value={inputText}
                      onChange={handleInputChange}
                      placeholder="Type your message..."
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      size="sm"
                      variant="ghost"
                      className="bg-primary-500 hover:bg-primary-600 text-white"
                    >
                      <Send size={18} />
                    </Button>
                  </form>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatbotWidget;
