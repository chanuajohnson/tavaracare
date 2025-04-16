
import { getPrefillDataFromUrl } from './prefillReader';

/**
 * Utility to prefill a registration form with chat data
 * @param form The form object to update (from react-hook-form)
 */
export const prefillRegistrationForm = (
  form: { setValue: (name: string, value: any) => void }
): void => {
  try {
    const prefillData = getPrefillDataFromUrl();
    
    if (!prefillData) {
      console.log("No prefill data found for registration form");
      return;
    }
    
    console.log("Prefilling registration form with data:", prefillData);
    
    // Map common fields from prefill data to form fields
    const fieldMapping: Record<string, string> = {
      first_name: 'firstName',
      last_name: 'lastName',
      email: 'email',
      phone: 'phoneNumber',
      location: 'location',
      budget: 'budget',
      availability: 'availability'
    };
    
    // Apply prefill data to form fields
    Object.entries(fieldMapping).forEach(([prefillKey, formKey]) => {
      if (prefillData[prefillKey]) {
        console.log(`Setting form field ${formKey} to: ${prefillData[prefillKey]}`);
        form.setValue(formKey, prefillData[prefillKey]);
      }
    });
    
    // Handle special fields or nested data if needed
    if (prefillData.responses) {
      console.log("Additional response data available for custom mapping");
      
      // Attempt to map specific responses to form fields
      const responses = prefillData.responses;
      
      // Loop through all sections
      Object.keys(responses).forEach(sectionKey => {
        const section = responses[sectionKey];
        
        // Loop through all questions in this section
        Object.entries(section).forEach(([questionKey, value]) => {
          // Map specific question IDs to form fields based on content
          // This is where custom mapping logic would go
          if (questionKey.includes('email')) {
            form.setValue('email', value);
          } else if (questionKey.includes('phone')) {
            form.setValue('phoneNumber', value);
          } else if (questionKey.includes('name')) {
            // Attempt to separate first/last name
            const nameParts = String(value).split(' ');
            if (nameParts.length > 1) {
              form.setValue('firstName', nameParts[0]);
              form.setValue('lastName', nameParts.slice(1).join(' '));
            } else {
              form.setValue('firstName', value);
            }
          }
        });
      });
    }
    
    // Log completion of prefill operation
    console.log("Registration form prefill completed");
    
  } catch (error) {
    console.error("Error prefilling registration form:", error);
  }
};

/**
 * Get data from chat session for the current user
 * @returns Session data or null if not found
 */
export const getCurrentChatSessionData = (): {
  sessionId: string;
  role: string | null;
  completed: boolean;
} | null => {
  try {
    // Check for session ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session');
    
    if (!sessionId) return null;
    
    // Get the role from the URL path
    const pathParts = window.location.pathname.split('/');
    let role = null;
    
    if (pathParts.length > 2 && pathParts[1] === 'registration') {
      role = pathParts[2];
    }
    
    // Check if we have prefill data for this session
    const prefillData = localStorage.getItem(`tavara_chat_prefill_${sessionId}`);
    const completed = prefillData ? JSON.parse(prefillData).completed || false : false;
    
    return {
      sessionId,
      role,
      completed
    };
  } catch (error) {
    console.error("Error getting current chat session data:", error);
    return null;
  }
};
