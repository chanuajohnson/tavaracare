
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

  const handleCompletionHandler = async (optionId: string) => {
    if (optionId === "proceed_to_registration") {
      // Handle direct navigation to registration form with auto-submit
      console.log("Preparing to redirect to registration form with auto-submit");
      try {
        // Generate prefill data before redirection, enable auto-submit
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
        
        // Mark chat as completed
        return { action: "complete" }; // New return value to mark completion
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
      // Open WhatsApp directly if possible
      const phoneNumber = "+18687865357"; // The WhatsApp number from requirements
      const message = `Hello, I'm interested in Tavara.care services${
        progress.role ? ` as a ${progress.role}` : ''
      }. I'd like to speak with a representative.`;
      
      try {
        // Format phone number and message for WhatsApp
        const formattedPhone = phoneNumber.replace(/\+/g, '');
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
        
        // Try to open WhatsApp
        const newWindow = window.open(whatsappUrl, '_blank');
        
        // Check if window was blocked
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          throw new Error('WhatsApp window was blocked');
        }
        
        // Show messaging options message
        await simulateBotTyping(
          "I've opened WhatsApp for you to chat with our representative. If it didn't open, you can also reach out directly to +1-868-786-5357 or email at chanuajohnson@gmail.com.",
          [
            { id: "open_contact_form", label: "Use contact form instead" },
            { id: "close_chat", label: "Close this chat" }
          ]
        );
        
        return { action: "complete" }; // Mark as completed
      } catch (error) {
        console.log("Could not open WhatsApp directly, falling back to contact form:", error);
        
        // Prepare the chat data to send to contact form
        const chatData = {
          role: progress.role,
          sessionId: localStorage.getItem("tavara_chat_session") || undefined,
          transcript: messages.map(m => ({
            content: m.content,
            isUser: m.isUser,
            timestamp: m.timestamp
          }))
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
        
        return { action: "complete" }; // Mark as completed
      }
    } else if (optionId === "open_contact_form") {
      // Open contact form as fallback option
      const chatData = {
        role: progress.role,
        sessionId: localStorage.getItem("tavara_chat_session") || undefined,
        transcript: messages
      };
      
      // Dispatch event to open contact form
      const event = new CustomEvent('tavara:open-contact-form', {
        detail: {
          prefillData: chatData,
          fromChat: true
        }
      });
      window.dispatchEvent(event);
      
      await simulateBotTyping(
        "I've opened our contact form for you to send a message to our team.",
        [
          { id: "close_chat", label: "Close this chat" }
        ]
      );
      
      return { action: "complete" }; // Mark as completed
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
    handleCompletionHandler
  };
};
