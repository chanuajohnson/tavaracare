
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

const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

// Always render PayPalScriptProvider to prevent context errors
// Use fallback client-id when env var is missing to prevent SDK errors
const paypalOptions = {
  "client-id": clientId || "sb", // 'sb' = sandbox fallback (won't work but won't crash)
  intent: "subscription",
  vault: true,
  currency: "USD",
  components: "buttons",
};

export function AppProviders({ children }: { children: React.ReactNode }) {
  // Log warning but still render provider to prevent context errors
  if (!clientId) {
    console.warn("PayPal client ID not found - PayPal features will be disabled");
  }

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
