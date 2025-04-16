
// Basic models for the registration flows

export interface ChatRegistrationQuestion {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'confirm';
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

export interface ChatRegistrationSection {
  title: string;
  questions: ChatRegistrationQuestion[];
}

export interface ChatRegistrationFlow {
  role: string;
  description: string;
  sections: ChatRegistrationSection[];
}

// Simplified family registration flow example
export const familyRegistrationFlow: ChatRegistrationFlow = {
  role: "family",
  description: "Chat flow for family registration",
  sections: [
    {
      title: "Personal Information",
      questions: [
        {
          id: "first_name",
          label: "What is your first name?",
          type: "text",
          required: true
        },
        {
          id: "last_name",
          label: "What is your last name?",
          type: "text",
          required: true
        },
        {
          id: "email",
          label: "What's your email address?",
          type: "text",
          required: true
        },
        {
          id: "phone",
          label: "What's your phone number?",
          type: "text",
          required: true
        }
      ]
    },
    {
      title: "Care Requirements",
      questions: [
        {
          id: "care_type",
          label: "What type of care are you looking for?",
          type: "select",
          options: [
            "Elder Care",
            "Child Care",
            "Special Needs Care",
            "Medical Support",
            "Other"
          ],
          required: true
        },
        {
          id: "care_details",
          label: "Can you provide more details about the care needs?",
          type: "textarea",
          required: false
        }
      ]
    }
  ]
};

// Simplified professional registration flow example
export const professionalRegistrationFlow: ChatRegistrationFlow = {
  role: "professional",
  description: "Chat flow for professional registration",
  sections: [
    {
      title: "Professional Information",
      questions: [
        {
          id: "first_name",
          label: "What is your first name?",
          type: "text",
          required: true
        },
        {
          id: "last_name",
          label: "What is your last name?",
          type: "text",
          required: true
        },
        {
          id: "professional_role",
          label: "What is your professional role?",
          type: "select",
          options: [
            "Nurse",
            "Home Health Aide",
            "Therapist",
            "Caregiver",
            "Other"
          ],
          required: true
        }
      ]
    },
    {
      title: "Experience",
      questions: [
        {
          id: "years_experience",
          label: "How many years of experience do you have?",
          type: "select",
          options: [
            "0-2 years",
            "3-5 years",
            "6-10 years",
            "10+ years"
          ],
          required: true
        },
        {
          id: "specialties",
          label: "What are your areas of specialty?",
          type: "multiselect",
          options: [
            "Elder Care",
            "Child Care",
            "Special Needs",
            "Medical Support",
            "Therapy",
            "Other"
          ],
          required: true
        }
      ]
    }
  ]
};

// Simple community registration flow
export const communityRegistrationFlow: ChatRegistrationFlow = {
  role: "community",
  description: "Chat flow for community registration",
  sections: [
    {
      title: "Community Information",
      questions: [
        {
          id: "name",
          label: "What is your name?",
          type: "text",
          required: true
        },
        {
          id: "organization",
          label: "Are you representing an organization?",
          type: "confirm",
          required: true
        },
        {
          id: "organization_name",
          label: "What is the name of your organization?",
          type: "text",
          required: false
        }
      ]
    },
    {
      title: "Involvement",
      questions: [
        {
          id: "involvement_type",
          label: "How would you like to get involved?",
          type: "checkbox",
          options: [
            "Volunteer",
            "Donate",
            "Advocacy",
            "Events",
            "Other"
          ],
          required: true
        },
        {
          id: "comments",
          label: "Any additional comments or questions?",
          type: "textarea",
          required: false
        }
      ]
    }
  ]
};

// Function to get registration flow based on role
export const getRegistrationFlowByRole = (role: string): ChatRegistrationFlow => {
  switch (role.toLowerCase()) {
    case 'family':
      return familyRegistrationFlow;
    case 'professional':
      return professionalRegistrationFlow;
    case 'community':
      return communityRegistrationFlow;
    default:
      // Default to family flow
      return familyRegistrationFlow;
  }
};
