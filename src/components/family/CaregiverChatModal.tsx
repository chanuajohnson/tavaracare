
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Shield, Crown, Loader2 } from "lucide-react";
import { SubscriptionFeatureLink } from "@/components/subscription/SubscriptionFeatureLink";
import { CaregiverChatService, CaregiverChatMessage, Caregiver } from "@/components/tav/services/caregiverChatService";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface CaregiverChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caregiver: Caregiver;
}

export const CaregiverChatModal = ({ open, onOpenChange, caregiver }: CaregiverChatModalProps) => {
  const [messages, setMessages] = useState<CaregiverChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [canSend, setCanSend] = useState(true);
  const [remainingMessages, setRemainingMessages] = useState(3);
const [isTyping, setIsTyping] = useState(false);
const [sessionId, setSessionId] = useState<string | null>(null);
 
const scrollRef = useRef<HTMLDivElement>(null);
const chatService = useRef(new CaregiverChatService());

  // Load messages and check limits when modal opens
  useEffect(() => {
    if (open) {
      loadChatData();
    }
  }, [open, caregiver.id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Realtime subscription for new messages in this session
  useEffect(() => {
    if (!open || !sessionId) return;

    const channel = supabase
      .channel(`caregiver-chat-${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'caregiver_chat_messages', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const newMsg = payload.new as any;
          setMessages((prev) => [
            ...prev,
            {
              ...newMsg,
              message_type: newMsg.message_type as 'chat' | 'system' | 'warning' | 'upsell',
            } as CaregiverChatMessage,
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [open, sessionId]);

  const loadChatData = async () => {
    setIsLoading(true);
    try {
// Check message limits
      const { canSend: canSendMsg, remaining, session } = await chatService.current.canSendMessage(caregiver.id);
      setCanSend(canSendMsg);
      setRemainingMessages(remaining);
      setSessionId(session?.id || null);

      // Load existing messages
      const existingMessages = await chatService.current.getChatMessages(caregiver.id);
      
      // Add welcome message if this is the first conversation
      if (existingMessages.length === 0) {
        const welcomeMessage: CaregiverChatMessage = {
          id: 'welcome',
          session_id: 'temp',
          content: `💙 Hi! I'm TAV, your care coordinator. I'll help facilitate your conversation with this professional caregiver while keeping everyone safe and focused on caregiving topics.

You have ${remaining} messages today to get to know each other professionally. Feel free to ask about their experience, approach to care, or availability!`,
          is_user: false,
          is_tav_moderated: true,
          message_type: 'system',
          created_at: new Date().toISOString()
        };
        setMessages([welcomeMessage]);
      } else {
        setMessages(existingMessages);
      }
    } catch (error) {
      console.error('Error loading chat data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading || !canSend) return;

    const messageText = currentMessage.trim();
    setCurrentMessage("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      const result = await chatService.current.sendMessage(caregiver.id, messageText, caregiver);
      
      if (result.success && result.response) {
        // Reload messages to get the latest from database
        const updatedMessages = await chatService.current.getChatMessages(caregiver.id);
        setMessages(updatedMessages);
        
        // Update limits
        const { canSend: newCanSend, remaining } = await chatService.current.canSendMessage(caregiver.id);
        setCanSend(newCanSend);
        setRemainingMessages(remaining);
        
        // Show upgrade prompt if limit reached
        if (!newCanSend && remaining === 0) {
          setTimeout(() => {
            const upgradeMessage: CaregiverChatMessage = {
              id: 'upgrade-prompt',
              session_id: 'temp',
              content: "🚀 You've used all 3 daily messages! Upgrade to Premium for unlimited messaging with caregivers, or choose Full Access for direct contact information.",
              is_user: false,
              is_tav_moderated: true,
              message_type: 'upsell',
              created_at: new Date().toISOString()
            };
            setMessages(prev => [...prev, upgradeMessage]);
          }, 1000);
        }
      } else if (result.error) {
        // Show error message
        const errorMessage: CaregiverChatMessage = {
          id: 'error-' + Date.now(),
          session_id: 'temp',
          content: result.error,
          is_user: false,
          is_tav_moderated: true,
          message_type: 'warning',
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[700px] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                Chat with Professional Caregiver
              </DialogTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>TAV-moderated conversation</span>
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
                {remainingMessages === 999 ? 'Unlimited' : `${remainingMessages} msgs left today`}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Chat Messages */}
        <div className="flex-1 flex flex-col min-h-0 px-6">
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            {isLoading && messages.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading conversation...</span>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                {messages.map((message, index) => (
                  <div
                    key={message.id || index}
                    className={cn(
                      "flex w-full",
                      message.is_user ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-4 py-2 text-sm",
                        message.is_user
                          ? "bg-blue-600 text-white"
                          : message.message_type === 'system'
                          ? "bg-blue-50 text-blue-800 border border-blue-200"
                          : message.message_type === 'warning'
                          ? "bg-yellow-50 text-yellow-800 border border-yellow-200"
                          : message.message_type === 'upsell'
                          ? "bg-purple-50 text-purple-800 border border-purple-200"
                          : "bg-gray-100 text-gray-800"
                      )}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className={cn(
                        "text-xs mt-1 opacity-70",
                        message.is_user ? "text-blue-100" : "text-gray-500"
                      )}>
                        {message.is_user ? "You" : (message.sender === 'caregiver' ? caregiver.full_name : 'TAV')} • {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 rounded-lg px-4 py-2 text-sm">
                      <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs text-gray-500 ml-2">TAV is typing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Upgrade Prompt */}
          {!canSend && remainingMessages === 0 && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 mb-4">
              <div className="text-center space-y-3">
                <div className="text-purple-800 font-medium">Ready for unlimited conversations?</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <SubscriptionFeatureLink
                    featureType="Premium Messaging"
                    returnPath="/family/matching"
                    referringPagePath="/family/matching"
                    referringPageLabel="Caregiver Chat"
                    variant="outline"
                    className="text-sm"
                  >
                    Unlimited Chat
                  </SubscriptionFeatureLink>
                  <SubscriptionFeatureLink
                    featureType="Full Caregiver Access"
                    returnPath="/family/matching"
                    referringPagePath="/family/matching"
                    referringPageLabel="Caregiver Chat"
                    variant="default"
                    className="text-sm"
                  >
                    Get Contact Info
                  </SubscriptionFeatureLink>
                </div>
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="py-4 border-t">
            <div className="flex space-x-2">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={canSend ? "Type your message about caregiving..." : "Upgrade to continue messaging"}
                disabled={!canSend || isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!canSend || !currentMessage.trim() || isLoading}
                size="sm"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-2 text-center">
              {canSend 
                ? "TAV moderates all conversations for your safety"
                : "Daily message limit reached - upgrade for unlimited messaging"
              }
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
