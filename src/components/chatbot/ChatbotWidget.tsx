
import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useChatMessages } from "@/hooks/chat/useChatMessages";
import { useChatSession } from "@/hooks/chat/useChatSession";
import { useChat } from "./ChatProvider";
import { useChatProgress } from "@/hooks/chat/useChatProgress";
import { ChatMessagesList } from "./ChatMessagesList";
import { loadChatConfig, shouldAlwaysShowOptions } from "@/utils/chat/chatConfig";
import { syncMessagesToSupabase } from "@/services/aiService";
import { ChatHeader } from "./ChatHeader";
import { RegistrationLink } from "./RegistrationLink";
import { ChatInputForm } from "./ChatInputForm";
import { useChatState } from "@/hooks/chat/useChatState";
import { useChatTyping } from "@/hooks/chat/useChatTyping";
import { useChatActions } from "@/hooks/chat/useChatActions";

interface ChatbotWidgetProps {
  className?: string;
  width?: string;
  onClose?: () => void;
  hideHeader?: boolean;
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ 
  className,
  width = "320px",
  onClose,
  hideHeader = false
}) => {
  const { sessionId } = useChatSession();
  const { messages, addMessage, clearMessages } = useChatMessages(sessionId);
  const { initialRole, setInitialRole, skipIntro } = useChat();
  const { progress, updateProgress, clearProgress } = useChatProgress();
  
  const {
    conversationStage,
    setConversationStage,
    isResuming,
    setIsResuming,
    currentSectionIndex,
    setCurrentSectionIndex,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    formData,
    setFormData,
    input,
    setInput,
    showOptions,
    setShowOptions,
    chatInitializedRef,
    resetChatState
  } = useChatState();
  
  const [config] = React.useState(() => loadChatConfig());
  const alwaysShowOptions = shouldAlwaysShowOptions();
  
  const { isTyping, simulateBotTyping } = useChatTyping({ 
    addMessage, 
    syncMessagesToSupabase, 
    messages,
    sessionId,
    role: progress.role
  });
  
  const {
    handleRoleSelection,
    handleOptionSelection,
    handleSendMessage,
    resetChat,
    initializeChat
  } = useChatActions(
    sessionId,
    messages,
    addMessage,
    progress,
    updateProgress,
    formData,
    setFormData,
    currentSectionIndex,
    setCurrentSectionIndex,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    setConversationStage,
    config,
    setInitialRole,
    clearMessages,
    clearProgress,
    simulateBotTyping,
    resetChatState,
    alwaysShowOptions,
    input,
    setInput,
    conversationStage,
    skipIntro,
    setIsResuming
  );

  useEffect(() => {
    const setupChat = async () => {
      if (chatInitializedRef.current) return;
      chatInitializedRef.current = true;
      
      await initializeChat();
    };
    
    const timer = setTimeout(setupChat, 100);
    return () => clearTimeout(timer);
  }, [messages.length, initialRole, skipIntro, progress, sessionId]);

  return (
    <div 
      className={cn(
        "bg-background border rounded-lg shadow-xl flex flex-col z-40 h-[500px]",
        className
      )}
      style={{ width }}
    >
      <ChatHeader
        hideHeader={hideHeader}
        onClose={onClose}
        onReset={() => resetChat(true)}
      />

      <ChatMessagesList 
        messages={messages}
        isTyping={isTyping}
        isResuming={isResuming}
        conversationStage={conversationStage}
        handleRoleSelection={handleRoleSelection}
        handleOptionSelection={handleOptionSelection}
        alwaysShowOptions={alwaysShowOptions}
      />

      <RegistrationLink role={progress.role} />

      <ChatInputForm
        input={input}
        setInput={setInput}
        handleSendMessage={handleSendMessage}
        isTyping={isTyping}
        conversationStage={conversationStage}
        isResuming={isResuming}
      />
    </div>
  );
};
