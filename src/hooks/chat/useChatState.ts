
import { useState, useRef, useEffect } from "react";
import { validateChatInput } from "@/services/chat/utils/inputValidation";

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

  // Validate input whenever it changes or field type changes
  useEffect(() => {
    // If we have both input and field type, validate
    if (fieldType && input) {
      const validationResult = validateChatInput(input, fieldType);
      
      if (validationResult.isValid) {
        // Clear validation error if input is now valid
        if (validationError) {
          setValidationError(undefined);
        }
      } else {
        // Only set validation error if the user has actually started typing
        // This prevents showing errors immediately when a question is displayed
        if (input.length > 1) {
          setValidationError(validationResult.errorMessage);
        }
      }
    } else if (!input && validationError) {
      // Clear validation error if input is cleared
      setValidationError(undefined);
    }
  }, [input, fieldType, validationError]);
  
  // Custom input setter to handle input changes and validation
  const handleInputChange = (value: string) => {
    setInput(value);
    
    // If field type exists, validate immediately but don't set errors on initial input
    if (fieldType && value.length > 1) {
      const validationResult = validateChatInput(value, fieldType);
      setValidationError(validationResult.isValid ? undefined : validationResult.errorMessage);
    }
  };
  
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
    setInput: handleInputChange,
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
