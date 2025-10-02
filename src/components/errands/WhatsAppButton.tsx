import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { generateWhatsAppURL } from '@/utils/whatsapp/whatsappWebUtils';
import { useTracking } from '@/hooks/useTracking';

interface WhatsAppButtonProps {
  formData: {
    needs: string[];
    urgency: string;
    location: string;
    recipient: string;
    name: string;
    phone: string;
    email?: string;
    notes?: string;
    consent: boolean;
  };
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ formData }) => {
  const { trackEngagement } = useTracking();
  
  // Tavara WhatsApp number (replace with actual number)
  const TAVARA_WHATSAPP = '+18681234567'; // Update with real number

  const handleWhatsAppClick = () => {
    const needsText = formData.needs.join(', ').replace(/_/g, ' ');
    const message = `Hi Tavara, I just submitted an Errands request (${needsText} / ${formData.location} / ${formData.urgency}).`;
    
    const whatsappUrl = generateWhatsAppURL(TAVARA_WHATSAPP, message);
    
    // Track click
    trackEngagement('errands_whatsapp_click', {
      needs: formData.needs,
      urgency: formData.urgency,
      location: formData.location
    });
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Button 
      onClick={handleWhatsAppClick}
      className="w-full bg-green-600 hover:bg-green-700 text-white"
      size="lg"
    >
      <MessageCircle className="mr-2 h-5 w-5" />
      Message Tavara Team on WhatsApp
    </Button>
  );
};