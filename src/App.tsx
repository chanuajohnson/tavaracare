
import React from 'react';
import { BrowserRouter as Router } from "react-router-dom";
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { supabase } from '@/integrations/supabase/client';
import { AppProviders } from '@/components/providers/AppProviders';
import { AppRoutes } from '@/components/routing/AppRoutes';
import { Layout } from '@/components/Layout';
import { Toaster } from "sonner";

function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <AppProviders>
        <Router>
          <Layout>
            <AppRoutes />
          </Layout>
          <Toaster />
        </Router>
      </AppProviders>
    </SessionContextProvider>
  );
}

export default App;
