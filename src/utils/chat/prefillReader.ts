
/**
 * Helper utility to read prefill data from the URL query parameter
 * This can be used in registration forms to prefill data from the chat
 */
export const getPrefillDataFromUrl = () => {
  if (typeof window === "undefined") return null;
  
  // Get the session ID from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session');
  
  if (!sessionId) return null;
  
  try {
    // Try to get data from localStorage first
    const prefillData = localStorage.getItem(`tavara_chat_prefill_${sessionId}`);
    if (prefillData) {
      return JSON.parse(prefillData);
    }
    
    // Fallback to retrieving from responses
    const responses = localStorage.getItem(`tavara_chat_responses_${sessionId}`);
    if (responses) {
      const parsedResponses = JSON.parse(responses);
      
      // Extract basic information
      const prefill: Record<string, any> = { responses: {} };
      
      Object.entries(parsedResponses).forEach(([key, value]: [string, any]) => {
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
        
        // Store original key-value pairs
        prefill.responses[key] = responseValue;
      });
      
      // Role is always set to the URL path segment
      const pathParts = window.location.pathname.split('/');
      if (pathParts.length > 2) {
        prefill.role = pathParts[2]; // Assuming path is /registration/{role}
      }
      
      return prefill;
    }
    
    return null;
  } catch (error) {
    console.error("Error retrieving prefill data:", error);
    return null;
  }
};
