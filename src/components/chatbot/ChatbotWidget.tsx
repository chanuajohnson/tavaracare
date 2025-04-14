
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
  debugMode?: boolean;
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ 
  className,
  width = "320px",
  onClose,
  hideHeader = false,
  debugMode = process.env.NODE_ENV === 'development'
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
    resetChatState,
    validationError,
    setValidationError
  } = useChatState();
  
  const config = loadChatConfig();
  const alwaysShowOptions = shouldAlwaysShowOptions();
  
  // Log config in development mode
  React.useEffect(() => {
    if (debugMode) {
      console.log(`[Chat] Config loaded: mode=${config.mode}, temperature=${config.temperature}`, config);
    }
  }, [debugMode]);
  
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
    setIsResuming,
    setValidationError
  );

  useEffect(() => {
    const setupChat = async () => {
      if (chatInitializedRef.current) return;
      chatInitializedRef.current = true;
      
      if (debugMode) {
        console.log("[Chat] Initializing chat with:", { 
          sessionId, 
          initialRole,
          skipIntro, 
          messagesLength: messages.length 
        });
      }
      
      await initializeChat();
    };
    
    const timer = setTimeout(setupChat, 100);
    return () => clearTimeout(timer);
  }, [messages.length, initialRole, skipIntro, progress, sessionId]);

  // Debug panel for development
  const DebugPanel = debugMode ? (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs z-50 max-w-xs overflow-auto max-h-48">
      <h4 className="font-bold">Chat Debug</h4>
      <div>Mode: <span className="text-green-400">{config.mode}</span></div>
      <div>Stage: <span className="text-yellow-400">{conversationStage}</span></div>
      <div>Role: <span className="text-blue-400">{progress.role || "not set"}</span></div>
      <div>Index: <span className="text-purple-400">{currentSectionIndex}.{currentQuestionIndex}</span></div>
      <div>Messages: <span className="text-orange-400">{messages.length}</span></div>
      <div>Session ID: <span className="text-gray-400 text-[10px]">{sessionId.slice(0, 8)}...</span></div>
    </div>
  ) : null;

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
        validationError={validationError}
      />

      {/* Debug panel for development mode */}
      {DebugPanel}
    </div>
  );
};
