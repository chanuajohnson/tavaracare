
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, MessageSquare, Phone } from 'lucide-react';

interface ChatCompletionMessageProps {
  role?: string | null;
  onStartNewChat: () => void;
  onClose?: () => void;
}

export const ChatCompletionMessage: React.FC<ChatCompletionMessageProps> = ({
  role,
  onStartNewChat,
  onClose
}) => {
  // Function to handle direct WhatsApp contact
  const handleContactWhatsApp = () => {
    const phoneNumber = "+18687865357";
    const message = `Hello, I'm interested in Tavara.care services${
      role ? ` as a ${role}` : ''
    }. I'd like to speak with a representative.`;
    
    const formattedPhone = phoneNumber.replace(/\+/g, '');
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${formattedPhone}?text=${encodedMessage}`, '_blank');
  };

  // Function to send email
  const handleContactEmail = () => {
    window.location.href = `mailto:chanuajohnson@gmail.com?subject=Tavara.care Inquiry&body=Hello,%0A%0AI'm interested in learning more about Tavara.care services${role ? ` as a ${role}` : ''}.%0A%0AThank you.`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
        <Check className="h-8 w-8 text-green-600" />
      </div>
      
      <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
      
      <p className="text-muted-foreground mb-6">
        Your registration information has been saved. We appreciate your interest in Tavara.care!
      </p>
      
      <div className="space-y-4 w-full">
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">What happens next?</h4>
          <p className="text-sm text-muted-foreground">
            Our team will review your information and get back to you soon. 
            In the meantime, you can contact us directly with any questions.
          </p>
        </div>
        
        <div className="flex flex-col gap-3">
          <Button 
            variant="outline" 
            className="gap-2 w-full" 
            onClick={handleContactWhatsApp}
          >
            <Phone className="h-4 w-4" />
            Contact via WhatsApp
          </Button>
          
          <Button 
            variant="outline" 
            className="gap-2 w-full" 
            onClick={handleContactEmail}
          >
            <MessageSquare className="h-4 w-4" />
            Email Us
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={onStartNewChat}
          >
            Start a new chat
          </Button>
        </div>
      </div>
    </div>
  );
};
