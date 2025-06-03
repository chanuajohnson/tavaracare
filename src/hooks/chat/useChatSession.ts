
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

/**
 * Hook for managing a chat session identifier
 * @returns The chat session ID and functions to manage it
 */
export function useChatSession() {
  const [sessionId, setSessionId] = useState<string>("");

  // Initialize session ID on component mount
  useEffect(() => {
    try {
      const storedSessionId = localStorage.getItem("tavara_chat_session_id");
      
      if (storedSessionId) {
        console.log("[useChatSession] Restored existing session:", storedSessionId.substring(0, 8));
        setSessionId(storedSessionId);
      } else {
        const newSessionId = uuidv4();
        console.log("[useChatSession] Created new session:", newSessionId.substring(0, 8));
        localStorage.setItem("tavara_chat_session_id", newSessionId);
        setSessionId(newSessionId);
      }
    } catch (error) {
      console.error("[useChatSession] Error accessing localStorage:", error);
      // Create an in-memory session ID as a fallback
      const fallbackSessionId = uuidv4();
      console.log("[useChatSession] Created fallback session:", fallbackSessionId.substring(0, 8));
      setSessionId(fallbackSessionId);
    }
  }, []);

  // Function to reset the session ID
  const resetSession = () => {
    try {
      const newSessionId = uuidv4();
      console.log("[useChatSession] Reset session with new ID:", newSessionId.substring(0, 8));
      localStorage.setItem("tavara_chat_session_id", newSessionId);
      setSessionId(newSessionId);
      return newSessionId;
    } catch (error) {
      console.error("[useChatSession] Error resetting session:", error);
      const fallbackSessionId = uuidv4();
      setSessionId(fallbackSessionId);
      return fallbackSessionId;
    }
  };

  return {
    sessionId,
    resetSession,
    isReady: !!sessionId
  };
}
