
import { ChatMessage } from "@/types/chatTypes";
import { getSessionResponses } from "@/services/chatbotService";

/**
 * Generate a prefill JSON object based on the user's responses
 * This will be used to prefill the registration form
 */
export const generatePrefillJson = (role: string, messages: ChatMessage[]): Record<string, any> => {
  // Start with the basic role
  const prefill: Record<string, any> = {
    role: role || "family"
  };

  // Extract data from messages
  const userMessages = messages.filter(msg => msg.isUser);

  for (const msg of userMessages) {
    // Simple extraction for now - this could be enhanced with AI or more sophisticated parsing
    const content = msg.content.trim();

    // Try to identify email addresses
    const emailMatch = content.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
    if (emailMatch && !prefill.email) {
      prefill.email = emailMatch[0];
    }

    // Try to identify phone numbers
    const phoneMatch = content.match(/(?:\+\d{1,3})?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g);
    if (phoneMatch && !prefill.phone) {
      prefill.phone = phoneMatch[0];
    }

    // Check for name patterns
    if (content.toLowerCase().includes("name is") && !prefill.name) {
      const nameMatch = content.match(/name is\s+([^,.]+)/i);
      if (nameMatch) {
        prefill.name = nameMatch[1].trim();
      }
    }
  }

  // Attempt to retrieve all saved responses from local storage
  try {
    const sessionId = localStorage.getItem("tavara_chat_session") || "";
    if (sessionId) {
      // This will be executed asynchronously, but since we're just logging for now,
      // we'll use the .then pattern without awaiting
      getSessionResponses(sessionId).then(responses => {
        console.log("Retrieved saved responses for prefill:", responses);
        
        // Map response fields to registration form fields
        Object.entries(responses).forEach(([key, value]: [string, any]) => {
          const responseValue = value.response;
          
          // Map section_X_question_Y to appropriate field names
          if (key.includes("first_name") || key.includes("full_name")) {
            prefill.first_name = responseValue;
          } else if (key.includes("last_name")) {
            prefill.last_name = responseValue;
          } else if (key.includes("email")) {
            prefill.email = responseValue;
          } else if (key.includes("phone")) {
            prefill.phone = responseValue;
          } else if (key.includes("location") || key.includes("address")) {
            prefill.location = responseValue;
          }
          
          // Store all responses in a nested object for complete data
          const questionParts = key.split("_");
          if (questionParts.length >= 4) {
            const sectionIndex = questionParts[1];
            const questionId = questionParts.slice(3).join("_");
            
            if (!prefill.responses) prefill.responses = {};
            if (!prefill.responses[sectionIndex]) prefill.responses[sectionIndex] = {};
            
            prefill.responses[sectionIndex][questionId] = responseValue;
          }
        });
        
        // Save the prefill data for later use
        localStorage.setItem(`tavara_chat_prefill_${sessionId}`, JSON.stringify(prefill));
        
        // Check for registration link handling
        const registrationLink = document.querySelector('a[href*="registration"]');
        if (registrationLink) {
          // Update the href to include the session ID for data retrieval
          const href = registrationLink.getAttribute('href');
          if (href && !href.includes('session=')) {
            registrationLink.setAttribute(
              'href', 
              `${href}${href.includes('?') ? '&' : '?'}session=${sessionId}`
            );
          }
        }
      });
    }
  } catch (error) {
    console.error("Error generating prefill data:", error);
  }

  return prefill;
};
