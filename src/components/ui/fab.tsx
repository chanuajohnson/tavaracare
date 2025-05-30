
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle, X, MessageSquare, FileQuestion, Phone, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useChat } from "@/components/chatbot/ChatProvider";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";
import { useIsMobile } from "@/hooks/use-mobile";

interface FabProps {
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  label?: string;
  showMenu?: boolean;
}

export const Fab = ({
  icon = <HelpCircle className="h-5 w-5" />,
  onClick,
  className,
  position = "bottom-right",
  label,
  showMenu = true,
}: FabProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [contactFormData, setContactFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [prefillData, setPrefillData] = useState<any>(null);
  
  // Try to access the chat context, with a fallback for when context isn't available
  let chatContextAvailable = true;
  let openChat: () => void;
  let closeChat: () => void;
  
  try {
    // Attempt to use the ChatProvider context
    const chatContext = useChat();
    openChat = chatContext.openChat;
    closeChat = chatContext.closeChat;
  } catch (error) {
    // Fallback if no ChatProvider is available
    console.error("Chat context not available in Fab:", error);
    chatContextAvailable = false;
    openChat = () => console.error("Chat context not available");
    closeChat = () => console.error("Chat context not available");
  }

  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
  };

  // Listen for events from the chat to open the contact form
  useEffect(() => {
    const handleOpenContactForm = (event: CustomEvent) => {
      setIsContactFormOpen(true);
      
      // Close chat if it's open
      if (isChatOpen) {
        setIsChatOpen(false);
      }
      
      // If we received prefill data from the chat
      if (event.detail?.prefillData) {
        setPrefillData(event.detail.prefillData);
        
        // Update message if coming from chat
        if (event.detail.fromChat) {
          setContactFormData(prev => ({
            ...prev,
            message: `[Request from chat] I'd like to speak with a representative about Tavara.care services.${
              event.detail.prefillData.role ? ` I'm interested as a ${event.detail.prefillData.role}.` : ''
            }`
          }));
        }
      }
    };

    window.addEventListener('tavara:open-contact-form', handleOpenContactForm as EventListener);
    
    return () => {
      window.removeEventListener('tavara:open-contact-form', handleOpenContactForm as EventListener);
    };
  }, [isChatOpen]);

  const handleOpenWhatsApp = () => {
    const phoneNumber = "+18687865357";
    const message = encodeURIComponent("Hello, I need support with Tavara.care platform.");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  const handleFAQClick = () => {
    navigate("/faq");
  };

  const toggleChat = () => {
    // Use the ChatProvider context methods if available
    if (chatContextAvailable) {
      if (isChatOpen) {
        closeChat();
      } else {
        openChat();
      }
    }
    
    // Also update the local state to control the chat widget visibility in this component
    setIsChatOpen(prev => !prev);
    
    // Close contact form if open
    if (isContactFormOpen) {
      setIsContactFormOpen(false);
    }
  };

  const handleContactFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Validate form
      if (!contactFormData.name || !contactFormData.email || !contactFormData.message) {
        toast.error("Please fill out all required fields");
        setIsSubmitting(false);
        return;
      }
      
      // Prepare the data to send
      const formData = { 
        ...contactFormData,
        // Add any chat session data if it exists
        ...(prefillData ? { chatData: prefillData } : {})
      };
      
      // Handle screenshot if provided
      if (screenshotFile) {
        // Convert screenshot to base64
        const reader = new FileReader();
        const base64Screenshot = await new Promise<string>((resolve) => {
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(screenshotFile);
        });
        
        // Add screenshot to form data
        formData["screenshot"] = base64Screenshot;
      }
      
      // Send form data to Edge Function
      const { data, error } = await supabase.functions.invoke("send-contact-email", {
        body: formData,
      });
      
      if (error) {
        throw new Error(error.message || "Failed to send support request");
      }
      
      console.log("Contact form submitted successfully:", data);
      toast.success("Your support request has been submitted. We'll get back to you soon!");
      
      // Reset form
      setContactFormData({ name: "", email: "", message: "" });
      setScreenshotFile(null);
      setPrefillData(null);
      setIsContactFormOpen(false);
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error(error.message || "Failed to send support request. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setContactFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file is an image and not too large (max 5MB)
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Screenshot must be less than 5MB");
        return;
      }
      
      setScreenshotFile(file);
    }
  };

  return (
    <>
      {!showMenu ? (
        <Button
          onClick={onClick}
          size="icon"
          className={cn(
            "fixed z-50 rounded-full w-14 h-14 shadow-lg flex items-center justify-center transition-all hover:scale-105",
            positionClasses[position],
            className
          )}
          aria-label={label || "Action button"}
        >
          {icon}
        </Button>
      ) : (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                className={cn(
                  "fixed z-50 rounded-full w-14 h-14 shadow-lg flex items-center justify-center transition-all hover:scale-105",
                  positionClasses[position],
                  className
                )}
                aria-label={label || "Support options"}
              >
                {icon}
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
                onClick={() => setIsContactFormOpen(true)}
              >
                <MessageSquare className="h-5 w-5" />
                <span>Contact Form</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer p-3 text-base"
                onClick={toggleChat}
              >
                <MessageSquare className="h-5 w-5" />
                <span>Chat with Assistant</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isContactFormOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Contact Support</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsContactFormOpen(false)}
                    disabled={isSubmitting}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <form onSubmit={handleContactFormSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">
                        Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={contactFormData.name}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1">
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={contactFormData.email}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-1">
                        Issue Description
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        value={contactFormData.message}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        rows={4}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label htmlFor="screenshot" className="block text-sm font-medium mb-1">
                        Screenshot (optional)
                      </label>
                      <input
                        id="screenshot"
                        name="screenshot"
                        type="file"
                        accept="image/*"
                        className="w-full p-2 border rounded"
                        onChange={handleFileChange}
                        disabled={isSubmitting}
                      />
                      {screenshotFile && (
                        <p className="text-xs text-green-600 mt-1">
                          Screenshot selected: {screenshotFile.name}
                        </p>
                      )}
                    </div>
                    {prefillData && (
                      <div className="bg-blue-50 p-2 rounded text-xs">
                        <p>Including chat session data with your request</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsContactFormOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Submit"
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* Chat widget - improved positioning and responsiveness for mobile */}
          {isChatOpen && (
            <div className={`fixed z-50 ${isMobile ? "inset-x-4 bottom-24" : "right-6 bottom-24"}`}>
              <div className="relative">
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-background border shadow-sm z-10"
                  onClick={toggleChat}
                >
                  <X size={14} />
                </Button>
                <ChatbotWidget 
                  width={isMobile ? "100%" : "350px"}
                  onClose={toggleChat}
                />
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};
