import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle, X, FileQuestion, Phone, Loader2, MessageSquare } from 'lucide-react';
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
import { useIsMobile } from "@/hooks/use-mobile";
import { FeedbackForm } from "@/components/ui/feedback-form";
import { validateChatInput } from "@/services/chat/utils/inputValidation";
import { useAuth } from "@/components/providers/AuthProvider";

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
  const { user } = useAuth();
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [isFeedbackFormOpen, setIsFeedbackFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactFormData, setContactFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [prefillData, setPrefillData] = useState<any>(null);

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
      
      // If we received prefill data from the chat
      if (event.detail?.prefillData) {
        setPrefillData(event.detail.prefillData);
        
        // Update message if coming from chat
        if (event.detail.fromChat) {
          setContactFormData(prev => ({
            ...prev,
            message: `[Request from TAV] I'd like to speak with a representative about Tavara.care services.${
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
  }, []);

  const validateForm = () => {
    const errors = {
      name: "",
      email: "",
      message: "",
    };

    // Validate name
    const nameValidation = validateChatInput(contactFormData.name, "name");
    if (!nameValidation.isValid) {
      errors.name = nameValidation.errorMessage || "Name is required";
    }

    // Validate email
    const emailValidation = validateChatInput(contactFormData.email, "email");
    if (!emailValidation.isValid) {
      errors.email = emailValidation.errorMessage || "Valid email is required";
    }

    // Validate message
    if (!contactFormData.message.trim()) {
      errors.message = "Message is required";
    }

    setFormErrors(errors);
    return !errors.name && !errors.email && !errors.message;
  };

  const handleOpenWhatsApp = () => {
    const phoneNumber = "+18687865357";
    const message = encodeURIComponent("Hello, I need support with Tavara.care platform.");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  const handleFAQClick = () => {
    navigate("/faq");
  };

  const handleContactFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Convert screenshot to base64 if provided
      let screenshotBase64 = null;
      if (screenshotFile) {
        const reader = new FileReader();
        screenshotBase64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(screenshotFile);
        });
      }
      
      // Store contact request directly in database
      const { error } = await supabase
        .from('user_feedback')
        .insert({
          user_id: user?.id || null,
          feedback_type: 'general',
          category: 'contact_support',
          subject: 'Contact Support Request',
          message: contactFormData.message,
          contact_info: {
            name: contactFormData.name,
            email: contactFormData.email
          },
          metadata: {
            source: 'contact_form',
            screenshot: screenshotBase64 || null,
            chatData: prefillData || null,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent || 'Unknown'
          },
          status: 'new',
          priority: 'medium'
        });

      if (error) {
        throw new Error(error.message || "Failed to store contact request");
      }
      
      console.log("Contact form submitted successfully");
      toast.success("Your support request has been submitted. We'll get back to you soon!");
      
      // Reset form
      setContactFormData({ name: "", email: "", message: "" });
      setFormErrors({ name: "", email: "", message: "" });
      setScreenshotFile(null);
      setPrefillData(null);
      setIsContactFormOpen(false);
    } catch (error: any) {
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
    
    // Clear error when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
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
                <FileQuestion className="h-5 w-5" />
                <span>Contact Support</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer p-3 text-base"
                onClick={() => setIsFeedbackFormOpen(true)}
              >
                <MessageSquare className="h-5 w-5" />
                <span>Give Feedback</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Contact Form Modal */}
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
                        Name *
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={contactFormData.name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                          formErrors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isSubmitting}
                      />
                      {formErrors.name && (
                        <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1">
                        Email *
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={contactFormData.email}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                          formErrors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isSubmitting}
                      />
                      {formErrors.email && (
                        <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-1">
                        Message *
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        value={contactFormData.message}
                        onChange={handleInputChange}
                        className={`w-full min-h-[100px] ${
                          formErrors.message ? 'border-red-500' : ''
                        }`}
                        disabled={isSubmitting}
                      />
                      {formErrors.message && (
                        <p className="text-sm text-red-600 mt-1">{formErrors.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="screenshot" className="block text-sm font-medium mb-1">
                        Screenshot (optional)
                      </label>
                      <input
                        id="screenshot"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={isSubmitting}
                      />
                      {screenshotFile && (
                        <p className="text-sm text-green-600 mt-1">
                          Screenshot attached: {screenshotFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsContactFormOpen(false)}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Message"
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Feedback Form Modal */}
          {isFeedbackFormOpen && (
            <FeedbackForm 
              onClose={() => setIsFeedbackFormOpen(false)}
              prefillData={prefillData}
            />
          )}
        </>
      )}
    </>
  );
};
