
import { useState, useRef } from "react";

export const useChatState = () => {
  const [conversationStage, setConversationStage] = useState<"intro" | "questions" | "completion">("intro");
  const [isResuming, setIsResuming] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [input, setInput] = useState("");
  const [showOptions, setShowOptions] = useState(true);
  const [validationError, setValidationError] = useState<string | undefined>();
  const chatInitializedRef = useRef(false);

  const resetChatState = () => {
    setConversationStage("intro");
    setIsResuming(false);
    setCurrentSectionIndex(0);
    setCurrentQuestionIndex(0);
    setFormData({});
    setInput("");
    setShowOptions(true);
    setValidationError(undefined);
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
    setValidationError
  };
};
