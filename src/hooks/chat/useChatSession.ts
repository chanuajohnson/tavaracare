
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const useChatSession = () => {
  const [sessionId, setSessionId] = useState<string>('');
  
  useEffect(() => {
    // Check if we have an existing session ID
    const existingSessionId = localStorage.getItem('tavara_chat_session_id');
    
    if (existingSessionId) {
      setSessionId(existingSessionId);
    } else {
      // Create a new session ID
      const newSessionId = uuidv4();
      localStorage.setItem('tavara_chat_session_id', newSessionId);
      setSessionId(newSessionId);
    }
  }, []);
  
  const resetSession = () => {
    const newSessionId = uuidv4();
    localStorage.setItem('tavara_chat_session_id', newSessionId);
    setSessionId(newSessionId);
  };

  return { sessionId, resetSession };
};
