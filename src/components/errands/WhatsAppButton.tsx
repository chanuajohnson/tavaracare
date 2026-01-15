import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useTracking } from '@/hooks/useTracking';

interface WhatsAppButtonProps {
  formData?: {
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
  quickRequest?: boolean;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ formData, quickRequest = false }) => {
  const { trackEngagement } = useTracking();
  
  // Tavara WhatsApp number (replace with actual number)
  const TAVARA_WHATSAPP = '+18681234567'; // Update with real number

  const handleWhatsAppClick = () => {
    let message: string;
    
    if (quickRequest || !formData) {
      message = `Hi Tavara, I'd like to request an errand. I saw your pricing and would like to discuss my needs.`;
    } else {
      const needsText = formData.needs.join(', ').replace(/_/g, ' ');
      message = `Hi Tavara, I just submitted an Errands request (${needsText} / ${formData.location} / ${formData.urgency}).`;
    }
    
    // Match working pattern from your other application
    // Remove + prefix and use api.whatsapp.com/send/ format
    const cleanPhone = TAVARA_WHATSAPP.replace(/\+/g, '');
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;
    
    console.log('Opening WhatsApp URL:', whatsappUrl);
    
    // Track click
    trackEngagement('errands_whatsapp_click', {
      needs: formData?.needs || [],
      urgency: formData?.urgency || 'quick_request',
      location: formData?.location || 'not_specified',
      quickRequest
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