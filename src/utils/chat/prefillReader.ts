
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
 * Enhanced utility to apply prefill data to any form type
 * This can be used in registration forms, care assessment, and story forms
 */
export const applyPrefillDataToForm = (
  setFormValue: (field: string, value: any) => void,
  options?: { 
    logDataReceived?: boolean, 
    checkAutoSubmit?: boolean, 
    autoSubmitCallback?: () => void,
    formRef?: React.RefObject<HTMLFormElement>,
    formType?: 'registration' | 'care_assessment' | 'story' | 'professional'
  }
): boolean => {
  try {
    const prefillData = getPrefillDataFromUrl();
    
    if (options?.logDataReceived) {
      console.log("Attempting to apply prefill data:", prefillData);
    }
    
    if (!prefillData) {
      // Fallback: try to get session data without URL parameter
      const urlParams = new URLSearchParams(window.location.search);
      const fallbackSessionId = localStorage.getItem('tavara_chat_session');
      if (fallbackSessionId) {
        console.log('Trying fallback session ID:', fallbackSessionId);
        const fallbackData = localStorage.getItem(`tavara_chat_prefill_${fallbackSessionId}`);
        if (fallbackData) {
          const parsedFallbackData = JSON.parse(fallbackData);
          console.log('Found fallback prefill data:', parsedFallbackData);
          return applyPrefillDataToFormDirect(parsedFallbackData, setFormValue, options);
        }
      }
      return false;
    }
    
    return applyPrefillDataToFormDirect(prefillData, setFormValue, options);
  } catch (error) {
    console.error("Error applying prefill data to form:", error);
    return false;
  }
};

/**
 * Internal function to apply prefill data directly
 */
const applyPrefillDataToFormDirect = (
  prefillData: Record<string, any>,
  setFormValue: (field: string, value: any) => void,
  options?: { 
    logDataReceived?: boolean, 
    checkAutoSubmit?: boolean, 
    autoSubmitCallback?: () => void,
    formRef?: React.RefObject<HTMLFormElement>,
    formType?: 'registration' | 'care_assessment' | 'story' | 'professional'
  }
): boolean => {
  const formType = options?.formType || 'registration';
  
  // Define field mappings for different form types
  const fieldMappings = {
    registration: [
      'first_name', 'last_name', 'email', 'phone', 'location', 'address',
      'care_recipient_name', 'relationship', 'care_types', 'special_needs',
      'care_schedule', 'budget_preferences', 'caregiver_type', 'caregiver_preferences',
      'preferred_contact_method', 'additional_notes', 'custom_schedule'
    ],
    professional: [
      'first_name', 'last_name', 'email', 'phone', 'location', 'address',
      'professional_type', 'other_professional_type', 'years_of_experience',
      'specialties', 'care_services', 'certifications', 'care_schedule',
      'custom_schedule', 'preferred_locations', 'hourly_rate', 'transportation',
      'commute_mode', 'languages', 'emergency_contact', 'background_check',
      'additional_notes'
    ],
    care_assessment: [
      'care_recipient_name', 'primary_contact_name', 'primary_contact_phone',
      'care_location', 'emergency_contact_name', 'emergency_contact_phone',
      'emergency_contact_relationship', 'cultural_preferences', 'additional_notes'
    ],
    story: [
      'fullName', 'full_name', 'care_recipient_name', 'birth_year', 'birthYear',
      'life_story', 'lifeStory', 'joyful_things', 'joyfulThings', 'unique_facts',
      'uniqueFacts', 'cultural_preferences', 'culturalPreferences'
    ]
  };
  
  const fieldsToMap = fieldMappings[formType] || fieldMappings.registration;
  
  // Apply standard fields based on form type
  fieldsToMap.forEach(field => {
    if (prefillData[field] !== undefined) {
      setFormValue(field, prefillData[field]);
      if (options?.logDataReceived) {
        console.log(`Applied prefill value for ${field}:`, prefillData[field]);
      }
    }
  });
  
  // Handle nested responses data with enhanced field mapping
  if (prefillData.responses) {
    Object.entries(prefillData.responses).forEach(([key, value]: [string, any]) => {
      const responseValue = value?.response || value;
      
      // Enhanced field mapping based on question content and form type
      if (formType === 'care_assessment') {
        if (key.includes('name') && !key.includes('contact')) {
          setFormValue('care_recipient_name', responseValue);
        } else if (key.includes('contact') || key.includes('your_name')) {
          setFormValue('primary_contact_name', responseValue);
        } else if (key.includes('phone')) {
          setFormValue('primary_contact_phone', responseValue);
        } else if (key.includes('location') || key.includes('address')) {
          setFormValue('care_location', responseValue);
        }
      } else if (formType === 'story') {
        if (key.includes('name') || key.includes('recipient')) {
          setFormValue('fullName', responseValue);
        } else if (key.includes('story') || key.includes('about')) {
          setFormValue('lifeStory', responseValue);
        } else if (key.includes('joy') || key.includes('happy')) {
          setFormValue('joyfulThings', responseValue);
        } else if (key.includes('unique') || key.includes('special')) {
          setFormValue('uniqueFacts', responseValue);
        }
      }
      
      if (options?.logDataReceived) {
        console.log(`Processed response ${key}:`, responseValue);
      }
    });
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
};

/**
 * Check if the current form navigation came from the chat
 * Returns true if the user was directed here from the chatbot
 */
export const isChatRedirect = (): boolean => {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session');
  
  if (!sessionId) return false;
  
  // Check if there's a transition flag in localStorage
  return localStorage.getItem(`tavara_chat_transition_${sessionId}`) === "true";
};
