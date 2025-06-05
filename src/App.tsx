
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { AppProviders } from "@/components/providers/AppProviders";
import { SupabaseInitializer } from "@/components/supabase/SupabaseInitializer";
import AppRoutes from "@/components/routing/AppRoutes";
import { RedirectHandler } from "@/components/routing/RedirectHandler";
import { GlobalFAB } from "@/components/common/GlobalFAB";
import { TavaraAssistantPanel } from "@/components/tav/TavaraAssistantPanel";

function AppContent() {
  const location = useLocation();
  const isIndexPage = location.pathname === "/";
  
  useEffect(() => {
    console.log('[App] Route changed to:', location.pathname);
  }, [location.pathname]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <AppRoutes />
      </main>
      {!isIndexPage && <GlobalFAB />}
      <TavaraAssistantPanel />
    </div>
  );
}

export default function AppWithProviders() {
  return (
    <AppProviders>
      <SupabaseInitializer />
      <RedirectHandler />
      <AppContent />
    </AppProviders>
  );
}
