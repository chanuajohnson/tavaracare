
import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { Minimize2, X, Loader2, Maximize2 } from 'lucide-react';
import { ChatbotMessage } from '@/types/chatbotTypes';

interface ChatWindowProps {
  messages: ChatbotMessage[];
  isLoading: boolean;
  isMinimized: boolean;
  onSendMessage: (message: string) => void;
  onOptionSelect: (value: string) => void;
  onMinimize: () => void;
  onClose: () => void;
}

export function ChatWindow({
  messages,
  isLoading,
  isMinimized,
  onSendMessage,
  onOptionSelect,
  onMinimize,
  onClose,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={
        isMinimized
          ? { opacity: 1, y: 0, scale: 0.95, height: '60px' }
          : { opacity: 1, y: 0, scale: 1, height: 'auto' }
      }
      transition={{ duration: 0.3 }}
      className="bg-gray-50 rounded-lg shadow-xl border border-gray-200 overflow-hidden"
      style={{ width: '340px', maxWidth: '90vw' }}
    >
      <div className="flex items-center justify-between bg-white border-b border-gray-200 p-3">
        <div className="flex items-center">
          <img
            src="/lovable-uploads/442348ff-8c87-4db3-bcb9-fd007795375c.png"
            alt="Tavara Bot"
            className="h-6 w-6 rounded-full mr-2"
          />
          <h3 className="font-medium text-sm">Tavara Care Assistant</h3>
        </div>
        <div className="flex items-center">
          <button
            onClick={onMinimize}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="h-[350px] max-h-[calc(80vh-120px)] overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <ChatMessage
                    key={msg.id || `msg-${index}`}
                    message={msg}
                    onOptionSelect={onOptionSelect}
                  />
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center my-4"
                  >
                    <Loader2 className="h-5 w-5 text-primary-500 animate-spin" />
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            <div className="bg-white p-3 border-t border-gray-200">
              <ChatInput 
                onSendMessage={onSendMessage}
                disabled={isLoading}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
