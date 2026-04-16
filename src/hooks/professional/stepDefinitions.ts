import { ProfessionalStep } from './types';
import { getMissingDocumentTypes } from './completionCheckers';

export const baseSteps = [
  { 
    id: 1, 
    title: "Create your account", 
    description: "Set up your Tavara professional account", 
    link: "/auth",
    category: "account",
    stage: "foundation",
    isInteractive: false
  },
  { 
    id: 2, 
    title: "Edit your professional registration", 
    description: "Add your experience, certifications, and specialties", 
    link: "/registration/professional",
    category: "profile",
    stage: "foundation",
    isInteractive: true
  },
  { 
    id: 3, 
    title: "Set your availability preferences", 
    description: "Configure your work schedule and location preferences", 
    link: "/registration/professional?scroll=availability&edit=true",
    category: "availability",
    stage: "foundation",
    isInteractive: true
  },
  { 
    id: 4, 
    title: "Upload certifications & documents", 
    description: "Verify your credentials and background", 
    link: "/professional/profile?tab=documents",
    category: "documents",
    stage: "qualification",
    isInteractive: true
  },
  { 
    id: 5, 
    title: "Submit 2 professional references", 
    description: "Provide references from previous employers or colleagues", 
    link: "/professional/profile?tab=references",
    category: "references",
    stage: "vetting",
    isInteractive: true
  },
  { 
    id: 6, 
    title: "Head nurse screening interview", 
    description: "Complete a brief interview with our Head Nurse for final clearance", 
    link: "/professional/screening",
    category: "screening",
    stage: "vetting",
    isInteractive: false
  },
  { 
    id: 7, 
    title: "Match with Tavara Families", 
    description: "Get matched with families and begin your caregiving journey", 
    link: "/dashboard/professional#family-matches",
    category: "assignments",
    stage: "active",
    isInteractive: false
  },
  { 
    id: 8, 
    title: "Complete training modules", 
    description: "Enhance your skills with our professional development courses", 
    link: "/professional/training",
    category: "training",
    stage: "training",
    isInteractive: true
  },
  {
    id: 9,
    title: "Care Environment Awareness",
    description: "Understand the family's home readiness process and your role in supporting a safe care environment",
    link: "/professional/profile?tab=onboarding#care_environment_awareness",
    category: "care_environment_awareness",
    stage: "active",
    isInteractive: true
  }
];

export const getDocumentNavigationLink = (hasDocuments: boolean): string => {
  const baseUrl = "/professional/profile?tab=documents";
  if (hasDocuments) {
    return `${baseUrl}#manage-documents`;
  } else {
    return `${baseUrl}#upload-documents`;
  }
};

export const getProfessionalRegistrationLink = (isCompleted: boolean): string => {
  if (isCompleted) {
    return "/registration/professional?scroll=firstName&edit=true";
  } else {
    return "/registration/professional";
  }
};

export const getButtonText = (step: typeof baseSteps[0], completed: boolean, accessible: boolean, hasDocuments?: boolean, documents?: any[], hasPendingSessions?: boolean): string => {
  if (!accessible) {
    return "🔒 Locked";
  }
  
  if (completed) {
    switch (step.id) {
      case 1: return "✓ Account Created";
      case 2: return "✓ Edit Profile";
      case 3: return "Edit Availability";
      case 4: 
        if (hasDocuments) {
          return "Manage Documents";
        } else {
          const missingTypes = documents ? getMissingDocumentTypes(documents) : [];
          if (missingTypes.length > 0) {
            return `Upload Missing: ${missingTypes.join(', ')}`;
          }
          return "View Documents";
        }
      case 5: return "✓ References Submitted";
      case 6: return "✓ Screening Complete";
      case 7: return "View Family Matches";
      case 8: return "Continue Training";
      case 9: return "✓ Acknowledged";
      default: return "✓ Complete";
    }
  }
  
  // Step 6: show "Continue Screening" if there are pending/in-progress sessions
  if (step.id === 6 && hasPendingSessions) {
    return "Continue Screening →";
  }
  
  switch (step.id) {
    case 1: return "Complete Setup";
    case 2: return "Complete Profile";
    case 3: return "Set Availability";
    case 4: 
      const missingTypes = documents ? getMissingDocumentTypes(documents) : [];
      if (missingTypes.length > 0) {
        return `Upload Required: ${missingTypes.join(', ')}`;
      }
      return "Upload Documents";
    case 5: return "Add References";
    case 6: return "Awaiting Screening";
    case 7: return "View Family Matches";
    case 8: return "Start Training";
    case 9: return "Review Briefing";
    default: return "Complete";
  }
};
