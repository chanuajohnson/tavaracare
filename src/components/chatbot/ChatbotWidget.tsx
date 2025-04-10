
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useChatMessages } from "@/hooks/chat/useChatMessages";
import { useChatSession } from "@/hooks/chat/useChatSession";
import { getIntroMessage, getRoleFollowupMessage, getCommunityOptions } from "@/data/chatIntroMessage";
import { generatePrefillJson } from "@/utils/chat/prefillGenerator";
import { MessageBubble } from "./MessageBubble";
import { OptionCard } from "./OptionCard";
import { useChat } from "./ChatProvider";
import { useChatProgress } from "@/hooks/chat/useChatProgress";

interface TypingIndicatorProps {}

interface ChatbotWidgetProps {
  className?: string;
  width?: string;
  onClose?: () => void;
  hideHeader?: boolean;
}

// Bot is typing indicator
const TypingIndicator: React.FC<TypingIndicatorProps> = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center space-x-1 p-2 rounded-md bg-muted max-w-fit"
    >
      <motion.div
        className="w-2 h-2 rounded-full bg-gray-400"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.7, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatType: "loop",
          times: [0, 0.5, 1],
        }}
      />
      <motion.div
        className="w-2 h-2 rounded-full bg-gray-400"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.7, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatType: "loop",
          delay: 0.3,
          times: [0, 0.5, 1],
        }}
      />
      <motion.div
        className="w-2 h-2 rounded-full bg-gray-400"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.7, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatType: "loop",
          delay: 0.6,
          times: [0, 0.5, 1],
        }}
      />
    </motion.div>
  );
};

// Options renderer component
const OptionsRenderer: React.FC<{
  options: { id: string; label: string; subtext?: string }[];
  onSelect: (id: string) => void;
}> = ({ options, onSelect }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col space-y-2 my-2"
    >
      {options.map((option) => (
        <OptionCard
          key={option.id}
          option={option}
          onClick={onSelect}
        />
      ))}
    </motion.div>
  );
};

