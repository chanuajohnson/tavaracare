
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
  
  // Load progress from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem(`tavara_chat_progress_${sessionId}`);
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setProgress({
          role: parsed.role || null,
          questionIndex: parsed.questionIndex || 0,
          lastActive: parsed.lastActive || Date.now()
        });
      } catch (error) {
        console.error('Error parsing saved chat progress:', error);
      }
    }
  }, [sessionId]);
  
  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (progress.role) {
      localStorage.setItem(`tavara_chat_progress_${sessionId}`, JSON.stringify({
        ...progress,
        lastActive: Date.now()
      }));
    }
  }, [progress, sessionId]);
  
  // Update progress
  const updateProgress = (updates: Partial<ChatProgress>) => {
    setProgress(prev => ({
      ...prev,
      ...updates,
      lastActive: Date.now()
    }));
  };
  
  // Clear progress
  const clearProgress = () => {
    localStorage.removeItem(`tavara_chat_progress_${sessionId}`);
    setProgress({
      role: null,
      questionIndex: 0,
      lastActive: Date.now()
    });
  };
  
  return {
    progress,
    updateProgress,
    clearProgress,
    hasProgress: !!progress.role,
  };
};
