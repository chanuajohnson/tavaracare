
import { useEffect } from 'react';

// Hero Video Manager component to handle video preference updates
export const HeroVideoManager = () => {
  useEffect(() => {
    const handleVideoPreferencesUpdate = (event: CustomEvent) => {
      // Force a page refresh or state update when video preferences change
      console.log('Hero video preferences updated:', event.detail);
      // This could trigger a state update in the Index component if needed
    };

    window.addEventListener('heroVideoPreferencesUpdated', handleVideoPreferencesUpdate as EventListener);

    return () => {
      window.removeEventListener('heroVideoPreferencesUpdated', handleVideoPreferencesUpdate as EventListener);
    };
  }, []);

  return null; // This is a utility component with no render
};
