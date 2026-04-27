
import React from 'react';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { TavaraAssistantPanel } from '@/components/tav/TavaraAssistantPanel';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { AsyncErrorBoundary } from '@/components/common/AsyncErrorBoundary';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  // Don't render global TAV panel on demo routes - let demo components handle their own TAV
  const isDemoRoute = location.pathname.startsWith('/demo/');
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ErrorBoundary level="component" name="Navigation">
        <Navigation />
      </ErrorBoundary>
      <main className="flex-1">
        <AsyncErrorBoundary name="Main Content">
          {children}
        </AsyncErrorBoundary>
      </main>
      <ErrorBoundary level="component" name="Footer">
        <Footer />
      </ErrorBoundary>
      {!isDemoRoute && (
        <AsyncErrorBoundary name="Assistant Panel">
          <TavaraAssistantPanel />
        </AsyncErrorBoundary>
      )}
    </div>
  );
};
