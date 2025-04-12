
import React, { useState, useEffect, useRef } from "react";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useChatMessages } from "@/hooks/chat/useChatMessages";
import { useChatSession } from "@/hooks/chat/useChatSession";
import { getIntroMessage, getRoleOptions } from "@/data/chatIntroMessage";
import { generatePrefillJson } from "@/utils/chat/prefillGenerator";
import { useChat } from "./ChatProvider";
import { useChatProgress } from "@/hooks/chat/useChatProgress";
import { ChatMessagesList } from "./ChatMessagesList";
import { processConversation } from "@/utils/chat/chatFlowEngine";
import { syncMessagesToSupabase } from "@/services/aiService";
import { 
  loadChatConfig, 
  shouldAlwaysShowOptions 
} from "@/utils/chat/chatConfig";
import { getOrCreateSessionId, saveChatResponse, updateChatProgress } from "@/services/chatbotService";
import { toast } from "sonner";

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
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const [conversationStage, setConversationStage] = useState<"intro" | "questions" | "completion">("intro");
  const [isResuming, setIsResuming] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const chatInitializedRef = useRef(false);
  
  const { sessionId } = useChatSession();
  const { messages, addMessage, clearMessages } = useChatMessages(sessionId);
  const { initialRole, setInitialRole, skipIntro, setSkipIntro } = useChat();
  const { progress, updateProgress, clearProgress } = useChatProgress();
  
  // Chat configuration
  const [config] = useState(() => loadChatConfig());
  const alwaysShowOptions = shouldAlwaysShowOptions();
  
  // Fixed initialization logic to avoid multiple intro messages
  useEffect(() => {
    const initializeChat = async () => {
      if (chatInitializedRef.current) return;
      chatInitializedRef.current = true;
      
      // Check for stored progress to resume conversation
      const storedProgress = localStorage.getItem(`tavara_chat_progress_${sessionId}`);
      
      if (initialRole) {
        // If initial role is set, use it
        handleInitialRoleSelection(initialRole);
      } else if (skipIntro && progress.role) {
        // If skipping intro and role exists in progress
        handleInitialRoleSelection(progress.role);
      } else if (storedProgress && messages.length === 0 && !skipIntro) {
        // If there's stored progress but no messages yet
        setIsResuming(true);
        const introMessage = "Welcome back! Would you like to continue where you left off?";
        await simulateBotTyping(introMessage, [
          { id: "resume", label: "Yes, continue" },
          { id: "restart", label: "No, start over" }
        ]);
      } else if (messages.length === 0) {
        // Standard intro for new conversations
        const introMessage = getIntroMessage();
        await simulateBotTyping(introMessage, getRoleOptions());
      }
    };
    
    // Small delay to ensure components are mounted
    const timer = setTimeout(initializeChat, 100);
    return () => clearTimeout(timer);
  }, [messages.length, initialRole, skipIntro, progress, sessionId]);
  
  const handleInitialRoleSelection = async (roleId: string) => {
    // Reset section and question indices
    setCurrentSectionIndex(0);
    setCurrentQuestionIndex(0);
    
    updateProgress({
      role: roleId,
      questionIndex: 0
    });
    
    setInitialRole(null);
    localStorage.removeItem('tavara_chat_initial_role');
    
    // Store the user role in formData
    setFormData(prev => ({
      ...prev,
      role: roleId
    }));
    
    // Create or update progress in database
    try {
      await updateChatProgress(
        sessionId,
        roleId,
        "0", // Start with first section
        "not_started",
        undefined,
        { role: roleId }
      );
    } catch (error) {
      console.error("Error updating chat progress:", error);
    }
    
    const response = await processConversation(
      [], // Start with empty messages
      sessionId,
      roleId,
      0,
      config
    );
    
    await simulateBotTyping(response.message, response.options);
    setConversationStage("questions");
  };

  const simulateBotTyping = async (message: string, options?: { id: string; label: string; subtext?: string }[]) => {
    setIsTyping(true);
    
    // Calculate a dynamic typing delay based on message length
    const baseDelay = 300;
    const charDelay = 10;
    const maxDelay = 1500;
    const delay = Math.min(baseDelay + message.length * charDelay, maxDelay);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    addMessage({
      content: message,
      isUser: false,
      timestamp: Date.now(),
      options: options || (alwaysShowOptions ? getRoleOptions() : undefined)
    });
    
    setIsTyping(false);
    
    // Sync messages with Supabase - catch errors silently to prevent UI disruption
    syncMessagesToSupabase(
      [...messages, { content: message, isUser: false, timestamp: Date.now() }], 
      sessionId,
      progress.role || undefined
    ).catch(err => console.error('Error syncing messages:', err));
  };

  const handleRoleSelection = async (roleId: string) => {
    if (roleId === "resume") {
      setIsResuming(false);
      try {
        const partialProgress = JSON.parse(localStorage.getItem(`tavara_chat_progress_${sessionId}`) || "{}");
        if (partialProgress.role) {
          updateProgress({
            role: partialProgress.role,
            questionIndex: partialProgress.questionIndex || 0
          });
          
          // Set the section and question indices
          setCurrentSectionIndex(Math.floor((partialProgress.questionIndex || 0) / 10));
          setCurrentQuestionIndex((partialProgress.questionIndex || 0) % 10);
          
          setConversationStage("questions");
          
          const response = await processConversation(
            messages,
            sessionId,
            partialProgress.role,
            partialProgress.questionIndex || 0, 
            config
          );
          
          await simulateBotTyping("Great! Let's continue where we left off. " + response.message, response.options);
        }
      } catch (error) {
        console.error("Error resuming chat:", error);
        resetChat(true); // Fall back to a reset if resume fails
        return;
      }
      return;
    }
    
    if (roleId === "restart") {
      resetChat(true); // Pass true to indicate a manual reset
      return;
    }
    
    // Add user selection as a message
    addMessage({
      content: `I'm a ${roleId}.`,
      isUser: true,
      timestamp: Date.now()
    });
    
    // Save the user's role in the database
    try {
      await saveChatResponse(
        sessionId,
        roleId,
        "intro",
        "role_selection",
        roleId
      );
      
      // Create or update progress in database
      await updateChatProgress(
        sessionId,
        roleId,
        "0", // Start with first section
        "not_started",
        "role_selection",
        { role: roleId }
      );
    } catch (error) {
      console.error("Error saving role selection:", error);
    }
    
    // Update local state
    updateProgress({
      role: roleId,
      questionIndex: 0
    });
    
    // Reset section and question indices
    setCurrentSectionIndex(0);
    setCurrentQuestionIndex(0);
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      role: roleId
    }));
    
    try {
      const response = await processConversation(
        [...messages, { content: `I'm a ${roleId}.`, isUser: true, timestamp: Date.now() }],
        sessionId,
        roleId,
        0,
        config
      );
      
      await simulateBotTyping(response.message, response.options);
      setConversationStage("questions");
      setShowOptions(alwaysShowOptions); // Respect the always show options setting
    } catch (error) {
      console.error("Error in role selection:", error);
      await simulateBotTyping("I'm having trouble with your selection. Could you try again?", getRoleOptions());
    }
  };

  const handleOptionSelection = async (optionId: string) => {
    const currentQuestion = `section_${currentSectionIndex}_question_${currentQuestionIndex}`;
    
    // Update form data with the selected option
    setFormData(prev => ({
      ...prev,
      [currentQuestion]: optionId
    }));
    
    // Add user selection as a message
    addMessage({
      content: optionId,
      isUser: true,
      timestamp: Date.now()
    });
    
    // Save the user's response in the database
    try {
      await saveChatResponse(
        sessionId,
        progress.role!,
        currentSectionIndex.toString(),
        currentQuestion,
        optionId
      );
    } catch (error) {
      console.error("Error saving response:", error);
    }
    
    if (progress.role) {
      // Calculate the next question index for our flow
      const nextQuestionIndex = currentQuestionIndex + 1;
      const maxQuestionsPerSection = 10; // Maximum questions per section
      
      // Check if we need to move to the next section
      if (nextQuestionIndex >= maxQuestionsPerSection) {
        setCurrentSectionIndex(currentSectionIndex + 1);
        setCurrentQuestionIndex(0);
      } else {
        setCurrentQuestionIndex(nextQuestionIndex);
      }
      
      // Calculate the overall question index for progress
      const overallQuestionIndex = currentSectionIndex * 10 + nextQuestionIndex;
      
      updateProgress({
        role: progress.role,
        questionIndex: overallQuestionIndex
      });
      
      // Update progress in database
      try {
        await updateChatProgress(
          sessionId,
          progress.role,
          currentSectionIndex.toString(),
          "in_progress",
          currentQuestion,
          formData
        );
      } catch (error) {
        console.error("Error updating chat progress:", error);
      }
      
      const updatedMessages = [...messages, { content: optionId, isUser: true, timestamp: Date.now() }];
      
      try {
        const response = await processConversation(
          updatedMessages,
          sessionId,
          progress.role,
          overallQuestionIndex,
          config
        );
        
        await simulateBotTyping(response.message, response.options);
        
        // If we've completed all questions, move to completion stage
        if (overallQuestionIndex >= 50) { // Some arbitrary limit
          setConversationStage("completion");
        }
      } catch (error) {
        console.error("Error processing option selection:", error);
        await simulateBotTyping("I'm having trouble processing that option. Let's continue with another question.", alwaysShowOptions ? getRoleOptions() : undefined);
      }
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = {
      content: input,
      isUser: true,
      timestamp: Date.now()
    };
    
    addMessage(userMessage);
    setInput("");
    
    const currentQuestion = `section_${currentSectionIndex}_question_${currentQuestionIndex}`;
    
    // Update form data with the user's text response
    setFormData(prev => ({
      ...prev,
      [currentQuestion]: input.trim()
    }));
    
    // Save the user's response in the database
    try {
      await saveChatResponse(
        sessionId,
        progress.role!,
        currentSectionIndex.toString(),
        currentQuestion,
        input.trim()
      );
    } catch (error) {
      console.error("Error saving response:", error);
    }
    
    if (progress.role) {
      // Calculate the next question index for our flow
      const nextQuestionIndex = currentQuestionIndex + 1;
      const maxQuestionsPerSection = 10; // Maximum questions per section
      
      // Check if we need to move to the next section
      if (nextQuestionIndex >= maxQuestionsPerSection) {
        setCurrentSectionIndex(currentSectionIndex + 1);
        setCurrentQuestionIndex(0);
      } else {
        setCurrentQuestionIndex(nextQuestionIndex);
      }
      
      // Calculate the overall question index for progress
      const overallQuestionIndex = currentSectionIndex * 10 + nextQuestionIndex;
      
      updateProgress({
        role: progress.role,
        questionIndex: overallQuestionIndex
      });
      
      // Update progress in database
      try {
        await updateChatProgress(
          sessionId,
          progress.role,
          currentSectionIndex.toString(),
          "in_progress",
          currentQuestion,
          formData
        );
      } catch (error) {
        console.error("Error updating chat progress:", error);
      }
      
      try {
        // If we've completed all questions, finish the conversation
        if (conversationStage === "completion") {
          const prefillJson = generatePrefillJson(progress.role, [
            ...messages, 
            userMessage
          ]);
          
          clearProgress();
          console.log("Generated prefill JSON:", prefillJson);
          return;
        }
        
        const updatedMessages = [...messages, userMessage];
        
        const response = await processConversation(
          updatedMessages,
          sessionId,
          progress.role,
          overallQuestionIndex,
          config
        );
        
        // Check if we've reached the end of the registration flow
        if (overallQuestionIndex >= 50) { // Some arbitrary limit
          setConversationStage("completion");
          
          await simulateBotTyping(
            `Thanks for providing this information! Based on your answers, we recommend completing your ${progress.role} registration. Click below to continue to the registration form with your data pre-filled.`
          );
        } else {
          await simulateBotTyping(response.message, response.options);
        }
      } catch (error) {
        console.error("Error processing conversation:", error);
        toast.error("Sorry, I encountered an error. Please try again.");
        await simulateBotTyping("I'm having trouble processing that. Could you try again or rephrase?", alwaysShowOptions ? getRoleOptions() : undefined);
      }
    } else {
      // If no role selected yet, try to detect it from the message
      try {
        const response = await processConversation(
          [...messages, userMessage],
          sessionId,
          null,
          0,
          config
        );
        
        await simulateBotTyping(response.message, response.options || (alwaysShowOptions ? [
          { id: "family", label: "I need care for someone" },
          { id: "professional", label: "I provide care services" },
          { id: "community", label: "I want to support the community" }
        ] : undefined));
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

  const resetChat = (manual = false) => {
    chatInitializedRef.current = false; // Reset the initialization flag
    clearMessages();
    clearProgress();
    setInput("");
    setShowOptions(true);
    setConversationStage("intro");
    setIsResuming(false);
    setCurrentSectionIndex(0);
    setCurrentQuestionIndex(0);
    setFormData({});
    
    // Clean up localStorage
    localStorage.removeItem(`tavara_chat_progress_${sessionId}`);
    
    // Only trigger intro message for manual resets
    if (manual) {
      // Set a short timeout to ensure state is updated before triggering intro
      setTimeout(async () => {
        const introMessage = getIntroMessage();
        await simulateBotTyping(introMessage, getRoleOptions());
        chatInitializedRef.current = true; // Mark as initialized since we're manually starting
      }, 100);
    }
  };

  return (
    <div 
      className={cn(
        "bg-background border rounded-lg shadow-xl flex flex-col z-40 h-[500px]",
        className
      )}
      style={{ width }}
    >
      {!hideHeader && (
        <div className="flex items-center justify-between border-b p-3">
          <h3 className="font-medium">Tavara Assistant</h3>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => resetChat(true)}
              title="Start over"
              className="h-7 w-7"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </Button>
            {onClose && (
              <Button
                size="icon"
                variant="ghost"
                onClick={onClose}
                title="Close chat"
                className="h-7 w-7"
              >
                <X size={16} />
              </Button>
            )}
          </div>
        </div>
      )}

      <ChatMessagesList 
        messages={messages}
        isTyping={isTyping}
        isResuming={isResuming}
        conversationStage={conversationStage}
        handleRoleSelection={handleRoleSelection}
        handleOptionSelection={handleOptionSelection}
        alwaysShowOptions={alwaysShowOptions}
      />

      {progress.role && (
        <div className="border-t border-b p-2 text-center">
          <Button
            variant="link"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => {
              window.location.href = `/registration/${progress.role}`;
            }}
          >
            I'd rather fill out a quick form →
          </Button>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="border-t p-3 flex gap-2">
        <Input
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1"
          disabled={isTyping || conversationStage === "intro" || isResuming}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isTyping || conversationStage === "intro" || isResuming}
          title="Send message"
        >
          <Send size={18} />
        </Button>
      </form>
    </div>
  );
};
