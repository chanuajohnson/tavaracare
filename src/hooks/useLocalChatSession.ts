
import { useState, useEffect } from 'react';
import { getOrCreateSessionId } from '@/utils/local/sessionStorage';

export function useLocalChatSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function initSession() {
      try {
        setLoading(true);
        // Get or create a session ID from local storage
        const id = getOrCreateSessionId();
        if (isMounted) {
          setSessionId(id);
        }
      } catch (e) {
        console.error('Error initializing chat session:', e);
        if (isMounted) {
          setError('Failed to initialize chat session');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    initSession();
    
    return () => {
      isMounted = false;
    };
  }, []);

  return { 
    sessionId, 
    loading, 
    error
  };
}
