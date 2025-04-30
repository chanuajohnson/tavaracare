
import React, { useEffect } from "react";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { ChatContainer } from "./components/ChatContainer";
import { ChatDebugPanel } from "./components/ChatDebugPanel";
import { ChatProgressIndicator } from "./components/ChatProgressIndicator";
import { ChatCompletionMessage } from "./components/ChatCompletionMessage";

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
  const { messages, addMessage, clearMessages, setMessages: setLocalMessages } = useChatMessages(sessionId);
  const { initialRole, setInitialRole, skipIntro, setMessages: setContextMessages } = useChat();
  const { progress, updateProgress, clearProgress } = useChatProgress();
  
  useEffect(() => {
    setContextMessages(messages);
  }, [messages, setContextMessages]);
  
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
    setValidationError,
    fieldType,
    setFieldType,
    isCompleted,
    markAsCompleted
  } = useChatState();
  
  const config = loadChatConfig();
  const alwaysShowOptions = shouldAlwaysShowOptions();
  const isMobile = useIsMobile();
  
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
    initializeChat,
    getFieldTypeForCurrentQuestion
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
    setValidationError,
    setFieldType,
    markAsCompleted
  );

  // Set appropriate field type when section or question changes
  useEffect(() => {
    if (progress.role && conversationStage === "questions") {
      const detectedFieldType = getFieldTypeForCurrentQuestion(
        currentSectionIndex, 
        currentQuestionIndex, 
        progress.role
      );
      setFieldType(detectedFieldType);
      console.log(`[ChatbotWidget] Set field type to ${detectedFieldType} for current question`);
    }
  }, [currentSectionIndex, currentQuestionIndex, progress.role, conversationStage]);

  const handleRegistrationClick = () => {
    if (progress.role && sessionId) {
      window.location.href = `/registration/${progress.role}?session=${sessionId}`;
    }
  };

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

  // Show completion state if chat is completed
  if (isCompleted) {
    return (
      <ChatContainer className={className} width={width}>
        <ChatHeader
          hideHeader={hideHeader}
          onClose={onClose}
          onReset={() => resetChat(true)}
        />
        
        <ChatCompletionMessage 
          role={progress.role}
          onStartNewChat={() => resetChat(true)}
          onClose={onClose}
        />
      </ChatContainer>
    );
  }

  return (
    <ChatContainer className={className} width={width}>
      <ChatHeader
        hideHeader={hideHeader}
        onClose={onClose}
        onReset={() => resetChat(true)}
      />

      <ChatProgressIndicator 
        role={progress.role}
        sectionIndex={currentSectionIndex}
        questionIndex={currentQuestionIndex}
        conversationStage={conversationStage}
      />

      <ChatMessagesList 
        messages={messages}
        isTyping={isTyping}
        isResuming={isResuming}
        conversationStage={conversationStage}
        handleRoleSelection={handleRoleSelection}
        handleOptionSelection={handleOptionSelection}
        alwaysShowOptions={alwaysShowOptions}
        currentSectionIndex={currentSectionIndex}
      />

      <RegistrationLink 
        role={progress.role} 
        onRegistrationClick={handleRegistrationClick}
      />

      <ChatInputForm 
        input={input}
        setInput={setInput}
        handleSendMessage={handleSendMessage}
        isTyping={isTyping}
        conversationStage={conversationStage}
        isResuming={isResuming}
        validationError={validationError}
        fieldType={fieldType}
      />

      <ChatDebugPanel 
        debugMode={debugMode}
        config={config}
        conversationStage={conversationStage}
        progress={progress}
        currentSectionIndex={currentSectionIndex}
        currentQuestionIndex={currentQuestionIndex}
        messages={messages}
        sessionId={sessionId}
      />
    </ChatContainer>
  );
};
