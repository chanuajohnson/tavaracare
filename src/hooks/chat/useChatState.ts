
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
  const [isCompleted, setIsCompleted] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const chatInitializedRef = useRef(false);
  const resumedConversationRef = useRef(false);

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
  
  // Track whether conversation has been resumed for better context awareness
  useEffect(() => {
    if (isResuming && !resumedConversationRef.current) {
      resumedConversationRef.current = true;
      console.log("[useChatState] Marked conversation as resumed");
    }
  }, [isResuming]);
  
  // Custom input setter to handle input changes and validation
  const handleInputChange = (value: string) => {
    setInput(value);
    
    // Clear validation error when input field is emptied
    if (!value && validationError) {
      setValidationError(undefined);
    }
  };
  
  // Mark chat as completed
  const markAsCompleted = () => {
    setIsCompleted(true);
    setConversationStage("completion");
    localStorage.setItem(`tavara_chat_completed_${localStorage.getItem("tavara_chat_session")}`, "true");
    console.log("[useChatState] Chat marked as completed");
  };
  
  // Check if chat was previously completed
  useEffect(() => {
    const sessionId = localStorage.getItem("tavara_chat_session");
    if (sessionId) {
      const wasCompleted = localStorage.getItem(`tavara_chat_completed_${sessionId}`);
      if (wasCompleted === "true") {
        setIsCompleted(true);
        setConversationStage("completion");
        console.log("[useChatState] Loaded previously completed chat state");
      }
    }
  }, []);
  
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
    setIsCompleted(false);
    setIsInputFocused(false);
    chatInitializedRef.current = false;
    resumedConversationRef.current = false;
    
    // Remove completion marker
    const sessionId = localStorage.getItem("tavara_chat_session");
    if (sessionId) {
      localStorage.removeItem(`tavara_chat_completed_${sessionId}`);
    }
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
    setFieldType,
    isResumedConversation: resumedConversationRef.current,
    isCompleted,
    markAsCompleted,
    isInputFocused,
    setIsInputFocused
  };
};
