
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface ProfessionalStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  link: string;
  buttonText?: string;
  action?: () => void;
  stage: string;
  category: string;
}

interface ProfessionalProgressData {
  steps: ProfessionalStep[];
  completionPercentage: number;
  nextStep?: ProfessionalStep;
  currentStage: string;
  completedSteps: number;
  totalSteps: number;
  loading: boolean;
  verificationStatus?: string;
}

export const useProfessionalProgress = (): ProfessionalProgressData => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<string>('not_started');
  const [steps, setSteps] = useState<ProfessionalStep[]>([
    { 
      id: 1, 
      title: "Create your account", 
      description: "Set up your Tavara professional account", 
      completed: true, // Always completed if user exists
      link: "/auth",
      stage: "foundation",
      category: "account"
    },
    { 
      id: 2, 
      title: "Complete your professional profile", 
      description: "Add your experience, certifications, and specialties", 
      completed: false, 
      link: "/registration/professional",
      stage: "foundation",
      category: "profile"
    },
    { 
      id: 3, 
      title: "Upload certifications & documents", 
      description: "Verify your credentials and background", 
      completed: false, 
      link: "/professional/profile?tab=documents",
      stage: "qualification",
      category: "documents"
    },
    { 
      id: 4, 
      title: "Submit Certificate of Character", 
      description: "Upload your background check from Trinidad & Tobago Police", 
      completed: false, 
      link: "/professional/profile?tab=documents",
      stage: "qualification",
      category: "background_check"
    },
    { 
      id: 5, 
      title: "Set your availability preferences", 
      description: "Configure your work schedule and location preferences", 
      completed: false, 
      link: "/professional/profile?tab=availability",
      stage: "matching",
      category: "availability"
    },
    { 
      id: 6, 
      title: "Complete training modules", 
      description: "Enhance your skills with our professional development courses", 
      completed: false, 
      link: "/professional/training",
      stage: "qualification",
      category: "training"
    },
    { 
      id: 7, 
      title: "Get verified and start receiving assignments", 
      description: "Earn your verification badge and begin your caregiving journey", 
      completed: false, 
      link: "/professional/profile?tab=assignments",
      stage: "active",
      category: "assignments"
    }
  ]);

  const handleStepAction = (step: ProfessionalStep) => {
    navigate(step.link);
  };

  const getButtonText = (step: ProfessionalStep) => {
    if (step.completed) {
      if (step.id === 1) return "✓ Account Created";
      if (step.id === 2) return "View Profile";
      if (step.id === 3) return "View Documents";
      if (step.id === 4) return verificationStatus === 'verified' ? "✓ Verified" : "View Status";
      if (step.id === 5) return "Edit Availability";
      if (step.id === 6) return "Continue Training";
      if (step.id === 7) return "View Assignments";
      return "✓ Complete";
    }
    
    if (step.id === 1) return "Complete Setup";
    if (step.id === 2) return "Complete Profile";
    if (step.id === 3) return "Upload Documents";
    if (step.id === 4) return "Upload Certificate";
    if (step.id === 5) return "Set Availability";
    if (step.id === 6) return "Start Training";
    if (step.id === 7) return "Get Verified";
    
    return "Complete";
  };

  const checkStepCompletion = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Check user profile completion - enhanced checks
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      // Check for uploaded documents
      const { data: documents } = await supabase
        .from('professional_documents')
        .select('id, document_type, verification_status')
        .eq('user_id', user.id);

      // Handle the case where new columns might not exist yet
      const profileData = profile || {};
      const docsData = documents || [];

      // Check for background check documents specifically
      const backgroundCheckDocs = docsData.filter((doc: any) => doc.document_type === 'background_check');
      const hasVerifiedBackgroundCheck = backgroundCheckDocs.some((doc: any) => 
        (doc as any).verification_status === 'verified'
      );
      const hasBackgroundCheckDoc = backgroundCheckDocs.length > 0;

      // Use fallback for background_check_status if column doesn't exist yet
      const backgroundCheckStatus = (profileData as any).background_check_status || 'not_started';
      setVerificationStatus(backgroundCheckStatus);

      const updatedSteps = steps.map(step => ({
        ...step,
        action: () => handleStepAction(step),
        buttonText: getButtonText(step)
      }));
      
      // Step 1: Account creation - always completed if user exists
      updatedSteps[0].completed = true;
      
      // Step 2: Complete professional profile - check if professional details are filled
      if (profileData && (profileData as any).professional_type && (profileData as any).years_of_experience) {
        updatedSteps[1].completed = true;
      }
      
      // Step 3: Upload documents - check if any non-background check documents exist
      const otherDocs = docsData.filter((doc: any) => doc.document_type !== 'background_check');
      if (otherDocs.length > 0) {
        updatedSteps[2].completed = true;
      }
      
      // Step 4: Background check - check if background check document uploaded
      if (hasBackgroundCheckDoc) {
        updatedSteps[3].completed = true;
      }
      
      // Step 5: Availability - check if availability is set
      if (profileData && (profileData as any).availability && (profileData as any).availability.length > 0) {
        updatedSteps[4].completed = true;
      }
      
      // Step 6: Training modules - check if professional_type is set and certifications exist
      if (profileData && (profileData as any).professional_type && (profileData as any).certifications && (profileData as any).certifications.length > 0) {
        updatedSteps[5].completed = true;
      }
      
      // Step 7: Verified and assignments - check if background check is verified
      if (hasVerifiedBackgroundCheck) {
        updatedSteps[6].completed = true;
      }
      
      setSteps(updatedSteps);
    } catch (error) {
      console.error("Error checking professional progress:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkStepCompletion();
    }
  }, [user]);

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);
  const nextStep = steps.find(step => !step.completed);

  // Determine current stage based on completed steps
  const getCurrentStage = () => {
    if (completionPercentage === 100) return 'active';
    if (completedSteps >= 5) return 'matching';
    if (completedSteps >= 2) return 'qualification';
    return 'foundation';
  };

  return {
    steps,
    completionPercentage,
    nextStep,
    currentStage: getCurrentStage(),
    completedSteps,
    totalSteps,
    loading,
    verificationStatus
  };
};
