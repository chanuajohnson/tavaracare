
import { ProfessionalStep } from './types';

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
    title: "Complete your professional profile", 
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
    title: "Match with Tavara Families", 
    description: "Get matched with families and begin your caregiving journey", 
    link: "/dashboard/professional#family-matches",
    category: "assignments",
    stage: "active",
    isInteractive: false
  },
  { 
    id: 6, 
    title: "Complete training modules", 
    description: "Enhance your skills with our professional development courses", 
    link: "/professional/training",
    category: "training",
    stage: "training",
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

export const getButtonText = (step: typeof baseSteps[0], completed: boolean, accessible: boolean, hasDocuments?: boolean): string => {
  if (!accessible) {
    return "🔒 Locked";
  }
  
  if (completed) {
    switch (step.id) {
      case 1: return "✓ Account Created";
      case 2: return "✓ Profile Complete";
      case 3: return "Edit Availability";
      case 4: return hasDocuments ? "Manage Documents" : "View Documents";
      case 5: return "View Family Matches";
      case 6: return "Continue Training";
      default: return "✓ Complete";
    }
  }
  
  switch (step.id) {
    case 1: return "Complete Setup";
    case 2: return "Complete Profile";
    case 3: return "Set Availability";
    case 4: return "Upload Documents";
    case 5: return "View Family Matches";
    case 6: return "Start Training";
    default: return "Complete";
  }
};
