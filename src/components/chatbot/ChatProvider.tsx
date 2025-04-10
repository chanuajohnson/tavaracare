
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  setFullScreen: (fullScreen: boolean) => void;
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

  // Allow toggling the chat state
  const toggleChat = () => {
    console.log('ChatProvider: Toggling chat, current state:', isOpen);
    setIsOpen(prev => !prev);
  };

  // Explicitly open the chat
  const openChat = () => {
    console.log('ChatProvider: Opening chat');
    setIsOpen(true);
  };

  // Explicitly close the chat
  const closeChat = () => {
    console.log('ChatProvider: Closing chat and resetting fullscreen');
    setIsOpen(false);
    setIsFullScreen(false);
  };

  // Set full screen mode
  const setFullScreen = (fullScreen: boolean) => {
    console.log('ChatProvider: Setting fullscreen mode to:', fullScreen);
    setIsFullScreen(fullScreen);
    if (fullScreen) {
      // Ensure chat is open when going fullscreen
      setIsOpen(true);
    }
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
      setFullScreen
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
