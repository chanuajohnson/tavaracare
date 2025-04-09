
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
    const storedSessionId = localStorage.getItem("tavara_chat_session_id");
    
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = uuidv4();
      localStorage.setItem("tavara_chat_session_id", newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  // Function to reset the session ID
  const resetSession = () => {
    const newSessionId = uuidv4();
    localStorage.setItem("tavara_chat_session_id", newSessionId);
    setSessionId(newSessionId);
    return newSessionId;
  };

  return {
    sessionId,
    resetSession
  };
}
