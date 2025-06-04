
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date';
  required?: boolean;
  options?: string[];
  conversationalPrompt: string;
  helpText?: string;
}

export interface DetectedForm {
  formId: string;
  formTitle: string;
  fields: FormField[];
  currentStep?: number;
  totalSteps?: number;
}

// Form mapping database - maps routes to their form structures
const FORM_MAPPINGS: Record<string, DetectedForm> = {
  '/registration/family': {
    formId: 'family-registration',
    formTitle: 'Family Registration',
    fields: [
      {
        id: 'full_name',
        name: 'full_name',
        label: 'Full Name',
        type: 'text',
        required: true,
        conversationalPrompt: "What's your full name?",
        helpText: "I'll use this to personalize your care experience."
      },
      {
        id: 'email',
        name: 'email',
        label: 'Email',
        type: 'email',
        required: true,
        conversationalPrompt: "What's your email address?",
        helpText: "This will be your login and where we send important updates."
      },
      {
        id: 'phone_number',
        name: 'phone_number',
        label: 'Phone Number',
        type: 'tel',
        required: true,
        conversationalPrompt: "What's the best phone number to reach you?",
        helpText: "We'll use this for urgent care coordination."
      }
    ]
  },
  '/family/care-assessment': {
    formId: 'care-needs-assessment',
    formTitle: 'Care Needs Assessment',
    fields: [
      {
        id: 'care_recipient_name',
        name: 'care_recipient_name',
        label: 'Care Recipient Name',
        type: 'text',
        required: true,
        conversationalPrompt: "What's the name of your loved one who needs care?",
        helpText: "This helps us personalize their care plan."
      },
      {
        id: 'relationship_to_care_recipient',
        name: 'relationship_to_care_recipient',
        label: 'Relationship',
        type: 'select',
        required: true,
        options: ['Parent', 'Spouse', 'Sibling', 'Child', 'Other'],
        conversationalPrompt: "What's your relationship to them?",
        helpText: "Understanding your relationship helps us provide appropriate support."
      },
      {
        id: 'primary_care_needs',
        name: 'primary_care_needs',
        label: 'Primary Care Needs',
        type: 'checkbox',
        required: true,
        options: ['Personal Care', 'Medication Management', 'Mobility Assistance', 'Companionship', 'Meal Preparation'],
        conversationalPrompt: "What types of care do they need most? You can select multiple options.",
        helpText: "This helps us match you with the right caregivers."
      }
    ]
  },
  '/family/story': {
    formId: 'legacy-story',
    formTitle: 'Legacy Story',
    fields: [
      {
        id: 'care_recipient_story',
        name: 'care_recipient_story',
        label: 'Their Story',
        type: 'textarea',
        required: false,
        conversationalPrompt: "Tell me about your loved one. What makes them special? What should their caregivers know about who they are?",
        helpText: "This personal story helps caregivers connect with and provide personalized care."
      }
    ]
  }
};

export const useFormDetection = () => {
  const location = useLocation();
  const [currentForm, setCurrentForm] = useState<DetectedForm | null>(null);
  const [isFormPage, setIsFormPage] = useState(false);

  useEffect(() => {
    const detectForm = () => {
      const path = location.pathname;
      const detectedForm = FORM_MAPPINGS[path];
      
      if (detectedForm) {
        setCurrentForm(detectedForm);
        setIsFormPage(true);
      } else {
        setCurrentForm(null);
        setIsFormPage(false);
      }
    };

    detectForm();
  }, [location.pathname]);

  const getFieldByName = (fieldName: string): FormField | undefined => {
    return currentForm?.fields.find(field => field.name === fieldName);
  };

  const getNextField = (currentFieldName: string): FormField | undefined => {
    if (!currentForm) return undefined;
    
    const currentIndex = currentForm.fields.findIndex(field => field.name === currentFieldName);
    if (currentIndex >= 0 && currentIndex < currentForm.fields.length - 1) {
      return currentForm.fields[currentIndex + 1];
    }
    return undefined;
  };

  const getPreviousField = (currentFieldName: string): FormField | undefined => {
    if (!currentForm) return undefined;
    
    const currentIndex = currentForm.fields.findIndex(field => field.name === currentFieldName);
    if (currentIndex > 0) {
      return currentForm.fields[currentIndex - 1];
    }
    return undefined;
  };

  return {
    currentForm,
    isFormPage,
    getFieldByName,
    getNextField,
    getPreviousField
  };
};
