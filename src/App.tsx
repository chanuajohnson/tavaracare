
import React from 'react';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';
import { AppProviders } from '@/components/providers/AppProviders';
import { AppRoutes } from '@/components/routing/AppRoutes';
import { Layout } from '@/components/layout/Layout';
import { Toaster } from "sonner";
import { TavaraAssistantPanel } from '@/components/tav/TavaraAssistantPanel';

function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <AppProviders>
        <Layout>
          <AppRoutes />
        </Layout>
        <Toaster />
        <TavaraAssistantPanel />
      </AppProviders>
    </SessionContextProvider>
  );
}

export default App;
