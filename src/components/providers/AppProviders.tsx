
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { TavaraStateProvider } from "@/components/tav/hooks/TavaraStateContext";
import { BrowserRouter } from "react-router-dom";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import { RedirectHandler } from "@/components/routing/RedirectHandler";
import { ProviderErrorBoundary } from "@/components/common/ProviderErrorBoundary";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

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

const paypalOptions = {
  "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || "test",
  intent: "subscription",
  vault: true,
  currency: "USD",
  components: "buttons",
};

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ProviderErrorBoundary providerName="PayPalScript">
      <PayPalScriptProvider options={paypalOptions}>
        <ProviderErrorBoundary providerName="QueryClient">
          <QueryClientProvider client={queryClient}>
            <ProviderErrorBoundary providerName="TooltipProvider">
              <TooltipProvider>
                <Sonner />
                <ProviderErrorBoundary providerName="Router">
                  <BrowserRouter>
                    <ScrollToTop />
                    <RedirectHandler />
                    <ProviderErrorBoundary providerName="AuthProvider">
                      <AuthProvider>
                        <ProviderErrorBoundary providerName="TavaraStateProvider">
                          <TavaraStateProvider>
                            {children}
                          </TavaraStateProvider>
                        </ProviderErrorBoundary>
                      </AuthProvider>
                    </ProviderErrorBoundary>
                  </BrowserRouter>
                </ProviderErrorBoundary>
              </TooltipProvider>
            </ProviderErrorBoundary>
          </QueryClientProvider>
        </ProviderErrorBoundary>
      </PayPalScriptProvider>
    </ProviderErrorBoundary>
  );
}
