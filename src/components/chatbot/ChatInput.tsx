
import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ 
  onSendMessage, 
  disabled = false,
  placeholder = 'Type a message...' 
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 mb-2"
    >
      <input
        ref={inputRef}
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-grow bg-transparent border-none focus:outline-none text-sm"
      />
      <button
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        className={`ml-2 p-1 rounded-full ${
          message.trim() && !disabled
            ? 'text-primary-500 hover:bg-primary-50'
            : 'text-gray-300 cursor-not-allowed'
        }`}
      >
        <Send className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
