
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'file';
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
  userRole?: 'family' | 'professional' | 'community';
  journeyStage?: string;
  autoGreetingMessage?: string;
}

// Comprehensive form mapping database - covers all user journey touchpoints
const FORM_MAPPINGS: Record<string, DetectedForm> = {
  // Family Journey Forms
  '/registration/family': {
    formId: 'family-registration',
    formTitle: 'Family Registration',
    userRole: 'family',
    journeyStage: 'registration',
    autoGreetingMessage: "💙 Welcome to your family registration! I'm TAV, and I can help you fill out this form conversationally or guide you through each step. This is the REAL Tavara experience - the same magical TAV assistance our families get! Would you like my help?",
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
    userRole: 'family',
    journeyStage: 'assessment',
    autoGreetingMessage: "💙 I see you're working on your care needs assessment! This is so important for finding the right support. This is the REAL Tavara experience - I can help you think through each care need conversationally, or guide you section by section. What would be most helpful?",
    fields: []
  },
  
  '/family/care-needs': {
    formId: 'care-needs-assessment',
    formTitle: 'Care Needs Assessment', 
    userRole: 'family',
    journeyStage: 'assessment',
    autoGreetingMessage: "💙 Welcome to our care needs assessment! This is the REAL Tavara experience - the same magical TAV assistance our families get. I can help you think through each care need conversationally, or guide you section by section. What would be most helpful?",
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
    userRole: 'family',
    journeyStage: 'story',
    autoGreetingMessage: "💙 What a beautiful step - capturing your loved one's story! This is the REAL Tavara experience - I can help you think through their story conversationally, or you can write freely. Either way, this will be treasured. How would you like to begin?",
    fields: []
  },
  
  '/legacy/stories': {
    formId: 'legacy-story',
    formTitle: 'Legacy Stories',
    userRole: 'family', 
    journeyStage: 'story',
    autoGreetingMessage: "💙 Welcome to our legacy stories platform! This is the REAL Tavara experience - the same magical TAV assistance our families get. I can help you capture your loved one's story conversationally, or guide you through sharing family memories. How would you like to begin?",
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
  },

  // Professional Journey Forms
  '/registration/professional': {
    formId: 'professional-registration',
    formTitle: 'Professional Registration',
    userRole: 'professional',
    journeyStage: 'registration',
    autoGreetingMessage: "🤝 Welcome to your professional registration! I'm TAV, and I'm here to help you showcase your expertise beautifully. This is the REAL Tavara experience - the same magical TAV assistance our professionals get! Would you like my help?",
    fields: [
      {
        id: 'professional_type',
        name: 'professional_type',
        label: 'Professional Type',
        type: 'select',
        required: true,
        options: ['Registered Nurse', 'Licensed Practical Nurse', 'Certified Nursing Assistant', 'Home Health Aide', 'Personal Care Assistant', 'Companion Caregiver', 'Other'],
        conversationalPrompt: "What type of healthcare professional are you?",
        helpText: "This helps families understand your qualifications."
      },
      {
        id: 'years_of_experience',
        name: 'years_of_experience',
        label: 'Years of Experience',
        type: 'select',
        required: true,
        options: ['Less than 1 year', '1-2 years', '3-5 years', '6-10 years', '11-15 years', 'More than 15 years'],
        conversationalPrompt: "How many years of caregiving experience do you have?",
        helpText: "Your experience level helps with appropriate matching."
      },
      {
        id: 'certifications',
        name: 'certifications',
        label: 'Certifications',
        type: 'checkbox',
        required: false,
        options: ['CPR Certified', 'First Aid Certified', 'Medication Administration', 'Dementia Care Training', 'Hospice Care Training'],
        conversationalPrompt: "What certifications do you currently hold? Select all that apply.",
        helpText: "Certifications showcase your specialized training."
      },
      {
        id: 'care_services',
        name: 'care_services',
        label: 'Care Services',
        type: 'checkbox',
        required: true,
        options: ['Personal Care', 'Medication Management', 'Mobility Assistance', 'Companionship', 'Meal Preparation', 'Light Housekeeping', 'Transportation'],
        conversationalPrompt: "What care services do you provide? Select all that you're comfortable with.",
        helpText: "This helps families find the right match for their needs."
      }
    ]
  },

  '/professional/profile': {
    formId: 'professional-profile-hub',
    formTitle: 'Professional Profile Hub',
    userRole: 'professional',
    journeyStage: 'profile-completion',
    autoGreetingMessage: "🤝 I see you're working on your professional profile! This is where you truly shine and connect with families. I can help you optimize each section, upload documents, or guide you through completion. What area would you like to focus on?",
    fields: [
      {
        id: 'bio',
        name: 'bio',
        label: 'Professional Bio',
        type: 'textarea',
        required: false,
        conversationalPrompt: "Tell families about yourself. What makes you passionate about caregiving? What should they know about your approach to care?",
        helpText: "A personal bio helps families connect with you beyond qualifications."
      },
      {
        id: 'availability',
        name: 'availability',
        label: 'Availability',
        type: 'checkbox',
        required: false,
        options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Day Shift', 'Evening Shift', 'Night Shift', 'Weekends Only'],
        conversationalPrompt: "When are you typically available to work? Select all that apply.",
        helpText: "Clear availability helps with better shift matching."
      },
      {
        id: 'document_uploads',
        name: 'document_uploads',
        label: 'Professional Documents',
        type: 'file',
        required: false,
        conversationalPrompt: "Do you have any professional documents to upload? I can help you organize certifications, licenses, or background checks.",
        helpText: "Uploaded documents build trust with families and verify your qualifications."
      }
    ]
  },

  '/professional/training': {
    formId: 'professional-training',
    formTitle: 'Training Resources',
    userRole: 'professional',
    journeyStage: 'skill-development',
    autoGreetingMessage: "🤝 Ready to expand your skills? I can guide you through available training modules, track your progress, or help you find specific topics you're interested in. What would you like to focus on today?",
    fields: [
      {
        id: 'training_interests',
        name: 'training_interests',
        label: 'Training Interests',
        type: 'checkbox',
        required: false,
        options: ['Dementia Care', 'Medication Management', 'Fall Prevention', 'Communication Skills', 'Family Dynamics', 'Emergency Response'],
        conversationalPrompt: "What training topics interest you most?",
        helpText: "I can recommend modules based on your interests and career goals."
      }
    ]
  },

  // Community Journey Forms
  '/registration/community': {
    formId: 'community-registration',
    formTitle: 'Community Registration',
    userRole: 'community',
    journeyStage: 'registration',
    autoGreetingMessage: "🌟 Welcome to our caring community! Thank you for wanting to make a difference. This is the REAL Tavara experience - the same magical TAV assistance our community members get! Let's discover how you'd like to be part of our village of care!",
    fields: [
      {
        id: 'community_motivation',
        name: 'community_motivation',
        label: 'Why Join Our Community',
        type: 'textarea',
        required: true,
        conversationalPrompt: "What inspired you to join our community? What do you hope to contribute or gain?",
        helpText: "Your motivation helps us connect you with like-minded community members."
      },
      {
        id: 'involvement_preferences',
        name: 'involvement_preferences',
        label: 'How You\'d Like to Help',
        type: 'checkbox',
        required: true,
        options: ['Volunteer Support', 'Resource Sharing', 'Event Planning', 'Technology Innovation', 'Community Outreach', 'Mentoring'],
        conversationalPrompt: "How would you like to contribute to our community? Select all that interest you.",
        helpText: "We'll match you with opportunities that align with your interests."
      },
      {
        id: 'tech_interests',
        name: 'tech_interests',
        label: 'Technology Interests',
        type: 'checkbox',
        required: false,
        options: ['App Development', 'Data Analysis', 'User Experience Design', 'Content Creation', 'Social Media', 'Healthcare Innovation'],
        conversationalPrompt: "Are you interested in any technology aspects of caregiving innovation?",
        helpText: "Technology skills help us build better solutions for families and caregivers."
      },
      {
        id: 'contribution_interests',
        name: 'contribution_interests',
        label: 'Areas of Interest',
        type: 'checkbox',
        required: false,
        options: ['Elder Care', 'Child Care', 'Special Needs Support', 'Mental Health', 'Caregiver Support', 'Family Resources'],
        conversationalPrompt: "Which areas of care are you most passionate about?",
        helpText: "This helps us connect you with relevant projects and initiatives."
      }
    ]
  },

  // Additional Journey Touchpoints
  '/family/meal-management': {
    formId: 'meal-management',
    formTitle: 'Meal Management',
    userRole: 'family',
    journeyStage: 'care-tools',
    autoGreetingMessage: "💙 Let's make meal planning easier for your family! I can help you set up meal plans, create grocery lists, or find recipes that work for your loved one's needs. What would be most helpful right now?",
    fields: []
  },

  '/family/medication-management': {
    formId: 'medication-management',
    formTitle: 'Medication Management',
    userRole: 'family',
    journeyStage: 'care-tools',
    autoGreetingMessage: "💙 Medication management is so important! I can help you set up medication schedules, track administrations, or organize prescription information. Let's make this as simple and safe as possible. How can I help?",
    fields: []
  },

  '/family/care-management': {
    formId: 'care-management',
    formTitle: 'Care Management',
    userRole: 'family',
    journeyStage: 'care-coordination',
    autoGreetingMessage: "💙 Welcome to your care management hub! This is where everything comes together - care plans, team coordination, schedules. I can help you navigate any section or set up new care plans. What would you like to focus on?",
    fields: []
  },

  '/caregiver/health': {
    formId: 'caregiver-health',
    formTitle: 'Caregiver Health & Wellness',
    userRole: 'professional',
    journeyStage: 'self-care',
    autoGreetingMessage: "🤝 Taking care of yourself is just as important as caring for others! I can help you track your wellness, find resources for caregiver burnout, or connect you with support. You matter too - how can I support you today?",
    fields: []
  }
};

