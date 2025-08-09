
import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Shield, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";

interface FamilyContact {
  id: string;
  full_name: string;
  avatar_url?: string | null;
}

interface ChatMessage {
  id: string;
  session_id: string;
  content: string;
  is_user: boolean;
  is_tav_moderated: boolean;
  message_type: "chat" | "system" | "warning" | "upsell";
  created_at: string;
  sender?: string;
}

interface ProfessionalCaregiverChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  family: FamilyContact;
}

export const ProfessionalCaregiverChatModal = ({ open, onOpenChange, family }: ProfessionalCaregiverChatModalProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState<boolean>(false);
  const [checkingSession, setCheckingSession] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    if (open) {
      initSessionAndMessages();
    }
  }, [open, family.id, user?.id]);

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
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "caregiver_chat_messages", filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const newMsg = payload.new as any;
          setMessages((prev) => [
            ...prev,
            {
              ...newMsg,
              message_type: newMsg.message_type as "chat" | "system" | "warning" | "upsell",
            } as ChatMessage,
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [open, sessionId]);

  const initSessionAndMessages = async () => {
    if (!user?.id) return;
    setCheckingSession(true);
    try {
      // Locate existing session for caregiver (current user) and target family for today
      const { data: session, error } = await supabase
        .from("caregiver_chat_sessions")
        .select("id, messages_sent, max_daily_messages, is_premium")
        .eq("caregiver_id", user.id)
        .eq("family_user_id", family.id)
        .eq("session_date", today)
        .maybeSingle();

      if (error) {
        // Do not block UI entirely; just note no session
        console.warn("[ProfessionalCaregiverChatModal] Session lookup error:", error);
      }

      if (session?.id) {
        setSessionId(session.id);
        setSessionReady(true);
        // Load messages
        const { data: msgs, error: msgErr } = await supabase
          .from("caregiver_chat_messages")
          .select("*")
          .eq("session_id", session.id)
          .order("created_at", { ascending: true });
        if (msgErr) {
          console.error("[ProfessionalCaregiverChatModal] Messages load error:", msgErr);
        }
        setMessages(
          (msgs || []).map((m) => ({
            ...m,
            message_type: m.message_type as "chat" | "system" | "warning" | "upsell",
          })) as ChatMessage[]
        );
      } else {
        // No session yet; show a helpful system note
        setSessionReady(false);
        setMessages([
          {
            id: "no-session-note",
            session_id: "temp",
            content:
              "Once the family sends a first message, your chat will open here in real-time. You can also encourage them to start the conversation.",
            is_user: false,
            is_tav_moderated: true,
            message_type: "system",
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } finally {
      setCheckingSession(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading || !sessionReady || !sessionId) return;
    const text = currentMessage.trim();
    setCurrentMessage("");
    setIsLoading(true);
    try {
      const { error } = await supabase.from("caregiver_chat_messages").insert({
        session_id: sessionId,
        content: text,
        is_user: true,
        is_tav_moderated: true,
        message_type: "chat",
        sender: "caregiver",
      });
      if (error) {
        console.error("[ProfessionalCaregiverChatModal] Send error:", error);
        // Push an inline warning
        setMessages((prev) => [
          ...prev,
          {
            id: "send-error-" + Date.now(),
            session_id: sessionId,
            content: "Could not send message. Please try again.",
            is_user: false,
            is_tav_moderated: true,
            message_type: "warning",
            created_at: new Date().toISOString(),
          },
        ]);
      } else {
        // Optimistic render; realtime will also append
        setMessages((prev) => [
          ...prev,
          {
            id: "temp-" + Date.now(),
            session_id: sessionId,
            content: text,
            is_user: true,
            is_tav_moderated: true,
            message_type: "chat",
            created_at: new Date().toISOString(),
            sender: "caregiver",
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
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
                Chat with Family
              </DialogTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>TAV-moderated conversation</span>
                <Badge variant="secondary">{family.full_name}</Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">
                {checkingSession ? "Checking session..." : sessionReady ? "Session active" : "Waiting for family to start"}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0 px-6">
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            {checkingSession && messages.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading conversation...</span>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                {messages.map((message, index) => (
                  <div key={message.id || index} className={cn("flex w-full", message.is_user ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-4 py-2 text-sm",
                        message.is_user
                          ? "bg-blue-600 text-white"
                          : message.message_type === "system"
                          ? "bg-blue-50 text-blue-800 border border-blue-200"
                          : message.message_type === "warning"
                          ? "bg-yellow-50 text-yellow-800 border border-yellow-200"
                          : message.message_type === "upsell"
                          ? "bg-purple-50 text-purple-800 border border-purple-200"
                          : "bg-gray-100 text-gray-800"
                      )}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className={cn("text-xs mt-1 opacity-70", message.is_user ? "text-blue-100" : "text-gray-500")}>
                        {message.is_user ? "You" : message.sender === "tav" ? "TAV" : family.full_name} • {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Message Input */}
          <div className="py-4 border-t">
            <div className="flex space-x-2">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={sessionReady ? "Type your message about caregiving..." : "Waiting for family to start the chat"}
                disabled={!sessionReady || isLoading}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!sessionReady || !currentMessage.trim() || isLoading} size="sm">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-2 text-center">TAV moderates all conversations for safety</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
