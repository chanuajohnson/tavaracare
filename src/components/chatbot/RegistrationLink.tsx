
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getSessionResponses } from "@/services/chatbotService";

interface RegistrationLinkProps {
  role?: string | null;
  onRegistrationClick?: () => void;
}

export const RegistrationLink: React.FC<RegistrationLinkProps> = ({ 
  role,
  onRegistrationClick 
}) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  
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
    
    if (sessionId) {
      try {
        // Ensure all responses are saved before redirecting
        const responses = await getSessionResponses(sessionId);
        console.log("Retrieved responses for registration:", responses);
        
        // Now redirect to the registration page with session ID
        window.location.href = `/registration/${role}?session=${sessionId}`;
      } catch (error) {
        console.error("Error retrieving responses:", error);
        // Fallback if there's an error
        window.location.href = `/registration/${role}`;
      }
    } else {
      // Fallback if there's no session ID
      window.location.href = `/registration/${role}`;
    }
  };

  return (
    <div className="border-t border-b p-2 text-center">
      <Button
        variant="link"
        size="sm"
        className="text-xs text-muted-foreground"
        onClick={handleRegistrationClick}
      >
        I'd rather fill out a quick form →
      </Button>
    </div>
  );
};
