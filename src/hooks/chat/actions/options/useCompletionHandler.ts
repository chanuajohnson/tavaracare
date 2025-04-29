
import { preparePrefillDataAndGetRegistrationUrl } from "@/utils/chat/prefillGenerator";

interface UseCompletionHandlerProps {
  progress: any;
  messages: any[];
  simulateBotTyping: (message: string, options?: any) => Promise<void>;
}

export const useCompletionHandler = ({
  progress,
  messages,
  simulateBotTyping
}: UseCompletionHandlerProps) => {

  const handleCompletionOption = async (optionId: string) => {
    if (optionId === "proceed_to_registration") {
      // Handle direct navigation to registration form
      console.log("Preparing to redirect to registration form");
      try {
        // Generate prefill data before redirection
        const registrationUrl = await preparePrefillDataAndGetRegistrationUrl(progress.role, messages);
        window.location.href = registrationUrl;
        return true; // Handled
      } catch (error) {
        console.error("Error preparing registration redirect:", error);
        // Fallback if there's an error
        if (progress.role) {
          window.location.href = `/registration/${progress.role}`;
        }
        return true; // Handled
      }
    } else if (optionId === "talk_to_representative") {
      // Handle request to talk to a representative
      await simulateBotTyping(
        "I've noted that you'd like to speak with a representative. Someone from our team will reach out to you soon. In the meantime, would you like to complete your registration?",
        [
          { id: "proceed_to_registration", label: "Complete my registration" },
          { id: "close_chat", label: "Close this chat" }
        ]
      );
      return true; // Handled
    } else if (optionId === "close_chat") {
      // Reset chat if user chooses to close
      return { action: "reset" };
    }
    
    return false; // Not handled
  };

  return {
    handleCompletionOption
  };
};
