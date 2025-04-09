
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useChatUI } from '@/components/providers/ChatUIProvider';
import { useChatSession } from '@/hooks/useChatSession';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useChatFlowEngine } from '@/hooks/useChatFlowEngine';
import { ChatIntroMessage } from '@/data/chatIntroMessage';
import { ChatbotMessage } from '@/types/chatbotTypes';

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
  
  // Get session and conversation data
  const { sessionId, conversation, loading: sessionLoading } = useChatSession();
  
  // Get messages for this conversation
  const { 
    messages, 
    loading: messagesLoading, 
    addUserMessage, 
    addBotMessage,
    setMessages 
  } = useChatMessages(conversation?.id);
  
  // Initialize chat flow engine
  const { 
    processUserResponse,
    getOptionsForCurrentStep,
    currentStep,
    userRole,
    generatePrefillData
  } = useChatFlowEngine(conversation);
  
  // Auto open chat after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChatOpen(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay, setIsChatOpen]);
  
  // Initialize with welcome message if no messages exist
  useEffect(() => {
    if (!sessionLoading && !messagesLoading && messages.length === 0 && conversation) {
      // Add intro message to display
      addBotMessage(
        ChatIntroMessage.message, 
        'option', 
        ChatIntroMessage.options
      );
    }
  }, [sessionLoading, messagesLoading, messages, conversation, addBotMessage]);
  
  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (isMinimized) {
      // Focus the input when opening
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
    
    if (!inputText.trim() || !conversation) return;
    
    // Add user message to state and database
    await addUserMessage(inputText);
    setInputText('');
    
    // Process the user response and get the bot's reply
    setIsTyping(true);
    
    // Simulate typing time
    setTimeout(async () => {
      setIsTyping(false);
      
      // Get next bot response
      const botResponse = await processUserResponse(inputText, currentStep);
      
      // Add bot message to state and database
      await addBotMessage(
        botResponse.message, 
        botResponse.messageType, 
        botResponse.options
      );
      
      // Handle navigation if options include a URL redirect
      if (botResponse.options && botResponse.options[0]?.value?.startsWith('/')) {
        const redirectUrl = botResponse.options[0].value;
        
        // If redirecting to a registration form, add prefill data
        if (redirectUrl.includes('/registration/') && conversation && userRole) {
          const prefillData = generatePrefillData();
          if (prefillData) {
            navigate(`${redirectUrl}?prefill=${encodeURIComponent(JSON.stringify(prefillData))}`);
          } else {
            navigate(redirectUrl);
          }
        } else {
          navigate(redirectUrl);
        }
      }
    }, 1500);
  };
  
  const handleOptionSelect = async (option: { label: string; value: string }) => {
    // Add user selection as a message
    await addUserMessage(option.label);
    
    // Process the selected option
    setIsTyping(true);
    
    // Simulate typing time
    setTimeout(async () => {
      setIsTyping(false);
      
      // Get next bot response
      const botResponse = await processUserResponse(option.value, currentStep);
      
      // Add bot message to state and database
      await addBotMessage(
        botResponse.message, 
        botResponse.messageType, 
        botResponse.options
      );
      
      // Handle navigation if options include a URL redirect
      if (botResponse.options && botResponse.options[0]?.value?.startsWith('/')) {
        const redirectUrl = botResponse.options[0].value;
        
        // If redirecting to a registration form, add prefill data
        if (redirectUrl.includes('/registration/') && conversation && userRole) {
          const prefillData = generatePrefillData();
          if (prefillData) {
            navigate(`${redirectUrl}?prefill=${encodeURIComponent(JSON.stringify(prefillData))}`);
          } else {
            navigate(redirectUrl);
          }
        } else {
          navigate(redirectUrl);
        }
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
                            
                            {/* Render options if available */}
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
                        
                        {/* Typing indicator */}
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
                        
                        {/* Scroll anchor */}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>
                  
                  {/* Input area */}
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
