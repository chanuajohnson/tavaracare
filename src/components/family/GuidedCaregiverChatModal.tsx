
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Shield, Crown, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useGuidedCaregiverChat } from "@/hooks/useGuidedCaregiverChat";
import { ConversationProgressIndicator } from "./chat/ConversationProgressIndicator";
import { WaitingForCaregiverState } from "./chat/WaitingForCaregiverState";
import { ChatOptionsRenderer } from "@/components/chatbot/ChatOptionsRenderer";

interface GuidedCaregiverChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caregiver: any;
}

export const GuidedCaregiverChatModal = ({ open, onOpenChange, caregiver }: GuidedCaregiverChatModalProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  console.log(`[GuidedCaregiverChatModal] Opening modal for caregiver:`, caregiver);
  
  const {
    messages,
    promptTemplates,
    currentStage,
    isLoading,
    conversationFlow,
    initializeConversation,
    handlePromptSelection
  } = useGuidedCaregiverChat({
    caregiverId: caregiver.id,
    caregiver
  });

  // Initialize conversation when modal opens
  useEffect(() => {
    if (open && !conversationFlow) {
      console.log('[GuidedCaregiverChatModal] Modal opened, initializing conversation...');
      initializeConversation();
    }
  }, [open, conversationFlow, initializeConversation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Convert prompt templates to chat options
  const chatOptions = promptTemplates.map(template => ({
    id: template.id,
    label: template.prompt_text,
    subtext: template.category === 'experience' ? 'Learn about their background' :
             template.category === 'approach' ? 'Understand their care style' :
             template.category === 'availability' ? 'Check schedule compatibility' :
             template.category === 'specialty' ? 'Verify specific expertise' : undefined
  }));

  const handleOptionSelect = (optionId: string) => {
    console.log(`[GuidedCaregiverChatModal] Option selected: ${optionId}`);
    const selectedTemplate = promptTemplates.find(t => t.id === optionId);
    if (selectedTemplate) {
      console.log(`[GuidedCaregiverChatModal] Selected template:`, selectedTemplate);
      handlePromptSelection(selectedTemplate.prompt_text);
    } else {
      console.error(`[GuidedCaregiverChatModal] Template not found for ID: ${optionId}`);
    }
  };

  // Check if we have real caregiver data
  const isValidCaregiver = caregiver?.id && caregiver.id.length === 36; // UUID length check

  console.log(`[GuidedCaregiverChatModal] Render state:`, {
    isValidCaregiver,
    currentStage,
    messagesCount: messages.length,
    promptTemplatesCount: promptTemplates.length,
    isLoading
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[700px] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                Guided Chat with {caregiver.full_name}
              </DialogTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>TAV-guided conversation</span>
                {caregiver.is_premium && (
                  <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-green-600">
                {caregiver.match_score}% Match
              </div>
              <div className="text-xs text-gray-500">
                Professional caregiver
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Show validation error if invalid caregiver */}
        {!isValidCaregiver && (
          <div className="px-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-red-800 font-medium">Connection Issue</p>
                <p className="text-red-600 text-sm">This caregiver profile is not available for chat. Please try selecting a different match.</p>
              </div>
            </div>
          </div>
        )}

        {/* Conversation Progress */}
        {isValidCaregiver && (
          <div className="px-6">
            <ConversationProgressIndicator currentStage={currentStage} />
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 flex flex-col min-h-0 px-6">
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            {!isValidCaregiver ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <p className="text-gray-600">Unable to connect to this caregiver</p>
                </div>
              </div>
            ) : messages.length === 0 && isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Setting up your conversation...</span>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={cn(
                      "flex w-full",
                      message.isUser ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-4 py-2 text-sm relative",
                        message.isUser
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-800"
                      )}
                    >
                      {!message.isUser && (
                        <Sparkles className="absolute -top-1 -left-1 h-3 w-3 text-blue-500 animate-pulse" />
                      )}
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className={cn(
                        "text-xs mt-1 opacity-70",
                        message.isUser ? "text-blue-100" : "text-gray-500"
                      )}>
                        {message.isUser ? "You" : "TAV"} • {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Chat Options or Waiting State */}
          {isValidCaregiver && (
            <div className="py-4 border-t">
              <AnimatePresence mode="wait">
                {currentStage === 'waiting_acceptance' ? (
                  <motion.div
                    key="waiting"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <WaitingForCaregiverState caregiverName={caregiver.full_name} />
                  </motion.div>
                ) : chatOptions.length > 0 ? (
                  <motion.div
                    key="options"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600 text-center">
                        Choose what you'd like to say:
                      </div>
                      <ChatOptionsRenderer
                        options={chatOptions}
                        onSelect={handleOptionSelect}
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-4"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        <span className="text-sm text-gray-600">Processing...</span>
                      </div>
                    ) : conversationFlow ? (
                      <div className="text-sm text-gray-500">
                        Conversation completed! 🎉
                      </div>
                    ) : null}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
