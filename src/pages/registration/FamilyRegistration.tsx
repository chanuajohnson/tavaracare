
import { useEffect } from "react";
import { ConversationalFormChat } from "@/components/tav/components/ConversationalFormChat";
import { setAuthFlowFlag, AUTH_FLOW_FLAGS } from "@/utils/authFlowUtils";

const FamilyRegistration = () => {
  useEffect(() => {
    // Prevent auth redirection by setting specific flag for registration
    setAuthFlowFlag(AUTH_FLOW_FLAGS.SKIP_REGISTRATION_REDIRECT);
    
    // Clean up on unmount
    return () => {
      sessionStorage.removeItem(AUTH_FLOW_FLAGS.SKIP_REGISTRATION_REDIRECT);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <ConversationalFormChat role="family" />
    </div>
  );
};

export default FamilyRegistration;
