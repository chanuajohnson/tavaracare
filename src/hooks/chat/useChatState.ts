
import { useState, useRef, useEffect } from "react";
import { validateChatInput } from "@/services/chatbotService";

export const useChatState = () => {
  const [conversationStage, setConversationStage] = useState<"intro" | "questions" | "completion">("intro");
  const [isResuming, setIsResuming] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [input, setInput] = useState("");
  const [showOptions, setShowOptions] = useState(true);
  const [validationError, setValidationError] = useState<string | undefined>();
  const [fieldType, setFieldType] = useState<string | null>(null);
  const chatInitializedRef = useRef(false);

  // Clear validation errors when input changes
  useEffect(() => {
    if (validationError && input) {
      // Only validate if we have a field type and the input has changed
      if (fieldType) {
        const validationResult = validateChatInput(input, fieldType);
        
        if (validationResult.isValid) {
          setValidationError(undefined);
        }
      }
    }
  }, [input, validationError, fieldType]);
  
  const resetChatState = () => {
    setConversationStage("intro");
    setIsResuming(false);
    setCurrentSectionIndex(0);
    setCurrentQuestionIndex(0);
    setFormData({});
    setInput("");
    setShowOptions(true);
    setValidationError(undefined);
    setFieldType(null);
    chatInitializedRef.current = false;
  };

  return {
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
    setFieldType
  };
};
