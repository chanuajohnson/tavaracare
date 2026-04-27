import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Minimize2, Maximize2, MessageCircle, Loader2, Sparkles } from 'lucide-react';
import { useCoreConversation } from '../hooks/useCoreConversation';
import { CoreConversationContext, BrandingConfig } from '../types/core';
import { motion, AnimatePresence } from 'framer-motion';

interface TAVWidgetProps {
  context: CoreConversationContext;
  branding?: BrandingConfig;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'inline';
  autoOpen?: boolean;
}

export const TAVWidget: React.FC<TAVWidgetProps> = ({ 
  context, 
  branding,
  className = '',
  position = 'bottom-right',
  autoOpen = false
}) => {
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);

  const conversationContext = {
    ...context,
    branding
  };

  const { 
    messages, 
    isTyping, 
    sendMessage, 
    initializeWithWelcome, 
    sessionToken 
  } = useCoreConversation(conversationContext);

  // Initialize welcome message when widget opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeWithWelcome();
    }
  }, [isOpen, messages.length, initializeWithWelcome]);

  // Show welcome bubble before opening
  useEffect(() => {
    if (!isOpen && !showWelcome) {
      const timer = setTimeout(() => setShowWelcome(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, showWelcome]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    const userMessage = message.trim();
    setMessage('');
    await sendMessage(userMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const assistantName = branding?.assistantName || 'TAV';
  const primaryColor = branding?.primaryColor || 'hsl(var(--primary))';
  const companyName = branding?.companyName || 'Demo Company';

  if (position === 'inline') {
    return (
      <Card className={`w-full max-w-2xl mx-auto ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" style={{ color: primaryColor }} />
            Chat with {assistantName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChatInterface 
            messages={messages}
            isTyping={isTyping}
            message={message}
            setMessage={setMessage}
            handleSendMessage={handleSendMessage}
            handleKeyPress={handleKeyPress}
            assistantName={assistantName}
            primaryColor={primaryColor}
          />
        </CardContent>
      </Card>
    );
  }

  const positionClasses = position === 'bottom-right' 
    ? 'bottom-4 right-4' 
    : 'bottom-4 left-4';

  return (
    <div className={`fixed ${positionClasses} z-50 ${className}`}>
      {/* Welcome Bubble */}
      <AnimatePresence>
        {showWelcome && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="absolute bottom-16 right-0 mb-2"
          >
            <div className="bg-white rounded-lg shadow-lg border p-3 max-w-xs">
              <div className="flex items-start gap-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  {assistantName[0]}
                </div>
                <div>
                  <p className="text-sm text-gray-800">
                    Hi! I'm {assistantName}. Try me out - I can help guide you through any form or process!
                  </p>
                  <button
                    onClick={() => {
                      setIsOpen(true);
                      setShowWelcome(false);
                    }}
                    className="text-xs mt-1 font-medium"
                    style={{ color: primaryColor }}
                  >
                    Start chatting →
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              height: isMinimized ? 'auto' : '500px',
              width: isMinimized ? 'auto' : '400px'
            }}
            exit={{ opacity: 0, y: 20, height: 0 }}
            className="bg-white rounded-lg shadow-2xl border"
          >
            {/* Header */}
            <div 
              className="p-4 rounded-t-lg flex items-center justify-between text-white"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  {assistantName[0]}
                </div>
                <div>
                  <h3 className="font-medium">{assistantName}</h3>
                  <p className="text-xs opacity-90">AI Assistant for {companyName}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
            </div>

            {/* Content */}
            {!isMinimized && (
              <div className="h-96 flex flex-col">
                <ChatInterface 
                  messages={messages}
                  isTyping={isTyping}
                  message={message}
                  setMessage={setMessage}
                  handleSendMessage={handleSendMessage}
                  handleKeyPress={handleKeyPress}
                  assistantName={assistantName}
                  primaryColor={primaryColor}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      {!isOpen && (
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full shadow-lg relative overflow-hidden"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="absolute inset-0 animate-pulse bg-white/20 rounded-full" />
            <MessageCircle className="h-6 w-6 text-white" />
            <Sparkles className="h-3 w-3 text-white absolute top-2 right-2 animate-bounce" />
          </Button>
        </motion.div>
      )}
    </div>
  );
};

// Separate chat interface component for reusability
const ChatInterface: React.FC<{
  messages: any[];
  isTyping: boolean;
  message: string;
  setMessage: (msg: string) => void;
  handleSendMessage: () => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  assistantName: string;
  primaryColor: string;
}> = ({ 
  messages, 
  isTyping, 
  message, 
  setMessage, 
  handleSendMessage, 
  handleKeyPress,
  assistantName,
  primaryColor 
}) => {
  return (
    <>
      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg text-sm ${
                msg.isUser
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
              style={{
                backgroundColor: msg.isUser ? primaryColor : undefined
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 p-3 rounded-lg text-sm flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              {assistantName} is typing...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder={`Ask ${assistantName} for help...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isTyping}
            className="text-sm"
          />
          <Button
            size="sm"
            onClick={handleSendMessage}
            disabled={!message.trim() || isTyping}
            className="px-3"
            style={{ backgroundColor: primaryColor }}
          >
            {isTyping ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </>
  );
};