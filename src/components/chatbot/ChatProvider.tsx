
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChatMessage } from '@/types/chatTypes';

interface ChatContextType {
  isOpen: boolean;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  initialRole: string | null;
  setInitialRole: (role: string | null) => void;
  skipIntro: boolean;
  setSkipIntro: (skip: boolean) => void;
  isFullScreen: boolean;
  openFullScreenChat: () => void;
  closeFullScreenChat: () => void;
  messages: ChatMessage[]; // Adding messages property to the context
  setMessages: (messages: ChatMessage[]) => void; // Adding setter for messages
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
  initialOpen?: boolean;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ 
  children,
  initialOpen = false
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [initialRole, setInitialRole] = useState<string | null>(null);
  const [skipIntro, setSkipIntro] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]); // Adding messages state

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

  // Open in full-screen mode
  const openFullScreenChat = () => {
    openChat(); // Make sure chat is open first
    setIsFullScreen(true);
  };

  // Close full-screen mode
  const closeFullScreenChat = () => {
    setIsFullScreen(false);
  };

  // Store chat state in local storage
  useEffect(() => {
    localStorage.setItem('tavara_chat_is_open', isOpen ? 'true' : 'false');
  }, [isOpen]);

  // Check if chat was previously open and if there's an initial role
  useEffect(() => {
    const savedState = localStorage.getItem('tavara_chat_is_open');
    if (savedState === 'true') {
      setIsOpen(true);
    }
    
    const savedRole = localStorage.getItem('tavara_chat_initial_role');
    if (savedRole) {
      setInitialRole(savedRole);
      setSkipIntro(true); // Skip intro when a role is defined
    }
  }, []);

  return (
    <ChatContext.Provider value={{ 
      isOpen, 
      toggleChat, 
      openChat, 
      closeChat,
      initialRole,
      setInitialRole,
      skipIntro,
      setSkipIntro,
      isFullScreen,
      openFullScreenChat,
      closeFullScreenChat,
      messages, // Provide messages in the context
      setMessages // Provide the setter in the context
    }}>
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
