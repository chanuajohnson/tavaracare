
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
    // Don't show validation errors for empty or very short inputs
    if (!input || input.length <= 1) {
      if (validationError) {
        setValidationError(undefined);
      }
      return;
    }
    
    // If we have both input and field type, validate
    if (fieldType && input.length > 1) {
      console.log(`[useChatState] Validating input: "${input}" as type: ${fieldType}`);
      
      const validationResult = validateChatInput(input, fieldType);
      
      if (!validationResult.isValid) {
        console.log(`[useChatState] Validation error: ${validationResult.errorMessage}`);
        setValidationError(validationResult.errorMessage);
      } else {
        console.log(`[useChatState] Input is valid for type: ${fieldType}`);
        if (validationError) {
          setValidationError(undefined);
        }
      }
    }
  }, [input, fieldType, validationError]);
  
  // Custom input setter to handle input changes and validation
  const handleInputChange = (value: string) => {
    setInput(value);
    
    // Clear validation error when input field is emptied
    if (!value && validationError) {
      setValidationError(undefined);
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