// Main ChatbotWidget component
export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ 
  className,
  width = "320px",
  onClose,
  hideHeader = false
}) => {
  const [input, setInput] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showOptions, setShowOptions] = useState(true);
  const [conversationStage, setConversationStage] = useState<"intro" | "questions" | "completion">("intro");
  const [isResuming, setIsResuming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { sessionId } = useChatSession();
  const { messages, addMessage, clearMessages } = useChatMessages(sessionId);
  const { initialRole, setInitialRole, skipIntro, setSkipIntro } = useChat();
  const { progress, updateProgress, clearProgress } = useChatProgress();
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      if (initialRole) {
        handleInitialRoleSelection(initialRole);
      } else if (skipIntro && progress.role) {
        handleInitialRoleSelection(progress.role);
        setQuestionIndex(progress.questionIndex);
      } else {
        const introMessage = getIntroMessage();
        simulateBotTyping(introMessage);
      }
    }
  }, [messages.length, initialRole, skipIntro, progress]);

  useEffect(() => {
    const partialProgress = localStorage.getItem(`tavara_chat_progress_${sessionId}`);
    if (partialProgress && messages.length > 1 && !skipIntro) {
      setIsResuming(true);
      addMessage({
        content: "Welcome back! Would you like to continue where you left off?",
        isUser: false,
        timestamp: Date.now(),
        options: [
          { id: "resume", label: "Yes, continue" },
          { id: "restart", label: "No, start over" }
        ]
      });
    }
  }, [sessionId, skipIntro]);
  
  const handleInitialRoleSelection = async (roleId: string) => {
    setSelectedRole(roleId);
    setShowOptions(false);
    setConversationStage("questions");
    
    setInitialRole(null);
    localStorage.removeItem('tavara_chat_initial_role');
    
    updateProgress({
      role: roleId,
      questionIndex: 0
    });
    
    if (skipIntro) {
      await simulateBotTyping(getNextQuestion(roleId, 0));
      setQuestionIndex(1);
      setSkipIntro(false);
    } else {
      let greeting = "";
      switch(roleId) {
        case "family":
          greeting = "You're looking for the right caregiver, aren't you? Let me get a few details so we can match you with Tavara.care caregivers who meet your needs.";
          break;
        case "professional":
          greeting = "So you're a care pro? Let me help you register with Tavara. We have families looking for your skills right now!";
          break;
        case "community":
          greeting = "Welcome! Discover how you can support your community with Tavara. Ready to sign up?";
          break;
        default:
          greeting = "Good day! How can Tavara help you today?";
      }
      
      await simulateBotTyping(greeting);
      await simulateBotTyping(getNextQuestion(roleId, 0));
      setQuestionIndex(1);
    }
  };

  const simulateBotTyping = async (message: string, options?: { id: string; label: string; subtext?: string }[]) => {
    setIsTyping(true);
    
    const baseDelay = 500;
    const perCharDelay = 15;
    const delay = Math.min(baseDelay + message.length * perCharDelay, 2000);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    addMessage({
      content: message,
      isUser: false,
      timestamp: Date.now(),
      options: options
    });
    
    setIsTyping(false);
  };

  const handleRoleSelection = async (roleId: string) => {
    if (roleId === "resume") {
      setIsResuming(false);
      const partialProgress = JSON.parse(localStorage.getItem(`tavara_chat_progress_${sessionId}`) || "{}");
      if (partialProgress.role) {
        setSelectedRole(partialProgress.role);
        setQuestionIndex(partialProgress.questionIndex || 0);
        setConversationStage("questions");
        await simulateBotTyping("Great! Let's continue where we left off. " + getNextQuestion(partialProgress.role, partialProgress.questionIndex || 0));
      }
      return;
    }
    
    if (roleId === "restart") {
      resetChat();
      return;
    }
    
    setSelectedRole(roleId);
    setShowOptions(false);
    setConversationStage("questions");
    
    updateProgress({
      role: roleId,
      questionIndex: 0
    });
    
    const followupMessage = getRoleFollowupMessage(roleId);
    await simulateBotTyping(followupMessage);
    
    await simulateBotTyping(getNextQuestion(roleId, 0));
    setQuestionIndex(1);
  };

  const handleOptionSelection = async (optionId: string) => {
    addMessage({
      content: optionId,
      isUser: true,
      timestamp: Date.now()
    });
    
    if (selectedRole) {
      updateProgress({
        role: selectedRole,
        questionIndex: questionIndex + 1
      });
      
      await simulateBotTyping(getNextQuestion(selectedRole, questionIndex));
      setQuestionIndex(prev => prev + 1);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!input.trim()) return;
    
    addMessage({
      content: input,
      isUser: true,
      timestamp: Date.now()
    });
    
    setInput("");
    
    if (selectedRole) {
      updateProgress({
        role: selectedRole,
        questionIndex: questionIndex + 1
      });
      
      if (questionIndex >= getRoleQuestions(selectedRole).length) {
        setConversationStage("completion");
        const prefillJson = generatePrefillJson(selectedRole, messages);
        console.log("Generated prefill JSON:", prefillJson);
        
        clearProgress();
        
        await simulateBotTyping(
          `Thanks for providing this information! Based on your answers, we recommend completing your ${selectedRole} registration. In the future, we'll direct you to the registration form with this data pre-filled.`
        );
        return;
      }
      
      const nextQuestion = getNextQuestion(selectedRole, questionIndex);
      await simulateBotTyping(nextQuestion);
      setQuestionIndex(prev => prev + 1);
    }
  };

  const getNextQuestion = (role: string, index: number): string => {
    const questions = getRoleQuestions(role);
    return questions[index] || "Is there anything else you'd like to tell me?";
  };

  const getRoleQuestions = (role: string): string[] => {
    switch (role) {
      case "family":
        return [
          "What's your first name?",
          "Who do you need care for? (name and your relationship to them)",
          "What kind of care do they need? (e.g., medical, household, memory)",
          "Are there any special needs or conditions we should know about?",
          "When do you need care? (weekdays, weekends, specific times)"
        ];
      case "professional":
        return [
          "What's your name?",
          "What's your professional role? (e.g., CNA, Nurse, Therapist)",
          "How many years of experience do you have in caregiving?",
          "What services do you offer? (e.g., medical, mobility assistance)",
          "When are you available to work? (full-time, part-time, flexible)"
        ];
      case "community":
        return [
          "What's your name?",
          "How would you like to contribute? (volunteer, mentor, tech)",
          "What's your background or expertise?",
          "How much time are you able to commit?",
          "What aspects of caregiving are you most interested in?"
        ];
      default:
        return ["Could you tell me more?"];
    }
  };

  const resetChat = () => {
    clearMessages();
    setSelectedRole(null);
    setQuestionIndex(0);
    setInput("");
    setShowOptions(true);
    setConversationStage("intro");
    clearProgress();
    
    const introMessage = getIntroMessage();
    simulateBotTyping(introMessage);
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
              onClick={resetChat}
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

      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message, index) => (
          <React.Fragment key={index}>
            <MessageBubble
              content={message.content}
              isUser={message.isUser}
              timestamp={message.timestamp}
            />
            {!message.isUser && message.options && (index === messages.length - 1 || message.isUser) && (
              <OptionsRenderer 
                options={message.options} 
                onSelect={
                  isResuming ? handleRoleSelection : 
                  conversationStage === "intro" ? handleRoleSelection : 
                  handleOptionSelection
                } 
              />
            )}
          </React.Fragment>
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {selectedRole && (
        <div className="border-t border-b p-2 text-center">
          <Button
            variant="link"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => {
              window.location.href = `/registration/${selectedRole}`;
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
