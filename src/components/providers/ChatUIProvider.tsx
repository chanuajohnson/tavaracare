
import React, { createContext, useContext, useState } from "react";

type ChatUIContextType = {
  isChatOpen: boolean;
  setIsChatOpen: (isOpen: boolean) => void;
  toggleChat: () => void;
};

const ChatUIContext = createContext<ChatUIContextType | undefined>(undefined);

export const ChatUIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const toggleChat = () => setIsChatOpen((prev) => !prev);

  return (
    <ChatUIContext.Provider value={{ isChatOpen, setIsChatOpen, toggleChat }}>
      {children}
    </ChatUIContext.Provider>
  );
};

export const useChatUI = () => {
  const context = useContext(ChatUIContext);
  if (!context) throw new Error("useChatUI must be used within a ChatUIProvider");
  return context;
};
