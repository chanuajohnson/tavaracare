import { UserRole } from "@/types/userRoles";

interface RegistrationOption {
  value: string;
  label: string;
}

interface RegistrationQuestion {
  id: string;
  text: string;
  type: "text" | "email" | "tel" | "select" | "multi-select" | "textarea";
  options?: RegistrationOption[];
  required: boolean;
  section: string;
  placeholder?: string;
  validationRegex?: string;
  validationMessage?: string;
}

interface RegistrationSection {
  id: string;
  title: string;
  description: string;
  questions: RegistrationQuestion[];
}

export const familyRegistrationFlow: RegistrationSection[] = [
  {
    id: "personal_info",
    title: "👋 About You",
    description: "Let's start with some basic information about you",
    questions: [
      {
        id: "full_name",
        text: "What's your full name?",
        type: "text",
        required: true,
        section: "personal_info",
        placeholder: "Your full name"
      },
      {
        id: "phone_number",
        text: "What's your phone number?",
        type: "tel",
        required: true,
        section: "personal_info",
        placeholder: "+1 (868) 123-4567",
        validationRegex: "^\\+?[0-9\\s\\(\\)\\-]{10,20}$",
        validationMessage: "Please enter a valid phone number"
      },
      {
        id: "address",
        text: "What's your address?",
        type: "textarea",
        required: true,
        section: "personal_info",
        placeholder: "Your full address"
      }
    ]
  },
  {
    id: "care_recipient",
    title: "👨‍👩‍👧 Care Recipient",
    description: "Tell us about the person who needs care",
    questions: [
      {
        id: "care_recipient_name",
        text: "What's the name of the person who needs care?",
        type: "text",
        required: true,
        section: "care_recipient",
        placeholder: "Their full name"
      },
      {
        id: "relationship",
        text: "What's your relationship to them?",
        type: "select",
        options: [
          { value: "parent", label: "Parent" },
          { value: "spouse", label: "Spouse/Partner" },
          { value: "child", label: "Child" },
          { value: "sibling", label: "Sibling" },
          { value: "friend", label: "Friend" },
          { value: "other", label: "Other" }
        ],
        required: true,
        section: "care_recipient"
      }
    ]
  },
  {
    id: "care_schedule",
    title: "📅 Care Schedule & Availability",
    description: "When do you need care support?",
    questions: [
      {
        id: "care_schedule",
        text: "What schedule works best for your care needs?",
        type: "multi-select",
        options: [
          // Standard Weekday Shifts
          { value: "mon_fri_8am_4pm", label: "☀️ Monday – Friday, 8 AM – 4 PM (Standard daytime coverage)" },
          { value: "mon_fri_8am_6pm", label: "🕕 Monday – Friday, 8 AM – 6 PM (Extended daytime coverage)" },
          { value: "mon_fri_6am_6pm", label: "🕕 Monday – Friday, 6 AM – 6 PM (Extended daytime coverage)" },
          
          // Weekend Shifts
          { value: "sat_sun_6am_6pm", label: "🌞 Saturday – Sunday, 6 AM – 6 PM (Daytime weekend coverage)" },
          
          // Evening & Overnight Shifts
          { value: "weekday_evening_4pm_6am", label: "🌙 Weekday Evening Shift (4 PM – 6 AM)" },
          { value: "weekday_evening_4pm_8am", label: "🌙 Weekday Evening Shift (4 PM – 8 AM)" },
          { value: "weekday_evening_5pm_5am", label: "🌙 Weekday Evening Shift (5 PM – 5 AM)" },
          { value: "weekday_evening_5pm_8am", label: "🌙 Weekday Evening Shift (5 PM – 8 AM)" },
          { value: "weekday_evening_6pm_6am", label: "🌙 Weekday Evening Shift (6 PM – 6 AM)" },
          { value: "weekday_evening_6pm_8am", label: "🌙 Weekday Evening Shift (6 PM – 8 AM)" },
          
          // Other Options
          { value: "flexible", label: "⏳ Flexible / On-Demand Availability" },
          { value: "live_in_care", label: "🏡 Live-In Care (Full-time in-home support)" },
          { value: "24_7_care", label: "🕐 24/7 Care Availability" },
          { value: "around_clock_shifts", label: "🌅 Around-the-Clock Shifts (Multiple caregivers rotating)" },
          { value: "other", label: "✏️ Other (Custom shift — specify your hours)" }
        ],
        required: true,
        section: "care_schedule"
      }
    ]
  },
  {
    id: "care_needs",
    title: "🩺 Care Needs",
    description: "What type of care is needed?",
    questions: [
      {
        id: "care_types",
        text: "What type of care assistance do you need?",
        type: "multi-select",
        options: [
          { value: "personal_care", label: "🧼 Personal Care (bathing, dressing, toileting)" },
          { value: "medication_management", label: "💊 Medication Management" },
          { value: "mobility_assistance", label: "🚶 Mobility Assistance" },
          { value: "meal_preparation", label: "🍲 Meal Preparation" },
          { value: "housekeeping", label: "🧹 Light Housekeeping" },
          { value: "transportation", label: "🚗 Transportation" },
          { value: "companionship", label: "👥 Companionship" },
          { value: "specialized_care", label: "🏥 Specialized Medical Care" }
        ],
        required: true,
        section: "care_needs"
      },
      {
        id: "special_needs",
        text: "Does the care recipient have any special needs or conditions?",
        type: "multi-select",
        options: [
          { value: "dementia", label: "🧠 Dementia/Alzheimer's" },
          { value: "parkinsons", label: "🤲 Parkinson's Disease" },
          { value: "diabetes", label: "🩸 Diabetes" },
          { value: "stroke_recovery", label: "🫀 Stroke Recovery" },
          { value: "cancer_care", label: "🎗️ Cancer Care" },
          { value: "heart_disease", label: "❤️ Heart Disease" },
          { value: "respiratory_issues", label: "🫁 Respiratory Issues" },
          { value: "mobility_limitations", label: "♿ Mobility Limitations" },
          { value: "wound_care", label: "🩹 Wound Care" },
          { value: "incontinence", label: "💧 Incontinence" },
          { value: "other", label: "✏️ Other (please specify)" }
        ],
        required: false,
        section: "care_needs"
      }
    ]
  },
  {
    id: "caregiver_preferences",
    title: "👩‍⚕️ Caregiver Preferences",
    description: "What are you looking for in a caregiver?",
    questions: [
      {
        id: "caregiver_type",
        text: "What type of caregiver are you looking for?",
        type: "select",
        options: [
          { value: "professional", label: "👩‍⚕️ Professional Caregiver (trained, experienced)" },
          { value: "nurse", label: "🏥 Nurse (RN or LPN)" },
          { value: "companion", label: "👥 Companion Caregiver (non-medical)" },
          { value: "specialized", label: "🔬 Specialized Care Provider" },
          { value: "no_preference", label: "🤷 No specific preference" }
        ],
        required: true,
        section: "caregiver_preferences"
      },
      {
        id: "caregiver_preferences",
        text: "Do you have any specific preferences for your caregiver?",
        type: "textarea",
        required: false,
        section: "caregiver_preferences",
        placeholder: "Any preferences regarding language, experience, etc."
      }
    ]
  },
  {
    id: "budget",
    title: "💰 Budget",
    description: "Let's talk about your care budget",
    questions: [
      {
        id: "budget_preferences",
        text: "What's your budget range for caregiving services?",
        type: "select",
        options: [
          { value: "under_15", label: "Under $15/hour" },
          { value: "15_20", label: "$15-$20/hour" },
          { value: "20_25", label: "$20-$25/hour" },
          { value: "25_30", label: "$25-$30/hour" },
          { value: "30_plus", label: "$30+/hour" },
          { value: "not_sure", label: "Not sure yet" }
        ],
        required: true,
        section: "budget"
      }
    ]
  },
  {
    id: "additional_info",
    title: "📝 Additional Information",
    description: "Anything else we should know?",
    questions: [
      {
        id: "additional_notes",
        text: "Is there anything else you'd like to share about your care needs?",
        type: "textarea",
        required: false,
        section: "additional_info",
        placeholder: "Any additional details that would help us understand your situation better"
      },
      {
        id: "preferred_contact_method",
        text: "What's your preferred contact method?",
        type: "select",
        options: [
          { value: "phone", label: "📞 Phone" },
          { value: "email", label: "📧 Email" },
          { value: "text", label: "💬 Text Message" },
          { value: "whatsapp", label: "📱 WhatsApp" }
        ],
        required: true,
        section: "additional_info"
      }
    ]
  }
];

