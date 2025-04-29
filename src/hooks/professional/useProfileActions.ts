
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useTracking } from "@/hooks/useTracking";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

export function useProfileActions() {
  const { user } = useAuth();
  const { trackEngagement } = useTracking();
  const { toast: toastHook } = useToast();

  const handleUploadCertificates = (steps: any[], setSteps: (steps: any[]) => void) => {
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
    steps: any[], 
    setSteps: (steps: any[]) => void,
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
    step: { 
      id: number; 
      title: string; 
      description: string; 
      completed: boolean; 
      link: string; 
      action: string; 
    }, 
    steps: any[], 
    setSteps: (steps: any[]) => void,
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
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="ml-1 h-3 w-3"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        );
      
      case "availability":
        return (
          <button 
            className="p-0 h-6 text-primary hover:text-primary-600 bg-transparent border-0 font-medium text-sm flex items-center cursor-pointer" 
            onClick={() => setIsAvailabilityModalOpen(true)}
          >
            Set
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="ml-1 h-3 w-3"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
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
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="ml-1 h-3 w-3"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
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