export const useFormDetection = () => {
  const location = useLocation();
  const [currentForm, setCurrentForm] = useState<DetectedForm | null>(null);
  const [isFormPage, setIsFormPage] = useState(false);

  useEffect(() => {
    const detectForm = () => {
      let path = location.pathname;
      
      // Handle demo routes by mapping them to their corresponding form routes
      if (path.startsWith('/demo/')) {
        path = path.replace('/demo', '');
      }
      
      const detectedForm = FORM_MAPPINGS[path];
      
      if (detectedForm) {
        setCurrentForm(detectedForm);
        setIsFormPage(true);
      } else {
        // Check for partial matches (e.g., /professional/profile/documents)
        const partialMatch = Object.keys(FORM_MAPPINGS).find(route => 
          path.startsWith(route) && route !== '/'
        );
        
        if (partialMatch) {
          setCurrentForm(FORM_MAPPINGS[partialMatch]);
          setIsFormPage(true);
        } else {
          setCurrentForm(null);
          setIsFormPage(false);
        }
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

  const isJourneyTouchpoint = (path: string): boolean => {
    return Object.keys(FORM_MAPPINGS).some(route => 
      path === route || path.startsWith(route)
    );
  };

  return {
    currentForm,
    isFormPage,
    isJourneyTouchpoint,
    getFieldByName,
    getNextField,
    getPreviousField
  };
};
