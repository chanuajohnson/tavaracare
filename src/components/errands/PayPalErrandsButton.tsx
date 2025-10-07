import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { ERRANDS_PAYPAL_CONFIG, getErrandsPayPalScriptUrl } from '@/constants/paypalErrandsButton';
import { useTracking } from '@/hooks/useTracking';
import { toast } from 'sonner';

// TypeScript declaration for PayPal Hosted Buttons API
// Extending the existing PayPal namespace from @paypal/react-paypal-js
interface PayPalHostedButtons {
  HostedButtons: (options: { hostedButtonId: string }) => {
    render: (selector: string) => Promise<void>;
  };
}

interface PayPalErrandsButtonProps {
  className?: string;
}

export const PayPalErrandsButton: React.FC<PayPalErrandsButtonProps> = ({ className }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const { trackEngagement } = useTracking();

  useEffect(() => {
    let isMounted = true;

    const loadPayPalScript = () => {
      // Check if script already exists (to avoid duplicate loads)
      const existingScript = document.querySelector(`script[src*="paypal.com/sdk/js"][src*="${ERRANDS_PAYPAL_CONFIG.clientId}"]`);
      
      if (existingScript) {
        console.log('PayPal script already loaded for errands');
        if ((window as any).paypal) {
          setIsScriptLoaded(true);
          setIsLoading(false);
        }
        return;
      }

      // Create and inject PayPal SDK script
      const script = document.createElement('script');
      script.src = getErrandsPayPalScriptUrl();
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('PayPal Errands SDK loaded successfully');
        if (isMounted) {
          setIsScriptLoaded(true);
          setIsLoading(false);
        }
      };

      script.onerror = () => {
        console.error('Failed to load PayPal Errands SDK');
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
          toast.error('Failed to load PayPal button. Please try again or contact us via WhatsApp.');
        }
      };

      scriptRef.current = script;
      document.head.appendChild(script);
    };

    loadPayPalScript();

    return () => {
      isMounted = false;
      // Don't remove script on unmount to avoid reload issues
      // PayPal SDK can be shared across components
    };
  }, []);

  useEffect(() => {
    const paypal = (window as any).paypal as PayPalHostedButtons | undefined;
    
    if (!isScriptLoaded || !paypal || !containerRef.current) {
      return;
    }

    let isMounted = true;

    const initializeButton = async () => {
      try {
        console.log('Initializing PayPal Hosted Button for errands:', ERRANDS_PAYPAL_CONFIG.hostedButtonId);
        
        if (containerRef.current && paypal.HostedButtons) {
          // Clear any existing content
          containerRef.current.innerHTML = '';
          
          await paypal.HostedButtons({
            hostedButtonId: ERRANDS_PAYPAL_CONFIG.hostedButtonId,
          }).render(`#paypal-errands-container`);

          if (isMounted) {
            console.log('PayPal Errands button rendered successfully');
            
            // Track button render
            trackEngagement('errands_paypal_button_rendered', {
              buttonId: ERRANDS_PAYPAL_CONFIG.hostedButtonId,
            });
          }
        }
      } catch (error) {
        console.error('Error initializing PayPal Errands button:', error);
        if (isMounted) {
          setHasError(true);
          toast.error('Failed to initialize PayPal button. Please refresh the page or contact us.');
        }
      }
    };

    initializeButton();

    return () => {
      isMounted = false;
    };
  }, [isScriptLoaded, trackEngagement]);

  if (hasError) {
    return (
      <Button
        variant="outline"
        className={className}
        disabled
      >
        PayPal Unavailable
      </Button>
    );
  }

  if (isLoading) {
    return (
      <Button
        variant="outline"
        className={className}
        disabled
      >
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading PayPal...
      </Button>
    );
  }

  return (
    <div 
      id="paypal-errands-container" 
      ref={containerRef}
      className={className}
      style={{ minHeight: '40px' }}
    />
  );
};
