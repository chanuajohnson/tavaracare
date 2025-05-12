
import { useLocation } from "react-router-dom";
import { useEffect, Component, ErrorInfo, ReactNode } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { AppProviders } from "@/components/providers/AppProviders";
import { SupabaseInitializer } from "@/components/supabase/SupabaseInitializer";
import { AppRoutes } from "@/components/routing/AppRoutes";
import { RedirectHandler } from "@/components/routing/RedirectHandler";
import { GlobalFAB } from "@/components/common/GlobalFAB";
import LoadingScreen from "@/components/common/LoadingScreen";

// Error Boundary Component for catching runtime errors
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Application error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground">
          <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-lg border border-muted">
            <h1 className="text-2xl font-bold text-destructive mb-4">
              Something went wrong
            </h1>
            <p className="mb-4 text-muted-foreground">
              The application encountered an error. Please try refreshing the page.
            </p>
            <pre className="bg-muted p-4 rounded text-xs overflow-auto max-h-[200px] mb-4">
              {this.state.error?.toString() || "Unknown error"}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-primary text-primary-foreground py-2 px-4 rounded hover:bg-primary/90 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const location = useLocation();
  const isIndexPage = location.pathname === "/";
  
  useEffect(() => {
    console.log('[App] Route changed to:', location.pathname);
    // Add additional debugging for the family dashboard path
    if (location.pathname === '/dashboard/family') {
      console.log('[App] Family dashboard route detected - ensuring module is loaded');
    }
  }, [location.pathname]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <AppRoutes />
      </main>
      {!isIndexPage && <GlobalFAB />}
    </div>
  );
}

export default function AppWithProviders() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <SupabaseInitializer />
        <RedirectHandler />
        <AppContent />
      </AppProviders>
    </ErrorBoundary>
  );
}
