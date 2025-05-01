
import { processConversation } from "@/utils/chat/chatFlowEngine";
import { 
  validateChatInput,
  saveChatResponse,
  getCurrentQuestion
} from "@/services/chatbotService";
import { toast } from "sonner";
import { ChatConfig } from "@/utils/chat/engine/types";
import { ChatMessage } from "@/types/chatTypes";
import { useChatFieldUtils } from "@/hooks/chat/actions/useChatFieldUtils";
import { v4 as uuidv4 } from 'uuid';

interface UseMessageInputProps {
  sessionId: string;
  messages: ChatMessage[];
  addMessage: (message: any) => void;
  progress: any;
  updateProgress: (updates: any) => void;
  formData: Record<string, any>;
  setFormData: (updater: (prev: Record<string, any>) => Record<string, any>) => void;
  currentSectionIndex: number;
  currentQuestionIndex: number;
  setInput: (value: string) => void;
  conversationStage: "intro" | "questions" | "completion";
  config: ChatConfig;
  simulateBotTyping: (message: string, options?: any) => Promise<void>;
  alwaysShowOptions: boolean;
  advanceToNextQuestion: (currentQuestionId: string) => Promise<void>;
  setValidationError: (error?: string) => void;
  getFieldTypeForCurrentQuestion: (sectionIndex?: number, questionIndex?: number, role?: string | null) => string | null;
}

export const useMessageInput = ({
  sessionId,
  messages,
  addMessage,
  progress,
  formData,
  setFormData,
  currentSectionIndex,
  currentQuestionIndex,
  setInput,
  conversationStage,
  config,
  simulateBotTyping,
  alwaysShowOptions,
  advanceToNextQuestion,
  setValidationError,
  getFieldTypeForCurrentQuestion
}: UseMessageInputProps) => {
  const { detectFieldTypeFromMessage } = useChatFieldUtils();
  
  const handleSendMessage = async (e?: React.FormEvent, inputValue?: string) => {
    if (e) {
      e.preventDefault();
    }
    
    const trimmedInput = inputValue?.trim() || "";
    if (!trimmedInput) {
      console.log("[useMessageInput] Empty input, not submitting");
      return;
    }
    
    console.log(`[useMessageInput] Processing message: "${trimmedInput}" with role: ${progress.role || 'unknown'}`);
    
    // Special handling for completion stage
    if (conversationStage === "completion") {
      const userMessage: ChatMessage = {
        id: uuidv4(),
        content: trimmedInput,
        isUser: true,
        timestamp: Date.now()
      };
      
      addMessage(userMessage);
      
      setInput("");
      
      await simulateBotTyping(
        "Thanks for your message. Would you like to proceed with registration or speak with a representative?",
        [
          { id: "proceed_to_registration", label: "Complete my registration" },
          { id: "talk_to_representative", label: "I'd like to talk to a representative first" }
        ]
      );
      
      return;
    }
    
    // First attempt: Get field type from question structure
    let questionType = getFieldTypeForCurrentQuestion(
      currentSectionIndex, 
      currentQuestionIndex, 
      progress.role
    );
    
    // Second attempt: If no field type detected, try to get it from the last bot message
    if (!questionType && messages.length > 0) {
      const lastBotMessage = [...messages].reverse().find(msg => !msg.isUser);
      
      if (lastBotMessage) {
        const detectedType = detectFieldTypeFromMessage(lastBotMessage.content);
        if (detectedType) {
          questionType = detectedType;
          console.log(`[useMessageInput] Detected field type from message: ${questionType}`);
        }
      }
    }
    
    console.log(`[useMessageInput] Using field type: ${questionType || 'none'}, progress.role: ${progress.role}`);
    
    const currentQuestion = progress.role ? getCurrentQuestion(
      progress.role,
      currentSectionIndex,
      currentQuestionIndex
    ) : null;
    
    // Perform field validation based on detected type
    if (questionType) {
      const validationResult = validateChatInput(trimmedInput, questionType);
      
      if (!validationResult.isValid) {
        console.log(`[useMessageInput] Validation failed for ${questionType}: ${validationResult.errorMessage}`);
        setValidationError(validationResult.errorMessage);
        toast.error(validationResult.errorMessage || `Invalid ${questionType} format`);
        return;
      } else {
        console.log(`[useMessageInput] Validation passed for ${questionType}`);
        setValidationError(undefined);
        if (questionType === "email" || questionType === "phone" || questionType === "name") {
          toast.success(`Valid ${questionType} format!`);
        }
      }
    }
    
    const userMessage: ChatMessage = {
      id: uuidv4(),
      content: trimmedInput,
      isUser: true,
      timestamp: Date.now()
    };
    
    addMessage(userMessage);
    setInput("");
    
    const currentQuestionId = `section_${currentSectionIndex}_question_${currentQuestionIndex}`;
    
    setFormData(prev => ({
      ...prev,
      [currentQuestionId]: trimmedInput
    }));
    
    try {
      if (progress.role) {
        await saveChatResponse(
          sessionId,
          progress.role,
          currentSectionIndex.toString(),
          currentQuestionId,
          trimmedInput
        );
      }
    } catch (error) {
      console.error("Error saving response:", error);
    }
    
    if (progress.role) {
      await advanceToNextQuestion(currentQuestionId);
    } else {
      try {
        const response = await processConversation(
          [...messages, userMessage],
          sessionId,
          null,
          0,
          config
        );
        
        // Pass the field type to simulateBotTyping for proper formatting
        await simulateBotTyping(
          response.message, 
          response.options || (alwaysShowOptions ? [
            { id: "family", label: "I need care for someone" },
            { id: "professional", label: "I provide care services" },
            { id: "community", label: "I want to support the community" }
          ] : undefined)
        );
      } catch (error) {
        console.error("Error detecting user role:", error);
        await simulateBotTyping(
          "I'd like to help you better. Are you looking for caregiving services, offering professional care, or interested in community support?",
          [
            { id: "family", label: "I need care for someone" },
            { id: "professional", label: "I provide care services" },
            { id: "community", label: "I want to support the community" }
          ]
        );
      }
    }
  };

  return {
    handleSendMessage
  };
};
