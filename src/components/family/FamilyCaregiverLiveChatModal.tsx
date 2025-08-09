import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Shield, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";

interface CaregiverContact {
  id: string;
  full_name?: string | null;
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

interface FamilyCaregiverLiveChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caregiver: CaregiverContact;
}

export const FamilyCaregiverLiveChatModal = ({ open, onOpenChange, caregiver }: FamilyCaregiverLiveChatModalProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    if (open) {
      ensureSessionAndLoad();
    }
  }, [open, caregiver?.id, user?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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

  const ensureSessionAndLoad = async () => {
    if (!user?.id || !caregiver?.id) return;
    setCheckingSession(true);
    try {
      // Try to find today's session
      const { data: existing, error } = await supabase
        .from("caregiver_chat_sessions")
        .select("id")
        .eq("family_user_id", user.id)
        .eq("caregiver_id", caregiver.id)
        .eq("session_date", today)
        .maybeSingle();

      let sessionIdLocal = existing?.id as string | null;

      if (!sessionIdLocal) {
        // Create a new session for the family user
        const { data: created, error: createErr } = await supabase
          .from("caregiver_chat_sessions")
          .insert({
            family_user_id: user.id,
            caregiver_id: caregiver.id,
            session_date: today,
            is_premium: false,
          })
          .select("id")
          .maybeSingle();
        if (createErr) {
          console.error("[FamilyCaregiverLiveChatModal] Session create error:", createErr);
        }
        sessionIdLocal = created?.id || null;
      }

      if (sessionIdLocal) {
        setSessionId(sessionIdLocal);
        // Load messages
        const { data: msgs, error: msgErr } = await supabase
          .from("caregiver_chat_messages")
          .select("*")
          .eq("session_id", sessionIdLocal)
          .order("created_at", { ascending: true });
        if (msgErr) {
          console.error("[FamilyCaregiverLiveChatModal] Messages load error:", msgErr);
        }
        setMessages(
          (msgs || []).map((m) => ({
            ...m,
            message_type: m.message_type as "chat" | "system" | "warning" | "upsell",
          })) as ChatMessage[]
        );
      } else {
        // Fallback system note (shouldn't happen often if create works)
        setMessages([
          {
            id: "no-session-note",
            session_id: "temp",
            content: "We couldn't start the chat session. Please try again in a moment.",
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
    if (!currentMessage.trim() || isLoading || !sessionId) return;
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
        sender: "family",
      });
      if (error) {
        console.error("[FamilyCaregiverLiveChatModal] Send error:", error);
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
        // Optimistic
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
            sender: "family",
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
                Chat with Professional Caregiver
              </DialogTitle>
              <DialogDescription>
                Real-time, TAV-moderated conversation. Keep it professional and caregiving-focused.
              </DialogDescription>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>Moderation enabled</span>
                {caregiver?.full_name && <Badge variant="secondary">{caregiver.full_name}</Badge>}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">{checkingSession ? "Preparing chat..." : sessionId ? "Session active" : "Starting..."}</div>
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
                        {message.is_user ? "You" : caregiver?.full_name || "Caregiver"} • {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="py-4 border-t">
            <div className="flex space-x-2">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={sessionId ? "Type your message about caregiving..." : "Starting chat..."}
                disabled={!sessionId || isLoading}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!sessionId || !currentMessage.trim() || isLoading} size="sm">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-2 text-center">No upsells here — just a safe, direct conversation.</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
