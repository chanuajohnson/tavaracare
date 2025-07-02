
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { TavaraStateProvider } from "@/components/tav/hooks/TavaraStateContext";
import { BrowserRouter } from "react-router-dom";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import { RedirectHandler } from "@/components/routing/RedirectHandler";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <RedirectHandler />
          <AuthProvider>
            <TavaraStateProvider>
              {children}
            </TavaraStateProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
