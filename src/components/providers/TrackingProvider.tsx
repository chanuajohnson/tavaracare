
import React, { createContext, useContext, useState } from 'react';

interface TrackingContextType {
  isEnabled: boolean;
  enableTracking: () => void;
  disableTracking: () => void;
  trackEvent: (eventName: string, properties?: Record<string, any>) => void;
  trackPage: (pageName: string, properties?: Record<string, any>) => void;
}

const TrackingContext = createContext<TrackingContextType>({
  isEnabled: true,
  enableTracking: () => {},
  disableTracking: () => {},
  trackEvent: () => {},
  trackPage: () => {},
});

export const TrackingProvider = ({ children }: { children: React.ReactNode }) => {
  const [isEnabled, setIsEnabled] = useState(true);

  const enableTracking = () => setIsEnabled(true);
  const disableTracking = () => setIsEnabled(false);

  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (!isEnabled) return;
    console.log(`[TRACK EVENT] ${eventName}`, properties);
    // In a real app, this would send data to an analytics service
  };

  const trackPage = (pageName: string, properties?: Record<string, any>) => {
    if (!isEnabled) return;
    console.log(`[TRACK PAGE] ${pageName}`, properties);
    // In a real app, this would send page view data to an analytics service
  };

  return (
    <TrackingContext.Provider
      value={{
        isEnabled,
        enableTracking,
        disableTracking,
        trackEvent,
        trackPage,
      }}
    >
      {children}
    </TrackingContext.Provider>
  );
};

export const useTracking = () => useContext(TrackingContext);
