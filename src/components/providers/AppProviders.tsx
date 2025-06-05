import React from 'react';
import { AuthProvider } from './AuthProvider';
import { QueryProvider } from './QueryProvider';
import { Toaster } from 'sonner';
import { useEnhancedJourneyTracking } from '@/hooks/analytics/useEnhancedJourneyTracking';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      <QueryProvider>
        <Toaster />
        {/* Add global enhanced journey tracking */}
        <GlobalEnhancedTracking />
        {children}
      </QueryProvider>
    </AuthProvider>
  );
};

// Global component to initialize enhanced tracking
const GlobalEnhancedTracking: React.FC = () => {
  useEnhancedJourneyTracking();
  return null;
};
