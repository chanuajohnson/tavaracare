
import { getIntroMessage, getRoleOptions } from "@/data/chatIntroMessage";
import { ChatConfig } from "@/utils/chat/engine/types";

interface UseChatResetProps {
  sessionId: string;
  clearMessages: () => void;
  clearProgress: () => void;
  resetChatState: () => void;
  simulateBotTyping: (message: string, options?: any) => Promise<void>;
  setValidationError: (error?: string) => void;
  setFieldType: (type: string | null) => void;
}

export const useChatReset = ({
  sessionId,
  clearMessages,
  clearProgress,
  resetChatState,
  simulateBotTyping,
  setValidationError,
  setFieldType
}: UseChatResetProps) => {
  
  const resetChat = (manual = false) => {
    clearMessages();
    clearProgress();
    resetChatState();
    
    localStorage.removeItem(`tavara_chat_progress_${sessionId}`);
    
    if (manual) {
      setTimeout(async () => {
        const introMessage = getIntroMessage();
        await simulateBotTyping(introMessage, getRoleOptions());
      }, 100);
    }
    
    setValidationError(undefined);
    setFieldType(null);
  };

  const initializeChat = async (
    storedProgress: string | null, 
    messages: any[], 
    skipIntro: boolean, 
    progress: any,
    setIsResuming: (value: boolean) => void
  ) => {
    if (skipIntro && progress.role) {
      return { action: 'handleInitialRole', role: progress.role };
    } else if (storedProgress && messages.length === 0 && !skipIntro) {
      setIsResuming(true);
      const introMessage = "Welcome back! Would you like to continue where you left off?";
      await simulateBotTyping(introMessage, [
        { id: "resume", label: "Yes, continue" },
        { id: "restart", label: "No, start over" }
      ]);
    } else if (messages.length === 0) {
      const introMessage = getIntroMessage();
      await simulateBotTyping(introMessage, getRoleOptions());
    }
    return { action: 'none' };
  };

  return {
    resetChat,
    initializeChat
  };
};
