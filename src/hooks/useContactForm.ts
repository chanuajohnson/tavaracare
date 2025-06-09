
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { validateChatInput } from "@/services/chat/utils/inputValidation";
import { useAuth } from "@/components/providers/AuthProvider";

export const useContactForm = () => {
  const { user } = useAuth();
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
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

  return {
    isContactFormOpen,
    setIsContactFormOpen,
    isSubmitting,
    contactFormData,
    formErrors,
    screenshotFile,
    handleContactFormSubmit,
    handleInputChange,
    handleFileChange,
  };
};
