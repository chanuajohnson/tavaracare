import React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { useTracking } from '@/hooks/useTracking';

interface PayPalErrandsButtonProps {
  className?: string;
}

export const PayPalErrandsButton: React.FC<PayPalErrandsButtonProps> = ({ className }) => {
  const { trackEngagement } = useTracking();
  
  // PayPal.me link for USD $14.75 deposit (equivalent to TT$100)
  const PAYPAL_DEPOSIT_URL = 'https://www.paypal.me/tavaracare/14.75';

  const handlePayPalClick = () => {
    // Track click
    trackEngagement('errands_paypal_click', {
      amount: 14.75,
      currency: 'USD',
      equivalent_ttd: 100,
      type: 'deposit'
    });
    
    // Open PayPal.me link directly - no CORS issues
    window.open(PAYPAL_DEPOSIT_URL, '_blank');
  };

  return (
    <Button 
      onClick={handlePayPalClick}
      variant="outline"
      className={`border-blue-600 text-blue-600 hover:bg-blue-50 ${className || ''}`}
      size="lg"
    >
      <CreditCard className="mr-2 h-4 w-4" />
      Pay $14.75 USD Deposit
    </Button>
  );
};
