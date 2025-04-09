
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ChatContextType {
  isOpen: boolean;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Allow toggling the chat state
  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  // Explicitly open the chat
  const openChat = () => {
    setIsOpen(true);
  };

  // Explicitly close the chat
  const closeChat = () => {
    setIsOpen(false);
  };

  // Store chat state in local storage
  useEffect(() => {
    localStorage.setItem('tavara_chat_is_open', isOpen ? 'true' : 'false');
  }, [isOpen]);

  // Check if chat was previously open
  useEffect(() => {
    const savedState = localStorage.getItem('tavara_chat_is_open');
    if (savedState === 'true') {
      setIsOpen(true);
    }
  }, []);

  return (
    <ChatContext.Provider value={{ isOpen, toggleChat, openChat, closeChat }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
