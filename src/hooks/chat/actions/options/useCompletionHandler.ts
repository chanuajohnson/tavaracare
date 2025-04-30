
import { preparePrefillDataAndGetRegistrationUrl } from "@/utils/chat/prefillGenerator";
import { toast } from "sonner";

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
        const registrationUrl = await preparePrefillDataAndGetRegistrationUrl(progress.role, messages, true);
        
        // Show success message before redirecting
        toast.success("Registration data prepared. Redirecting to complete your registration...");
        
        // Short delay to allow the toast to be seen
        setTimeout(() => {
          window.location.href = registrationUrl;
        }, 1000);
        
        // Show a final message in the chat
        await simulateBotTyping(
          "Thank you for providing your information! I'm redirecting you to complete your registration now. Your responses have been saved to make the process easier.",
          [] // No options needed as we're redirecting
        );
        
        return true; // Handled
      } catch (error) {
        console.error("Error preparing registration redirect:", error);
        toast.error("There was an issue preparing your registration. Please try again.");
        
        // Fallback if there's an error
        if (progress.role) {
          window.location.href = `/registration/${progress.role}`;
        }
        return true; // Handled
      }
    } else if (optionId === "talk_to_representative") {
      // Prepare the chat data to send
      const chatData = {
        role: progress.role,
        sessionId: localStorage.getItem("tavara_chat_session") || undefined
      };
      
      // Dispatch custom event to open contact form with prefilled data
      const event = new CustomEvent('tavara:open-contact-form', {
        detail: {
          prefillData: chatData,
          fromChat: true
        }
      });
      window.dispatchEvent(event);
      
      // Show messaging options message
      await simulateBotTyping(
        "I've opened our contact form so you can get in touch with our representative. You can also reach out directly via WhatsApp at +1-868-786-5357 or email at chanuajohnson@gmail.com if you prefer.",
        [
          { id: "close_chat", label: "Close this chat" }
        ]
      );
      
      return true; // Handled
    } else if (optionId === "close_chat") {
      // Reset chat if user chooses to close
      await simulateBotTyping(
        "Thank you for chatting with us today! If you have any more questions in the future, feel free to start a new chat.",
        []
      );
      
      // Return action to reset the chat
      return { action: "reset" };
    }
    
    return false; // Not handled
  };

  return {
    handleCompletionOption
  };
};
