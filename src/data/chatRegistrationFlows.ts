
// Data structures for registration flows by role

// Base question type
export interface ChatRegistrationQuestion {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'confirm';
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

// Section of questions
export interface ChatRegistrationSection {
  title: string;
  questions: ChatRegistrationQuestion[];
}

// Full registration flow
export interface ChatRegistrationFlow {
  role: string;
  description: string;
  sections: ChatRegistrationSection[];
}

// Family registration flow
export const familyRegistrationFlow: ChatRegistrationFlow = {
  role: "family",
  description: "AI Chatbot question flow for Family registration on Tavara.care",
  sections: [
    {
      title: "Personal Information",
      questions: [
        {
          id: "first_name",
          label: "First Name",
          type: "text",
          required: true
        },
        {
          id: "last_name",
          label: "Last Name",
          type: "text",
          required: true
        },
        {
          id: "email",
          label: "Email Address",
          type: "text",
          required: false
        },
        {
          id: "phone_number",
          label: "Phone Number",
          type: "text",
          required: true
        },
        {
          id: "care_location",
          label: "Location – Address/City of the care recipient",
          type: "text",
          required: true
        }
      ]
    },
    {
      title: "Care Recipient Information",
      questions: [
        {
          id: "care_recipient_name",
          label: "Care Recipient's Full Name",
          type: "text",
          required: true
        },
        {
          id: "relationship_to_recipient",
          label: "Relationship to Care Recipient",
          type: "select",
          required: true,
          options: ["Parent", "Spouse", "Child", "Sibling", "Friend", "Other"]
        },
        {
          id: "care_type",
          label: "Primary Care Type Needed",
          type: "checkbox",
          options: [
            "In-Home Care (Daily, Nighttime, Weekend, Live-in)",
            "Medical Support (Post-surgery, Chronic Condition Management, Hospice)",
            "Therapeutic Support (Physical Therapy, Occupational Therapy, Speech Therapy)",
            "Child or Special Needs Support (Autism, ADHD, Learning Disabilities)",
            "Cognitive & Memory Care (Alzheimer's, Dementia, Parkinson's)",
            "Mobility Assistance (Wheelchair, Bed-bound, Fall Prevention)",
            "Medication Management (Daily Medications, Insulin, Medical Equipment)",
            "Nutritional Assistance (Meal Prep, Special Diets, Tube Feeding)",
            "Household Assistance (Cleaning, Laundry, Errands, Yard/Garden Maintenance)"
          ]
        },
        {
          id: "preferred_caregiver_type",
          label: "Preferred Caregiver Type",
          type: "select",
          options: [
            "Licensed Nurse",
            "Certified Caregiver",
            "Any Qualified Caregiver",
            "Other"
          ]
        }
      ]
    },
    {
      title: "Special Medical & Care Needs",
      questions: [
        {
          id: "care_conditions",
          label: "Does the Care Recipient Have Any of These Conditions?",
          type: "checkbox",
          options: [
            "Cognitive Disorders – Alzheimer's, Dementia, Parkinson's",
            "Physical Disabilities – Stroke, Paralysis, ALS, Multiple Sclerosis",
            "Chronic Illness – Diabetes, Heart Disease, Cancer, Kidney Disease",
            "Special Needs (Child or Adult) – Autism, Down Syndrome, Cerebral Palsy, ADHD",
            "Medical Equipment Use – Oxygen Tank, Ventilator, Catheter, Feeding Tube",
            "Vision or Hearing Impairment"
          ]
        },
        {
          id: "other_special_needs",
          label: "Other Special Needs (if any)",
          type: "textarea",
          placeholder: "Please specify any other special needs"
        },
        {
          id: "specialized_requirements",
          label: "Specialized Care Requirements",
          type: "checkbox",
          options: [
            "24/7 Supervision",
            "Nurse-Level Medical Assistance",
            "Special Diet/Nutritional Needs",
            "Transportation to Appointments",
            "Sign Language/Language-Specific Care"
          ]
        }
      ]
    },
    {
      title: "Care Preferences",
      questions: [
        {
          id: "care_schedule",
          label: "Care Schedule & Availability",
          type: "checkbox",
          options: [
            "Monday – Friday, 8 AM – 4 PM",
            "Monday – Friday, 6 AM – 6 PM",
            "Monday – Friday, 6 PM – 8 AM",
            "Saturday – Sunday, 6 AM – 6 PM",
            "Weekday Evening Shift (4 PM – 6 AM)",
            "Weekday Evening Shift (4 PM – 8 AM)",
            "Weekday Evening Shift (6 PM – 6 AM)",
            "Weekday Evening Shift (6 PM – 8 AM)",
            "Flexible / On-Demand Availability",
            "Live-In Care (Full-time in-home support)",
            "Other (Custom shift — specify your hours)"
          ]
        },
        {
          id: "caregiver_preferences",
          label: "Caregiver Preferences",
          type: "textarea",
          placeholder: "Gender, Age, Language, Experience Level"
        },
        {
          id: "emergency_contact",
          label: "Emergency Contact Details",
          type: "textarea",
          placeholder: "Name, relationship, phone number"
        },
        {
          id: "budget",
          label: "Budget Preferences",
          type: "text",
          placeholder: "Hourly or monthly care budget"
        },
        {
          id: "preferred_contact_method",
          label: "Preferred Contact Method",
          type: "select",
          options: ["Phone", "Email", "WhatsApp"]
        },
        {
          id: "additional_notes",
          label: "Additional Notes",
          type: "textarea",
          placeholder: "Any other information you would like to share"
        }
      ]
    }
  ]
};

// Professional registration flow
export const professionalRegistrationFlow: ChatRegistrationFlow = {
  role: "professional",
  description: "AI Chatbot question flow for Professional registration on Tavara.care",
  sections: [
    {
      title: "Personal & Contact Information",
      questions: [
        { 
          id: "first_name", 
          type: "text", 
          label: "What's your first name?" 
        },
        { 
          id: "last_name", 
          type: "text", 
          label: "And your last name?" 
        },
        {
          id: "professional_role",
          type: "select",
          label: "Which role best describes the professional services you provide?",
          options: [
            "Professional Agency",
            "Licensed Nurse (LPN/RN/BSN)",
            "Home Health Aide (HHA)",
            "Certified Nursing Assistant (CNA)",
            "Special Needs Caregiver",
            "Physical / Occupational Therapist",
            "Nutritional & Dietary Specialist",
            "Medication Management Expert",
            "Elderly & Mobility Support",
            "Holistic Care & Wellness",
            "The Geriatric Adolescent Partnership Programme (GAPP)"
          ]
        },
        {
          id: "years_experience",
          type: "select",
          label: "How many years of caregiving experience do you have?",
          options: ["0–1 years", "1–3 years", "3–5 years", "5–10 years", "10+ years"]
        },
        {
          id: "certifications",
          type: "textarea",
          label: "List any certifications or training (like CPR, First Aid, etc). You can upload the documents later."
        },
        { 
          id: "location", 
          type: "text", 
          label: "Where are you located? (City, State, Country)" 
        },
        { 
          id: "phone", 
          type: "text", 
          label: "What's the best phone number to reach you?" 
        },
        { 
          id: "email", 
          type: "text", 
          label: "What's your email address?" 
        },
        {
          id: "preferred_contact",
          type: "select",
          label: "How would you prefer families contact you?",
          options: ["Phone Call", "WhatsApp", "Email"]
        }
      ]
    },
    {
      title: "Care Services & Specializations",
      questions: [
        {
          id: "care_services",
          type: "multiselect",
          label: "What types of care services do you provide?",
          options: [
            "In-Home Care",
            "Medical Support",
            "Child or Special Needs Support",
            "Cognitive & Memory Care",
            "Mobility Assistance",
            "Medication Management",
            "Nutritional Assistance",
            "Household Assistance"
          ]
        },
        {
          id: "medical_conditions",
          type: "multiselect",
          label: "Which medical conditions do you have experience with?",
          options: [
            "Alzheimer's / Dementia",
            "Cancer / Palliative",
            "Parkinson's / Stroke / Paralysis",
            "Special Needs",
            "Chronic Conditions (Diabetes, Heart Disease, COPD)"
          ]
        },
        {
          id: "other_conditions",
          type: "textarea",
          label: "Do you have experience with any other conditions? Feel free to list them here."
        }
      ]
    },
    {
      title: "Availability & Preferences",
      questions: [
        {
          id: "availability",
          type: "multiselect",
          label: "When are you generally available to work?",
          options: [
            "Mon–Fri, 8 AM – 4 PM",
            "Mon–Fri, 6 AM – 6 PM",
            "Mon–Fri, 6 PM – 8 AM",
            "Sat–Sun, 6 AM – 6 PM",
            "Weekday Evening Shift (4 PM – 6 AM)",
            "Weekday Evening Shift (4 PM – 8 AM)",
            "Weekday Evening Shift (6 PM – 6 AM)",
            "Weekday Evening Shift (6 PM – 8 AM)",
            "Flexible / On-Demand",
            "Other (Custom shift)"
          ]
        },
        {
          id: "work_type",
          type: "select",
          label: "What type of work arrangement do you prefer?",
          options: ["Full-time", "Part-time", "On-call", "Contract", "Flexible"]
        },
        {
          id: "additional_qualifications",
          type: "multiselect",
          label: "Do you have any of these additional qualifications or capabilities?",
          options: [
            "Administers Medication",
            "Light Housekeeping",
            "Provides Transportation",
            "Handles Medical Equipment",
            "Has Liability Insurance",
            "Has Recent Background Check"
          ]
        }
      ]
    },
    {
      title: "Emergency, Rate, & Additional Info",
      questions: [
        {
          id: "emergency_contact",
          type: "text",
          label: "Please share your emergency contact's name, relationship, and phone number."
        },
        {
          id: "rate",
          type: "text",
          label: "If you have a preferred hourly rate or range, you can share it here. Or just say 'Negotiable'."
        },
        {
          id: "notes",
          type: "textarea",
          label: "You can add anything else about your approach, your values, or accommodations you may need."
        },
        {
          id: "consent",
          type: "confirm",
          label: "Do you agree to the Terms of Service and Privacy Policy?"
        }
      ]
    }
  ]
};

// Community registration flow
export const communityRegistrationFlow: ChatRegistrationFlow = {
  role: "community",
  description: "AI Chatbot question flow for Community registration on Tavara.care",
  sections: [
    {
      title: "Personal Information",
      questions: [
        {
          id: "full_name",
          label: "Full Name",
          type: "text",
          required: true
        },
        {
          id: "location",
          label: "Location (City, State, Country)",
          type: "text",
          required: true
        },
        {
          id: "phone",
          label: "Phone Number",
          type: "text",
          required: true
        },
        {
          id: "email",
          label: "Email Address",
          type: "text",
          required: false
        },
        {
          id: "website_or_social",
          label: "Website or Social Media (Optional)",
          type: "text",
          required: false
        }
      ]
    },
    {
      title: "Community Involvement",
      questions: [
        {
          id: "roles",
          label: "What roles would you like to take in our community?",
          type: "checkbox",
          options: [
            "Community Volunteer",
            "Community Organizer",
            "Patient/Caregiver Advocate",
            "Educator/Trainer",
            "Support Group Leader",
            "Resource Provider",
            "Technology Innovator",
            "Researcher"
          ]
        },
        {
          id: "contributions",
          label: "What types of contributions interest you?",
          type: "checkbox",
          options: [
            "Sharing Resources & Information",
            "Organizing Community Events",
            "Running Support Groups",
            "Mentoring New Caregivers",
            "Advocacy & Awareness Campaigns",
            "Fundraising for Caregiver Causes",
            "Technology Solutions for Caregiving",
            "Educational Programs & Workshops"
          ]
        }
      ]
    },
    {
      title: "Caregiving Experience",
      questions: [
        {
          id: "caregiving_experience",
          label: "Tell us about your personal or professional experience with caregiving (if any)",
          type: "textarea",
          placeholder: "This helps us understand your perspective and how you might contribute"
        },
        {
          id: "care_areas",
          label: "Areas of caregiving you're interested in or experienced with",
          type: "checkbox",
          options: [
            "Elderly Care",
            "Childcare",
            "Special Needs Care",
            "Disability Support",
            "Mental Health Support",
            "Chronic Illness Management",
            "Palliative/End-of-Life Care"
          ]
        }
      ]
    },
    {
      title: "Technology & Innovation",
      questions: [
        {
          id: "technology_interests",
          label: "What caregiving technologies interest you?",
          type: "checkbox",
          options: [
            "Caregiver Mobile Apps",
            "Health Wearables & Monitors",
            "Telehealth Solutions",
            "Smart Home Technology",
            "AI & Machine Learning for Care",
            "Accessibility Technology"
          ]
        }
      ]
    },
    {
      title: "Participation Preferences",
      questions: [
        {
          id: "participation_modes",
          label: "How would you prefer to be involved?",
          type: "checkbox",
          options: [
            "Online/Virtual Participation",
            "In-Person Local Events",
            "Leadership Roles",
            "Behind-the-Scenes Support",
            "One-Time Projects",
            "Ongoing Commitments"
          ]
        },
        {
          id: "communication_preferences",
          label: "Preferred communication channels",
          type: "checkbox",
          options: [
            "Email Updates",
            "Newsletter",
            "Mobile App Notifications",
            "Text Messages",
            "Social Media",
            "Community Forum"
          ]
        }
      ]
    },
    {
      title: "Motivation & Ideas",
      questions: [
        {
          id: "motivation",
          label: "Why are you interested in joining our community?",
          type: "textarea"
        },
        {
          id: "ideas",
          label: "Do you have ideas for improving caregiving in your community?",
          type: "textarea"
        }
      ]
    },
    {
      title: "Directory & Notifications",
      questions: [
        {
          id: "directory_visibility",
          label: "List me in the community directory",
          type: "checkbox",
          required: false
        },
        {
          id: "enable_notifications",
          label: "Enable community notifications",
          type: "checkbox",
          required: false
        }
      ]
    }
  ]
};

// Get registration flow by role
export const getRegistrationFlowByRole = (role: string): ChatRegistrationFlow => {
  switch (role) {
    case "family":
      return familyRegistrationFlow;
    case "professional":
      return professionalRegistrationFlow;
    case "community":
      return communityRegistrationFlow;
    default:
      return familyRegistrationFlow; // Default to family
  }
};

// Helper function to get questions for a specific section
export const getQuestionsForSection = (
  role: string,
  sectionIndex: number
): ChatRegistrationQuestion[] => {
  const flow = getRegistrationFlowByRole(role);
  
  if (sectionIndex >= 0 && sectionIndex < flow.sections.length) {
    return flow.sections[sectionIndex].questions;
  }
  
  return [];
};

// Helper function to get total number of sections for a role
export const getTotalSectionsForRole = (role: string): number => {
  const flow = getRegistrationFlowByRole(role);
  return flow.sections.length;
};

// Helper function to get section title
export const getSectionTitle = (role: string, sectionIndex: number): string => {
  const flow = getRegistrationFlowByRole(role);
  
  if (sectionIndex >= 0 && sectionIndex < flow.sections.length) {
    return flow.sections[sectionIndex].title;
  }
  
  return "";
};