export const professionalRegistrationFlow: RegistrationSection[] = [
  {
    id: "personal_info",
    title: "👋 About You",
    description: "Let's start with some basic information about you",
    questions: [
      {
        id: "full_name",
        text: "What's your full name?",
        type: "text",
        required: true,
        section: "personal_info",
        placeholder: "Your full name"
      },
      {
        id: "phone_number",
        text: "What's your phone number?",
        type: "tel",
        required: true,
        section: "personal_info",
        placeholder: "+1 (868) 123-4567",
        validationRegex: "^\\+?[0-9\\s\\(\\)\\-]{10,20}$",
        validationMessage: "Please enter a valid phone number"
      },
      {
        id: "address",
        text: "What's your address?",
        type: "textarea",
        required: true,
        section: "personal_info",
        placeholder: "Your full address"
      }
    ]
  },
  {
    id: "professional_details",
    title: "👩‍⚕️ Professional Details",
    description: "Tell us about your caregiving experience",
    questions: [
      {
        id: "professional_type",
        text: "What type of caregiver are you?",
        type: "select",
        options: [
          { value: "registered_nurse", label: "🏥 Registered Nurse (RN)" },
          { value: "licensed_practical_nurse", label: "💉 Licensed Practical Nurse (LPN)" },
          { value: "certified_nursing_assistant", label: "👨‍⚕️ Certified Nursing Assistant (CNA)" },
          { value: "home_health_aide", label: "🏠 Home Health Aide" },
          { value: "personal_care_assistant", label: "👤 Personal Care Assistant" },
          { value: "companion_caregiver", label: "👥 Companion Caregiver" },
          { value: "other", label: "✏️ Other (please specify)" }
        ],
        required: true,
        section: "professional_details"
      },
      {
        id: "years_of_experience",
        text: "How many years of caregiving experience do you have?",
        type: "select",
        options: [
          { value: "less_than_1", label: "Less than 1 year" },
          { value: "1_2", label: "1-2 years" },
          { value: "3_5", label: "3-5 years" },
          { value: "6_10", label: "6-10 years" },
          { value: "more_than_10", label: "More than 10 years" }
        ],
        required: true,
        section: "professional_details"
      },
      {
        id: "license_number",
        text: "Do you have a professional license number? (Optional)",
        type: "text",
        required: false,
        section: "professional_details",
        placeholder: "License number if applicable"
      }
    ]
  },
  {
    id: "certifications",
    title: "🎓 Certifications & Skills",
    description: "What are your qualifications and specialties?",
    questions: [
      {
        id: "certifications",
        text: "What certifications do you have?",
        type: "multi-select",
        options: [
          { value: "cpr", label: "💓 CPR Certified" },
          { value: "first_aid", label: "🩹 First Aid" },
          { value: "dementia_care", label: "🧠 Dementia Care" },
          { value: "medication_management", label: "💊 Medication Management" },
          { value: "wound_care", label: "🩹 Wound Care" },
          { value: "hospice", label: "🕊️ Hospice Care" },
          { value: "alzheimers", label: "🧩 Alzheimer's Care" },
          { value: "diabetes_management", label: "🩸 Diabetes Management" },
          { value: "stroke_recovery", label: "🫀 Stroke Recovery" },
          { value: "respiratory_care", label: "🫁 Respiratory Care" },
          { value: "other", label: "✏️ Other (please specify)" }
        ],
        required: false,
        section: "certifications"
      },
      {
        id: "care_services",
        text: "What care services do you provide?",
        type: "multi-select",
        options: [
          { value: "personal_care", label: "🧼 Personal Care (bathing, dressing, toileting)" },
          { value: "medication_management", label: "💊 Medication Management" },
          { value: "mobility_assistance", label: "🚶 Mobility Assistance" },
          { value: "meal_preparation", label: "🍲 Meal Preparation" },
          { value: "housekeeping", label: "🧹 Light Housekeeping" },
          { value: "transportation", label: "🚗 Transportation" },
          { value: "companionship", label: "👥 Companionship" },
          { value: "specialized_care", label: "🏥 Specialized Medical Care" },
          { value: "overnight_care", label: "🌙 Overnight Care" },
          { value: "respite_care", label: "🏖️ Respite Care" }
        ],
        required: true,
        section: "certifications"
      },
      {
        id: "languages",
        text: "What languages do you speak?",
        type: "multi-select",
        options: [
          { value: "english", label: "🇬🇧 English" },
          { value: "spanish", label: "🇪🇸 Spanish" },
          { value: "french", label: "🇫🇷 French" },
          { value: "hindi", label: "🇮🇳 Hindi" },
          { value: "mandarin", label: "🇨🇳 Mandarin" },
          { value: "other", label: "✏️ Other (please specify)" }
        ],
        required: true,
        section: "certifications"
      }
    ]
  },
  {
    id: "availability",
    title: "📅 Your Availability",
    description: "When are you available to provide care?",
    questions: [
      {
        id: "availability",
        text: "What's your typical availability for caregiving work?",
        type: "multi-select",
        options: [
          // Standard Weekday Shifts
          { value: "mon_fri_8am_4pm", label: "☀️ Monday – Friday, 8 AM – 4 PM (Standard daytime coverage)" },
          { value: "mon_fri_8am_6pm", label: "🕕 Monday – Friday, 8 AM – 6 PM (Extended daytime coverage)" },
          { value: "mon_fri_6am_6pm", label: "🕕 Monday – Friday, 6 AM – 6 PM (Extended daytime coverage)" },
          
          // Weekend Shifts
          { value: "sat_sun_6am_6pm", label: "🌞 Saturday – Sunday, 6 AM – 6 PM (Daytime weekend coverage)" },
          
          // Evening & Overnight Shifts
          { value: "weekday_evening_4pm_6am", label: "🌙 Weekday Evening Shift (4 PM – 6 AM)" },
          { value: "weekday_evening_4pm_8am", label: "🌙 Weekday Evening Shift (4 PM – 8 AM)" },
          { value: "weekday_evening_5pm_5am", label: "🌙 Weekday Evening Shift (5 PM – 5 AM)" },
          { value: "weekday_evening_5pm_8am", label: "🌙 Weekday Evening Shift (5 PM – 8 AM)" },
          { value: "weekday_evening_6pm_6am", label: "🌙 Weekday Evening Shift (6 PM – 6 AM)" },
          { value: "weekday_evening_6pm_8am", label: "🌙 Weekday Evening Shift (6 PM – 8 AM)" },
          
          // Other Options
          { value: "flexible", label: "⏳ Flexible / On-Demand Availability" },
          { value: "live_in_care", label: "🏡 Live-In Care (24/7 in-home support)" },
          { value: "24_7_care", label: "🕐 24/7 Care Availability" },
          { value: "around_clock_shifts", label: "🌅 Around-the-Clock Shifts (Multiple caregivers rotating)" },
          { value: "other", label: "✏️ Other (Custom shift — specify your hours)" }
        ],
        required: true,
        section: "availability"
      }
    ]
  },
  {
    id: "work_preferences",
    title: "💼 Work Preferences",
    description: "Tell us about your ideal work situation",
    questions: [
      {
        id: "work_type",
        text: "What type of work arrangement do you prefer?",
        type: "select",
        options: [
          { value: "full_time", label: "⏰ Full-time (35+ hours/week)" },
          { value: "part_time", label: "🕒 Part-time (15-34 hours/week)" },
          { value: "occasional", label: "📅 Occasional/As-needed" },
          { value: "live_in", label: "🏠 Live-in caregiver" },
          { value: "flexible", label: "⏳ Flexible" }
        ],
        required: true,
        section: "work_preferences"
      },
      {
        id: "expected_rate",
        text: "What is your expected hourly rate?",
        type: "select",
        options: [
          { value: "under_15", label: "Under $15/hour" },
          { value: "15_20", label: "$15-$20/hour" },
          { value: "20_25", label: "$20-$25/hour" },
          { value: "25_30", label: "$25-$30/hour" },
          { value: "30_plus", label: "$30+/hour" },
          { value: "negotiable", label: "Negotiable" }
        ],
        required: true,
        section: "work_preferences"
      },
      {
        id: "preferred_work_locations",
        text: "What areas are you willing to work in?",
        type: "textarea",
        required: true,
        section: "work_preferences",
        placeholder: "List neighborhoods, cities, or regions"
      }
    ]
  },
  {
    id: "background",
    title: "🔍 Background & Verification",
    description: "Help us verify your credentials",
    questions: [
      {
        id: "background_check",
        text: "Are you willing to undergo a background check?",
        type: "select",
        options: [
          { value: "yes", label: "✅ Yes" },
          { value: "no", label: "❌ No" },
          { value: "already_have", label: "📄 I already have a recent background check" }
        ],
        required: true,
        section: "background"
      },
      {
        id: "legally_authorized",
        text: "Are you legally authorized to work in Trinidad & Tobago?",
        type: "select",
        options: [
          { value: "yes", label: "✅ Yes" },
          { value: "no", label: "❌ No" },
          { value: "visa_pending", label: "⏳ Visa/Work Permit Pending" }
        ],
        required: true,
        section: "background"
      }
    ]
  },
  {
    id: "bio",
    title: "📝 About You",
    description: "Tell families a bit more about yourself",
    questions: [
      {
        id: "bio",
        text: "Write a brief bio about yourself as a caregiver",
        type: "textarea",
        required: true,
        section: "bio",
        placeholder: "Share your caregiving philosophy, experience, and what makes you special"
      },
      {
        id: "why_choose_caregiving",
        text: "Why did you choose caregiving as a profession?",
        type: "textarea",
        required: false,
        section: "bio",
        placeholder: "Share your motivation and passion for caregiving"
      }
    ]
  }
];

