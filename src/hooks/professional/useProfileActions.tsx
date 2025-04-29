
import React from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useTracking } from "@/hooks/useTracking";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { ChevronRight } from "lucide-react";

// Define a Step interface for better type safety
export interface Step {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  link: string;
  action: string;
}

export function useProfileActions() {
  const { user } = useAuth();
  const { trackEngagement } = useTracking();
  const { toast: toastHook } = useToast();

  const handleUploadCertificates = (steps: Step[], setSteps: (steps: Step[]) => void) => {
    trackEngagement('upload_documents_click', { section: 'profile_hub' });
    
    const updatedSteps = [...steps];
    const index = updatedSteps.findIndex(s => s.id === 2);
    if (index >= 0 && !updatedSteps[index].completed) {
      updatedSteps[index].completed = true;
      setSteps(updatedSteps);
      
      if (user) {
        const progressData = updatedSteps.reduce((acc, step) => {
          acc[step.id] = step.completed;
          return acc;
        }, {} as Record<number, boolean>);
        
        supabase
          .from('profiles')
          .update({ onboarding_progress: progressData })
          .eq('id', user.id)
          .then(({ error }) => {
            if (error) console.error("Error updating progress:", error);
          });
      }
      
      const completedSteps = updatedSteps.filter(step => step.completed).length;
      trackEngagement('onboarding_step_complete', { 
        step: 'certificates',
        progress_percent: Math.round((completedSteps / steps.length) * 100)
      });
    }
    
    toast.info("📩 Submit Your Documents", {
      description: "Please email or WhatsApp your documents, including certifications, ID, and Certificate of Character.",
      action: {
        label: "View Contact",
        onClick: () => {
          window.open("mailto:chanuajohnson@gmail.com", "_blank");
        }
      },
      duration: 5000,
    });
  };

  const saveAvailability = async (
    selectedAvailability: string[], 
    otherAvailability: string, 
    steps: Step[], 
    setSteps: (steps: Step[]) => void,
    setIsAvailabilityModalOpen: (open: boolean) => void
  ) => {
    if (selectedAvailability.length === 0 && !otherAvailability) {
      toastHook({
        title: "Please select at least one option",
        description: "Choose when you're available to work",
        variant: "destructive",
      });
      return;
    }

    const finalAvailability = [...selectedAvailability];
    if (otherAvailability) {
      finalAvailability.push(`Other: ${otherAvailability}`);
    }
    
    const updatedSteps = [...steps];
    const index = updatedSteps.findIndex(s => s.id === 3);
    if (index >= 0) {
      updatedSteps[index].completed = true;
      setSteps(updatedSteps);
      
      const completedSteps = updatedSteps.filter(step => step.completed).length;
      trackEngagement('onboarding_step_complete', { 
        step: 'availability',
        progress_percent: Math.round((completedSteps / steps.length) * 100)
      });
    }

    setIsAvailabilityModalOpen(false);
    
    if (user) {
      const progressData = updatedSteps.reduce((acc, step) => {
        acc[step.id] = step.completed;
        return acc;
      }, {} as Record<number, boolean>);
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          onboarding_progress: progressData,
          availability: finalAvailability
        })
        .eq('id', user.id);
      
      if (error) {
        console.error("Error saving availability:", error);
        toastHook({
          title: "Error saving availability",
          description: "Please try again later.",
          variant: "destructive",
        });
        return;
      }
    }
    
    toast.success("Availability saved", {
      description: "Your availability preferences have been saved.",
    });
  };

  const renderActionButton = (
    step: Step, 
    steps: Step[], 
    setSteps: (steps: Step[]) => void,
    setIsAvailabilityModalOpen: (open: boolean) => void
  ) => {
    if (step.completed) return null;
    
    switch (step.action) {
      case "upload":
        return (
          <button 
            className="p-0 h-6 text-primary hover:text-primary-600 bg-transparent border-0 font-medium text-sm flex items-center cursor-pointer"
            onClick={() => handleUploadCertificates(steps, setSteps)}
          >
            Upload
            <ChevronRight className="ml-1 h-3 w-3" />
          </button>
        );
      
      case "availability":
        return (
          <button 
            className="p-0 h-6 text-primary hover:text-primary-600 bg-transparent border-0 font-medium text-sm flex items-center cursor-pointer" 
            onClick={() => setIsAvailabilityModalOpen(true)}
          >
            Set
            <ChevronRight className="ml-1 h-3 w-3" />
          </button>
        );
      
      case "orientation":
        return null; // Admin controlled
      
      case "training":
      case "complete":
      default:
        return (
          <a 
            href={step.link} 
            className="p-0 h-6 text-primary hover:text-primary-600 bg-transparent border-0 font-medium text-sm flex items-center cursor-pointer"
          >
            Complete
            <ChevronRight className="ml-1 h-3 w-3" />
          </a>
        );
    }
  };

  return {
    handleUploadCertificates,
    saveAvailability,
    renderActionButton
  };
}
