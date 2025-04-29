
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { ensureUserProfile } from "@/lib/profile-utils";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const initialSteps = [
  { 
    id: 1, 
    title: "Complete your profile", 
    description: "Add your qualifications, experience, and preferences", 
    completed: false, 
    link: "/registration/professional",
    action: "complete" 
  },
  { 
    id: 2, 
    title: "Upload certifications", 
    description: "Share your professional certifications and required documents", 
    completed: false,
    link: "",
    action: "upload" 
  },
  { 
    id: 3, 
    title: "Set your availability", 
    description: "Let clients know when you're available for work", 
    completed: false,
    link: "",
    action: "availability" 
  },
  { 
    id: 4, 
    title: "Complete training", 
    description: "Learn essential caregiving techniques and protocols", 
    completed: false,
    link: "/professional/training-resources",
    action: "training" 
  },
  { 
    id: 5, 
    title: "Orientation and shadowing", 
    description: "Complete in-person orientation and care shadowing", 
    completed: false,
    link: "",
    action: "orientation" 
  }
];

export function useProfileHubData() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recoverAttempted, setRecoverAttempted] = useState(false);
  const [profileCreationAttempted, setProfileCreationAttempted] = useState(false);
  const [steps, setSteps] = useState(initialSteps);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [otherAvailability, setOtherAvailability] = useState("");
  
  const completedSteps = steps.filter(step => step.completed).length;
  const progress = Math.round((completedSteps / steps.length) * 100);
  
  const recoverOnboardingProgress = async (userId: string) => {
    if (recoverAttempted) return false;
    
    try {
      setRecoverAttempted(true);
      console.log("Attempting to recover onboarding progress for user:", userId);
      
      const progressData = initialSteps.reduce((acc, step) => {
        acc[step.id] = false;
        return acc;
      }, {} as Record<number, boolean>);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ onboarding_progress: progressData })
        .eq('id', userId);
      
      if (updateError) {
        console.error("Error updating profile with default onboarding progress:", updateError);
        return false;
      }
      
      console.log("Successfully recovered onboarding progress data");
      return true;
    } catch (err) {
      console.error("Error in recovery attempt:", err);
      return false;
    }
  };

  const createProfileIfNeeded = async (userId: string) => {
    if (profileCreationAttempted) return false;
    
    try {
      setProfileCreationAttempted(true);
      console.log("Attempting to create profile for user:", userId);
      
      const result = await ensureUserProfile(userId, 'professional');
      
      if (!result.success) {
        console.error("Error creating profile:", result.error);
        return false;
      }
      
      console.log("Successfully created or verified professional profile");
      return true;
    } catch (err) {
      console.error("Error in profile creation attempt:", err);
      return false;
    }
  };
  
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        await createProfileIfNeeded(user.id);
        
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profileError) {
          console.error("Profile fetch error:", profileError);
          throw profileError;
        }
        
        if (!data) {
          console.log("No profile found after creation attempt, this should not happen");
          setError("Unable to load profile data. Please try again or contact support.");
          setLoading(false);
          return;
        }
        
        setProfileData(data);
        
        if (data.onboarding_progress) {
          try {
            const updatedSteps = [...initialSteps];
            Object.keys(data.onboarding_progress).forEach(stepId => {
              const index = updatedSteps.findIndex(s => s.id === parseInt(stepId));
              if (index >= 0) {
                updatedSteps[index].completed = data.onboarding_progress[stepId];
              }
            });
            setSteps(updatedSteps);
          } catch (parseError) {
            console.error("Error parsing onboarding progress:", parseError);
            const success = await recoverOnboardingProgress(user.id);
            if (!success) {
              setSteps(initialSteps);
            }
          }
        } else {
          const success = await recoverOnboardingProgress(user.id);
          if (!success) {
            setSteps(initialSteps);
          }
        }
        
        if (data.availability) {
          setSelectedAvailability(Array.isArray(data.availability) ? data.availability : []);
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error("Error loading profile:", err);
        
        if (err.message && (
            err.message.includes("onboarding_progress") || 
            err.message.includes("column") || 
            err.message.includes("does not exist"))) {
          
          if (user && await recoverOnboardingProgress(user.id)) {
            loadProfileData();
            return;
          }
        }
        
        setError(`Failed to load profile data: ${err.message || "Unknown error"}. Please try again.`);
        setLoading(false);
      }
    };
    
    loadProfileData();
  }, [user]);
  
  useEffect(() => {
    if (!user && !loading) {
      toast.info("Authentication Required", {
        description: "Please log in to access your profile hub.",
      });
      navigate("/auth", { state: { returnPath: "/professional/profile" } });
    }
  }, [user, loading, navigate]);
  
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  return {
    user,
    profileData,
    loading,
    error,
    steps,
    setSteps,
    completedSteps,
    progress,
    selectedAvailability, 
    setSelectedAvailability,
    isAvailabilityModalOpen, 
    setIsAvailabilityModalOpen,
    otherAvailability, 
    setOtherAvailability,
    getInitials
  };
}
