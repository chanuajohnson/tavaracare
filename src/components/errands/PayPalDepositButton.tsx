import React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { useTracking } from '@/hooks/useTracking';

export const PayPalDepositButton: React.FC = () => {
  const { trackEngagement } = useTracking();
  
  // PayPal.me link for TT$100 deposit (corrected URL format)
  const PAYPAL_DEPOSIT_URL = 'https://www.paypal.me/tavaracare/100';

  const handlePayPalClick = () => {
    // Track click
    trackEngagement('errands_paypal_click', {
      amount: 100,
      currency: 'TTD',
      type: 'deposit'
    });
    
    // Open PayPal
    window.open(PAYPAL_DEPOSIT_URL, '_blank');
  };

  const handleBankTransferClick = () => {
    const message = 'Hi Tavara, I submitted an errands request and would like to pay the deposit via bank transfer. Please send me the details.';
    const whatsappUrl = `https://wa.me/+18681234567?text=${encodeURIComponent(message)}`;
    
    // Track click
    trackEngagement('errands_bank_transfer_click');
    
    // Open WhatsApp for bank transfer details
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-3 w-full">
      <Button 
        onClick={handlePayPalClick}
        variant="outline"
        className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 mobile-button-responsive mobile-touch-target"
        size="lg"
      >
        <CreditCard className="mr-2 mobile-icon-responsive" />
        Pay TT$100 Deposit with PayPal
      </Button>
      
      <div className="text-center">
        <button
          onClick={handleBankTransferClick}
          className="text-sm text-muted-foreground hover:text-foreground underline mobile-touch-target"
        >
          Prefer bank transfer? Tap here for details
        </button>
      </div>
      
      <p className="text-xs text-center text-muted-foreground px-2">
        TT$100 deposit secures your slot • Credited to final booking price • Balance confirmed via WhatsApp
      </p>
    </div>
  );
};