
import { useEffect, useState } from 'react';
import { useChatSession } from './useChatSession';

interface ChatProgress {
  role: string | null;
  questionIndex: number;
  lastActive: number;
}

export const useChatProgress = () => {
  const { sessionId } = useChatSession();
  const [progress, setProgress] = useState<ChatProgress>({
    role: null,
    questionIndex: 0,
    lastActive: Date.now()
  });
  
  const [initialized, setInitialized] = useState(false);
  
  // Load progress from localStorage on mount and when session ID changes
  useEffect(() => {
    if (!sessionId) return;
    
    try {
      const savedProgress = localStorage.getItem(`tavara_chat_progress_${sessionId}`);
      if (savedProgress) {
        try {
          const parsed = JSON.parse(savedProgress);
          console.log(`[useChatProgress] Loaded progress for session ${sessionId.substring(0, 8)}:`, parsed);
          
          // Check if the saved progress is valid
          if (parsed && typeof parsed === 'object') {
            // Set the progress state with defaults for missing fields
            setProgress({
              role: parsed.role || null,
              questionIndex: parsed.questionIndex || 0,
              lastActive: parsed.lastActive || Date.now()
            });
          }
        } catch (error) {
          console.error('[useChatProgress] Error parsing saved chat progress:', error);
        }
      } else {
        console.log(`[useChatProgress] No saved progress found for session ${sessionId.substring(0, 8)}`);
      }
      
      setInitialized(true);
    } catch (error) {
      console.error('[useChatProgress] Error loading chat progress:', error);
      setInitialized(true);
    }
  }, [sessionId]);
  
  // Save progress to localStorage whenever it changes or when session ID changes
  useEffect(() => {
    if (!sessionId || !initialized) return;
    
    try {
      if (progress.role) {
        const progressWithTimestamp = {
          ...progress,
          lastActive: Date.now()
        };
        
        localStorage.setItem(`tavara_chat_progress_${sessionId}`, JSON.stringify(progressWithTimestamp));
        console.log(`[useChatProgress] Saved progress for session ${sessionId.substring(0, 8)}:`, progressWithTimestamp);
      }
    } catch (error) {
      console.error('[useChatProgress] Error saving chat progress:', error);
    }
  }, [progress, sessionId, initialized]);
  
  // Update progress
  const updateProgress = (updates: Partial<ChatProgress>) => {
    console.log(`[useChatProgress] Updating progress:`, updates);
    setProgress(prev => ({
      ...prev,
      ...updates,
      lastActive: Date.now()
    }));
  };
  
  // Clear progress
  const clearProgress = () => {
    try {
      console.log(`[useChatProgress] Clearing progress for session ${sessionId?.substring(0, 8)}`);
      if (sessionId) {
        localStorage.removeItem(`tavara_chat_progress_${sessionId}`);
      }
      setProgress({
        role: null,
        questionIndex: 0,
        lastActive: Date.now()
      });
    } catch (error) {
      console.error('[useChatProgress] Error clearing chat progress:', error);
    }
  };
  
  return {
    progress,
    updateProgress,
    clearProgress,
    hasProgress: !!progress.role,
    initialized
  };
};
