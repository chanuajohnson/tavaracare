
import React from 'react';
import { HelpCircle, FileQuestion, Phone, MessageSquare } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const SupportMenu = () => {
  const navigate = useNavigate();

  const handleOpenWhatsApp = () => {
    const phoneNumber = "+18687765357";
    const message = encodeURIComponent("Hello, I need support with Tavara.care platform.");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  const handleFAQClick = () => {
    navigate("/faq");
  };

  const handleContactSupport = () => {
    // Dispatch event to open contact form
    window.dispatchEvent(new CustomEvent('tavara:open-contact-form', {
      detail: { fromSupport: true }
    }));
  };

  const handleFeedback = () => {
    // Dispatch event to open feedback form  
    window.dispatchEvent(new CustomEvent('tavara:open-feedback-form', {
      detail: { fromSupport: true }
    }));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100"
          aria-label="Support options"
        >
          <HelpCircle className="h-5 w-5 text-gray-600" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2">
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer p-3 text-base"
          onClick={handleFAQClick}
        >
          <FileQuestion className="h-5 w-5" />
          <span>FAQ Section</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="flex items-center gap-2 cursor-pointer p-3 text-base"
          onClick={handleOpenWhatsApp}
        >
          <Phone className="h-5 w-5" />
          <span>WhatsApp Support</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer p-3 text-base"
          onClick={handleContactSupport}
        >
          <FileQuestion className="h-5 w-5" />
          <span>Contact Support</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer p-3 text-base"
          onClick={handleFeedback}
        >
          <MessageSquare className="h-5 w-5" />
          <span>Give Feedback</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
