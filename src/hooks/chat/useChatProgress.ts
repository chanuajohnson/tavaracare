
import { useState, useEffect } from 'react';
import { ChatProgress } from '@/types/chatTypes';

export const useChatProgress = () => {
  const [progress, setProgress] = useState<ChatProgress>({
    role: null,
    questionIndex: 0
  });
  
  // Load progress when component mounts
  useEffect(() => {
    try {
      const storedProgress = localStorage.getItem('tavara_chat_progress');
      
      if (storedProgress) {
        setProgress(JSON.parse(storedProgress));
      }
    } catch (error) {
      console.error('Error loading chat progress:', error);
    }
  }, []);
  
  // Save progress when it changes
  useEffect(() => {
    try {
      localStorage.setItem('tavara_chat_progress', JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving chat progress:', error);
    }
  }, [progress]);
  
  // Update progress with partial data
  const updateProgress = (updates: Partial<ChatProgress>) => {
    setProgress(prev => ({ ...prev, ...updates }));
  };
  
  // Clear progress
  const clearProgress = () => {
    setProgress({ role: null, questionIndex: 0 });
    localStorage.removeItem('tavara_chat_progress');
  };
  
  return { progress, updateProgress, clearProgress };
};
