
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
      // Custom mapping logic can go here
    }
  } catch (error) {
    console.error("Error prefilling registration form:", error);
  }
};
