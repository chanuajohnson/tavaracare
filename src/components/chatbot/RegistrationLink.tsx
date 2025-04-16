
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getSessionResponses } from "@/services/chatbotService";
import { preparePrefillDataAndGetRegistrationUrl } from "@/utils/chat/prefillGenerator";
import { useChat } from "./ChatProvider";

interface RegistrationLinkProps {
  role?: string | null;
  onRegistrationClick?: () => void;
}

export const RegistrationLink: React.FC<RegistrationLinkProps> = ({ 
  role,
  onRegistrationClick 
}) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const { messages } = useChat(); // Now using messages from context
  
  useEffect(() => {
    // Get the session ID from localStorage
    const storedSessionId = localStorage.getItem("tavara_chat_session");
    if (storedSessionId) {
      setSessionId(storedSessionId);
    }
  }, []);
  
  if (!role) return null;

  // Create link with session ID for pre-filling form data
  const handleRegistrationClick = async () => {
    if (onRegistrationClick) {
      onRegistrationClick();
      return;
    }
    
    if (isNavigating) return; // Prevent multiple clicks
    setIsNavigating(true);
    
    try {
      if (sessionId) {
        console.log("Preparing registration redirect with session:", sessionId);
        
        // Ensure all responses are processed and saved before redirecting
        const url = await preparePrefillDataAndGetRegistrationUrl(role, messages);
        console.log("Redirecting to registration URL:", url);
        
        // Short delay to ensure data is saved to localStorage
        setTimeout(() => {
          window.location.href = url;
        }, 100);
      } else {
        console.log("No session ID found, redirecting without prefill data");
        window.location.href = `/registration/${role}`;
      }
    } catch (error) {
      console.error("Error during registration redirect:", error);
      // Fallback if there's an error
      window.location.href = `/registration/${role}`;
    } finally {
      setIsNavigating(false);
    }
  };

  return (
    <div className="border-t border-b p-2 text-center">
      <Button
        variant="link"
        size="sm"
        className="text-xs text-muted-foreground"
        onClick={handleRegistrationClick}
        disabled={isNavigating}
      >
        {isNavigating ? 'Preparing form...' : "I'd rather fill out a quick form →"}
      </Button>
    </div>
  );
};
