
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useChatMessages } from "@/hooks/chat/useChatMessages";
import { useChatSession } from "@/hooks/chat/useChatSession";
import { getIntroMessage, ChatOption } from "@/data/chatIntroMessage";
import { generatePrefillJson } from "@/utils/chat/prefillGenerator";

interface MessageProps {
  content: string;
  isUser: boolean;
  timestamp: number;
}

interface OptionCardProps {
  option: ChatOption;
  onClick: (id: string) => void;
}

// Separate component for option cards with styling
const OptionCard: React.FC<OptionCardProps> = ({ option, onClick }) => {
  return (
    <div 
      className="flex flex-col p-3 rounded-md bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer mb-2"
      onClick={() => onClick(option.id)}
    >
      <div className="font-medium">{option.label}</div>
      {option.subtext && (
        <div className="text-sm text-gray-500 mt-1">{option.subtext}</div>
      )}
    </div>
  );
};

// Message bubble component with styling based on sender
const MessageBubble: React.FC<MessageProps> = ({ content, isUser, timestamp }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      <div
        className={`rounded-lg px-4 py-2 max-w-[80%] ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        }`}
      >
        <div className="whitespace-pre-wrap break-words">{content}</div>
        <div className={`text-xs mt-1 ${isUser ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
          {new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </motion.div>
  );
};

// Options renderer component
const OptionsRenderer: React.FC<{
  options: ChatOption[];
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

// Bot is typing indicator
const TypingIndicator: React.FC = () => {
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

// Main ChatbotWidget component
export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { sessionId } = useChatSession();
  const { messages, addMessage, clearMessages } = useChatMessages(sessionId);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Initialize chat with intro message if no messages exist
    if (messages.length === 0 && isOpen) {
      const introMessage = getIntroMessage();
      simulateBotTyping(introMessage);
    }
  }, [messages.length, isOpen]);

  const simulateBotTyping = async (message: string) => {
    setIsTyping(true);
    
    // Simulate bot typing with delay based on message length
    const baseDelay = 500;
    const perCharDelay = 15;
    const delay = Math.min(baseDelay + message.length * perCharDelay, 2000);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    addMessage({
      content: message,
      isUser: false,
      timestamp: Date.now(),
      options: !selectedRole ? [
        { id: "family", label: "👪 I'm looking for care for a loved one" },
        { id: "professional", label: "👩‍⚕️ I'm a professional caregiver" },
        { 
          id: "community", 
          label: "🤝 I want to help or get involved",
          subtext: "Includes volunteers, educators, and tech innovators" 
        },
      ] : undefined
    });
    
    setIsTyping(false);
  };

  const handleRoleSelection = async (roleId: string) => {
    setSelectedRole(roleId);
    
    // Add user message indicating their role selection
    addMessage({
      content: messages.find(m => m.options)?.options?.find(o => o.id === roleId)?.label || roleId,
      isUser: true,
      timestamp: Date.now()
    });
    
    // Based on selected role, ask first question
    await simulateBotTyping(getNextQuestion(roleId, 0));
    setQuestionIndex(1);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!input.trim() && !selectedRole) return;
    
    // Add user message
    addMessage({
      content: input,
      isUser: true,
      timestamp: Date.now()
    });
    
    setInput("");
    
    if (selectedRole) {
      // Generate prefill data based on collected answers
      if (questionIndex >= getRoleQuestions(selectedRole).length) {
        const prefillJson = generatePrefillJson(selectedRole, messages);
        console.log("Generated prefill JSON:", prefillJson);
        
        await simulateBotTyping(
          "Thanks for providing this information! In the future, I'll direct you to the appropriate registration form with this data pre-filled. For now, here's what I've collected:\n\n" + 
          JSON.stringify(prefillJson, null, 2)
        );
        return;
      }
      
      // Ask next question based on role path
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
          "What's your name?",
          "Who do you need care for? (name and your relationship to them)",
          "What kind of care do they need?",
          "How often do you need care?"
        ];
      case "professional":
        return [
          "What's your name?",
          "What kind of professional are you?",
          "How many years experience do you have?",
          "Where are you located?",
          "What's your contact info?"
        ];
      case "community":
        return [
          "What's your name?",
          "What kind of roles are you interested in?",
          "What are your contribution areas?",
          "Are you interested in tech, caregiving, education, or something else?"
        ];
      default:
        return ["Could you tell me more?"];
    }
  };

  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  const resetChat = () => {
    clearMessages();
    setSelectedRole(null);
    setQuestionIndex(0);
    setInput("");
    
    // Restart chat with intro message
    const introMessage = getIntroMessage();
    simulateBotTyping(introMessage);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={toggleChat}
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg"
        >
          {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </Button>
      </div>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-80 sm:w-96 h-[500px] bg-background border rounded-lg shadow-xl flex flex-col z-40"
          >
            {/* Chat header */}
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
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  className="h-7 w-7"
                >
                  <X size={16} />
                </Button>
              </div>
            </div>

            {/* Messages container */}
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map((message, index) => (
                <React.Fragment key={index}>
                  <MessageBubble
                    content={message.content}
                    isUser={message.isUser}
                    timestamp={message.timestamp}
                  />
                  {message.options && (
                    <OptionsRenderer 
                      options={message.options} 
                      onSelect={handleRoleSelection} 
                    />
                  )}
                </React.Fragment>
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <form onSubmit={handleSendMessage} className="border-t p-3 flex gap-2">
              <Input
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
                disabled={isTyping}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isTyping}
                title="Send message"
              >
                <Send size={18} />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
