
import React from 'react';
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { supabase } from '@/integrations/supabase/client';
import { AppProviders } from '@/components/providers/AppProviders';
import { AppRoutes } from '@/components/routing/AppRoutes';
import { Layout } from '@/components/layout/Layout';
import { Toaster } from "sonner";
import { AppErrorBoundary } from '@/components/common/AppErrorBoundary';
import { useGlobalErrorHandler } from '@/hooks/useGlobalErrorHandler';

function AppContent() {
  // Initialize global error handling
  useGlobalErrorHandler();

  return (
    <SessionContextProvider supabaseClient={supabase}>
      <AppProviders>
        <Layout>
          <AppRoutes />
        </Layout>
        <Toaster />
      </AppProviders>
    </SessionContextProvider>
  );
}

function App() {
  return (
    <AppErrorBoundary>
      <AppContent />
    </AppErrorBoundary>
  );
}

export default App;