export const communityRegistrationFlow: RegistrationSection[] = [
  {
    id: "personal_info",
    title: "👋 About You",
    description: "Let's start with some basic information about you",
    questions: [
      {
        id: "full_name",
        text: "What's your full name?",
        type: "text",
        required: true,
        section: "personal_info",
        placeholder: "Your full name"
      },
      {
        id: "phone_number",
        text: "What's your phone number?",
        type: "tel",
        required: true,
        section: "personal_info",
        placeholder: "+1 (868) 123-4567",
        validationRegex: "^\\+?[0-9\\s\\(\\)\\-]{10,20}$",
        validationMessage: "Please enter a valid phone number"
      },
      {
        id: "location",
        text: "Where are you located?",
        type: "text",
        required: true,
        section: "personal_info",
        placeholder: "City/Town/Region"
      }
    ]
  },
  {
    id: "community_role",
    title: "🤝 Your Community Role",
    description: "Tell us how you'd like to contribute",
    questions: [
      {
        id: "community_roles",
        text: "How would you like to contribute to our community?",
        type: "multi-select",
        options: [
          { value: "volunteer", label: "🙋 Volunteer" },
          { value: "mentor", label: "👨‍🏫 Mentor" },
          { value: "resource_provider", label: "🛠️ Resource Provider" },
          { value: "tech_contributor", label: "💻 Technology Contributor" },
          { value: "community_organizer", label: "📋 Community Organizer" },
          { value: "educator", label: "📚 Educator/Trainer" },
          { value: "advocate", label: "🔊 Advocate" },
          { value: "other", label: "✏️ Other (please specify)" }
        ],
        required: true,
        section: "community_role"
      },
      {
        id: "contribution_interests",
        text: "What areas are you most interested in supporting?",
        type: "multi-select",
        options: [
          { value: "elder_care", label: "👵 Elder Care" },
          { value: "child_care", label: "👶 Child Care" },
          { value: "disability_support", label: "♿ Disability Support" },
          { value: "caregiver_support", label: "🤲 Caregiver Support" },
          { value: "health_education", label: "🩺 Health Education" },
          { value: "community_events", label: "🎉 Community Events" },
          { value: "resource_development", label: "📝 Resource Development" },
          { value: "technology_solutions", label: "💻 Technology Solutions" }
        ],
        required: true,
        section: "community_role"
      }
    ]
  },
  {
    id: "experience",
    title: "📚 Experience & Skills",
    description: "Tell us about your background",
    questions: [
      {
        id: "caregiving_experience",
        text: "Do you have any caregiving experience?",
        type: "select",
        options: [
          { value: "professional", label: "👩‍⚕️ Yes, professional experience" },
          { value: "personal", label: "👪 Yes, personal experience (family caregiver)" },
          { value: "both", label: "✅ Yes, both professional and personal" },
          { value: "none", label: "❌ No, but I'm interested in learning" }
        ],
        required: true,
        section: "experience"
      },
      {
        id: "tech_interests",
        text: "What technology areas interest you? (Optional)",
        type: "multi-select",
        options: [
          { value: "web_development", label: "🌐 Web Development" },
          { value: "mobile_apps", label: "📱 Mobile Apps" },
          { value: "data_analysis", label: "📊 Data Analysis" },
          { value: "design", label: "🎨 Design/UX" },
          { value: "social_media", label: "📣 Social Media" },
          { value: "content_creation", label: "✍️ Content Creation" },
          { value: "not_tech_focused", label: "🙂 Not technology focused" }
        ],
        required: false,
        section: "experience"
      }
    ]
  },
  {
    id: "involvement",
    title: "🗓️ Involvement",
    description: "Let us know about your availability",
    questions: [
      {
        id: "involvement_preferences",
        text: "How would you prefer to be involved?",
        type: "select",
        options: [
          { value: "regular", label: "📅 Regular scheduled commitment" },
          { value: "occasional", label: "🕒 Occasional events/projects" },
          { value: "remote", label: "💻 Remote/virtual contributions" },
          { value: "on_call", label: "📞 On-call as needed" },
          { value: "flexible", label: "⏳ Flexible" }
        ],
        required: true,
        section: "involvement"
      },
      {
        id: "communication_channels",
        text: "What's your preferred communication method?",
        type: "multi-select",
        options: [
          { value: "email", label: "📧 Email" },
          { value: "phone", label: "📞 Phone" },
          { value: "text", label: "💬 Text Message" },
          { value: "whatsapp", label: "📱 WhatsApp" },
          { value: "video_call", label: "🎥 Video Call" }
        ],
        required: true,
        section: "involvement"
      }
    ]
  },
  {
    id: "motivation",
    title: "💭 Your Motivation",
    description: "Help us understand why you want to join",
    questions: [
      {
        id: "community_motivation",
        text: "Why are you interested in joining our caregiving community?",
        type: "textarea",
        required: true,
        section: "motivation",
        placeholder: "Share what motivated you to get involved"
      },
      {
        id: "improvement_ideas",
        text: "Do you have any ideas for improving caregiving in your community? (Optional)",
        type: "textarea",
        required: false,
        section: "motivation",
        placeholder: "Share any thoughts or suggestions"
      }
    ]
  }
];

export type { RegistrationSection, RegistrationQuestion, RegistrationOption };
