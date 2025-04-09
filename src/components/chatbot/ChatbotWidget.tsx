import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useChatUI } from '@/components/providers/ChatUIProvider';
import { useLocalChatSession } from '@/hooks/useLocalChatSession';
import { useLocalChatMessages } from '@/hooks/useLocalChatMessages';
import { ChatbotMessageType } from '@/types/chatbotTypes';

interface ChatbotWidgetProps {
  delay?: number; // Delay in ms before showing the chatbot
}

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ delay = 5000 }) => {
  const { isChatOpen, setIsChatOpen, toggleChat } = useChatUI();
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  const { sessionId, loading: sessionLoading, error: sessionError } = useLocalChatSession();
  
  const { 
    messages, 
    loading: messagesLoading, 
    addUserMessage, 
    processMessage,
    error: messagesError
  } = useLocalChatMessages();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChatOpen(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay, setIsChatOpen]);
  
  useEffect(() => {
    if (!sessionLoading && !messagesLoading && messages.length === 0) {
      addBotWelcomeMessage();
    }
  }, [sessionLoading, messagesLoading, messages]);
  
  const addBotWelcomeMessage = async () => {
    await processMessage("welcome");
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  };
  
  const closeChat = () => {
    setIsChatOpen(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };
  
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!inputText.trim()) return;
    
    await addUserMessage(inputText);
    setInputText('');
    
    setIsTyping(true);
    
    setTimeout(async () => {
      setIsTyping(false);
      
      const botResponse = await processMessage(inputText);
      
      if (botResponse?.options && botResponse.options.some(opt => opt.value?.startsWith('/'))) {
        const redirectOption = botResponse.options.find(opt => opt.value?.startsWith('/'));
        if (redirectOption) {
          navigate(redirectOption.value);
        }
      }
    }, 1500);
  };
  
  const handleOptionSelect = async (option: { label: string; value: string }) => {
    await addUserMessage(option.label);
    
    setIsTyping(true);
    
    setTimeout(async () => {
      setIsTyping(false);
      
      if (option.value.startsWith('/')) {
        navigate(option.value);
      } else {
        await processMessage(option.value);
      }
    }, 1500);
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
          
          <AnimatePresence>
            {!isMinimized && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CardContent className="p-0">
                  <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {sessionLoading || messagesLoading ? (
                      <div className="flex justify-center items-center h-full">
                        <p className="text-gray-500">Loading conversation...</p>
                      </div>
                    ) : (
                      <>
                        {messages.map((msg, index) => (
                          <div 
                            key={index}
                            className={`max-w-[80%] p-3 rounded-lg ${
                              msg.senderType === 'user' 
                                ? "ml-auto bg-primary-500 text-white rounded-br-none" 
                                : "mr-auto bg-white shadow-sm border border-gray-100 rounded-bl-none"
                            }`}
                          >
                            <div>{msg.message}</div>
                            
                            {msg.options && msg.options.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {msg.options.map((option, i) => (
                                  <button
                                    key={i}
                                    onClick={() => handleOptionSelect(option)}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                      msg.senderType === 'user'
                                        ? "bg-primary-400 hover:bg-primary-300 text-white"
                                        : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                                    }`}
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {isTyping && (
                          <div className="max-w-[80%] mr-auto p-3 rounded-lg bg-white shadow-sm border border-gray-100 rounded-bl-none flex items-center space-x-1">
                            <motion.div
                              animate={{ y: [0, -5, 0] }}
                              transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                              className="bg-gray-400 rounded-full h-2 w-2"
                            />
                            <motion.div
                              animate={{ y: [0, -5, 0] }}
                              transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                              className="bg-gray-400 rounded-full h-2 w-2"
                            />
                            <motion.div
                              animate={{ y: [0, -5, 0] }}
                              transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                              className="bg-gray-400 rounded-full h-2 w-2"
                            />
                          </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>
                  
                  <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 flex gap-2">
                    <Input
                      ref={inputRef}
                      value={inputText}
                      onChange={handleInputChange}
                      placeholder="Type your message..."
                      className="flex-1"
                      disabled={sessionLoading || messagesLoading || isTyping}
                    />
                    <Button 
                      type="submit" 
                      size="sm"
                      variant="ghost"
                      className="bg-primary-500 hover:bg-primary-600 text-white"
                      disabled={sessionLoading || messagesLoading || isTyping || !inputText.trim()}
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
