
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ChatContextType {
  isOpen: boolean;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  initialRole: string | null;
  setInitialRole: (role: string | null) => void;
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

  // Check if chat was previously open and if there's an initial role
  useEffect(() => {
    const savedState = localStorage.getItem('tavara_chat_is_open');
    if (savedState === 'true') {
      setIsOpen(true);
    }
    
    const savedRole = localStorage.getItem('tavara_chat_initial_role');
    if (savedRole) {
      setInitialRole(savedRole);
    }
  }, []);

  return (
    <ChatContext.Provider value={{ 
      isOpen, 
      toggleChat, 
      openChat, 
      closeChat,
      initialRole,
      setInitialRole
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
