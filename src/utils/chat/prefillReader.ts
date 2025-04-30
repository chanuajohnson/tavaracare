/**
 * Helper utility to read prefill data from the URL query parameter
 * This can be used in registration forms to prefill data from the chat
 */
export const getPrefillDataFromUrl = (): Record<string, any> | null => {
  if (typeof window === "undefined") return null;
  
  // Get the session ID from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session');
  
  if (!sessionId) {
    console.log("No session ID found in URL for prefill data");
    return null;
  }
  
  console.log(`Found session ID in URL: ${sessionId}`);
  
  try {
    // Try to get data from localStorage first - this is our primary source
    const prefillData = localStorage.getItem(`tavara_chat_prefill_${sessionId}`);
    if (prefillData) {
      const parsedData = JSON.parse(prefillData);
      console.log("Successfully retrieved prefill data from localStorage:", parsedData);
      
      // Add a timestamp check to ensure we're not using stale data
      const timestamp = parsedData.timestamp || 0;
      const now = Date.now();
      const isStale = now - timestamp > 300000; // 5 minutes
      
      if (isStale) {
        console.warn("Prefill data is stale (over 5 minutes old)");
      }
      
      return parsedData;
    }
    
    console.log("No prefill data found in localStorage, falling back to responses");
    
    // Fallback to retrieving from responses
    const responses = localStorage.getItem(`tavara_chat_responses_${sessionId}`);
    if (responses) {
      const parsedResponses = JSON.parse(responses);
      console.log("Found chat responses:", parsedResponses);
      
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
      
      // Save the generated prefill data for future use
      localStorage.setItem(`tavara_chat_prefill_${sessionId}`, JSON.stringify({
        ...prefill,
        timestamp: Date.now()
      }));
      
      console.log("Created prefill data from responses:", prefill);
      return prefill;
    }
    
    console.log("No chat responses found for session ID:", sessionId);
    return null;
  } catch (error) {
    console.error("Error retrieving prefill data:", error);
    return null;
  }
};

/**
 * Utility to apply prefill data to a form
 * This can be used in registration forms to prefill data from the chat
 */
export const applyPrefillDataToForm = (
  setFormValue: (field: string, value: any) => void,
  options?: { 
    logDataReceived?: boolean, 
    checkAutoSubmit?: boolean, 
    autoSubmitCallback?: () => void,
    formRef?: React.RefObject<HTMLFormElement>
  }
): boolean => {
  try {
    const prefillData = getPrefillDataFromUrl();
    
    if (options?.logDataReceived) {
      console.log("Attempting to apply prefill data:", prefillData);
    }
    
    if (!prefillData) return false;
    
    // Apply standard fields
    const standardFields = [
      'first_name', 'last_name', 'email', 'phone', 
      'location', 'budget', 'availability'
    ];
    
    standardFields.forEach(field => {
      if (prefillData[field] !== undefined) {
        setFormValue(field, prefillData[field]);
        if (options?.logDataReceived) {
          console.log(`Applied prefill value for ${field}:`, prefillData[field]);
        }
      }
    });
    
    // Handle nested responses if needed
    if (prefillData.responses) {
      // Implementation depends on your form structure
      console.log("Additional responses data available:", prefillData.responses);
    }
    
    // Check if auto-submit is requested and callback is provided
    if (options?.checkAutoSubmit && prefillData.autoSubmit === true) {
      // If we have a form reference, use it for submission
      if (options.formRef?.current) {
        // Schedule the auto-submit to happen after form is fully populated
        setTimeout(() => {
          console.log("Auto-submitting form based on chat prefill data using form reference");
          options.formRef.current?.requestSubmit();
        }, 800);
        return true;
      } 
      // Otherwise use the callback if provided
      else if (options.autoSubmitCallback) {
        // Schedule the auto-submit to happen after form is fully populated
        setTimeout(() => {
          console.log("Auto-submitting form based on chat prefill data using callback");
          options.autoSubmitCallback();
        }, 800);
        return true;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error applying prefill data to form:", error);
    return false;
  }
};
