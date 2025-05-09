
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, List, ArrowRight, Clock, Edit, PenSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SubscriptionFeatureLink } from "@/components/subscription/SubscriptionFeatureLink";
import { supabase } from "@/lib/supabase";

// Type for onboarding progress structure
interface OnboardingProgress {
  currentStep?: string;
  completedSteps?: {
    care_needs?: boolean;
    [key: string]: boolean | undefined;
  };
}

export const FamilyNextStepsPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [steps, setSteps] = useState([
    { 
      id: 1, 
      title: "Complete your profile", 
      description: "Add your contact information and preferences", 
      completed: false, 
      link: "/registration/family",
      buttonText: "Complete"
    },
    { 
      id: 2, 
      title: "Complete your loved one's Care Needs", 
      description: "Help us understand specific care requirements", 
      completed: false, 
      link: "/careneeds/family",
      buttonText: "Complete"
    },
    { 
      id: 3, 
      title: "Tell Your Loved One's Legacy Story", 
      description: "Share their life story to help caregivers connect better", 
      completed: false, 
      link: "/family/legacy-stories",
      buttonText: "Complete"
    },
    { 
      id: 4, 
      title: "Connect with caregivers", 
      description: "Start building your care team", 
      completed: false, 
      link: "/family/caregiver-matching",
      buttonText: "Connect"
    }
  ]);

  // Check profile status including care needs and legacy stories
  useEffect(() => {
    const checkProfileStatus = async () => {
      if (!user?.id) return;

      try {
        // Get profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          return;
        }
        
        // Check if legacy story exists
        const { data: storyData, error: storyError } = await supabase
          .from('care_recipient_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (storyError && !storyError.message.includes('No rows found')) {
          console.error("Error checking legacy story:", storyError);
        }
        
        const hasLegacyStory = !!storyData;
        
        // Safely check onboarding progress
        const onboardingProgress = profileData?.onboarding_progress as OnboardingProgress | null;
        const careNeedsComplete = !!onboardingProgress?.completedSteps?.care_needs;
        
        const updatedSteps = [...steps];
        
        // Mark steps as completed based on actual data
        if (profileData) {
          // Step 1: Profile completed if basic info exists
          const profileComplete = !!(profileData.full_name || (profileData.first_name && profileData.last_name));
          updatedSteps[0].completed = profileComplete;
          updatedSteps[0].buttonText = profileComplete ? "Edit" : "Complete";
          
          // Step 2: Care needs
          updatedSteps[1].completed = careNeedsComplete;
          updatedSteps[1].buttonText = careNeedsComplete ? "Edit" : "Complete";
          
          // Step 3: Legacy story
          updatedSteps[2].completed = hasLegacyStory;
          updatedSteps[2].buttonText = hasLegacyStory ? "Edit" : "Complete";
        }
        
        setSteps(updatedSteps);
      } catch (error) {
        console.error("Error checking profile status:", error);
      }
    };
    
    checkProfileStatus();
  }, [user, steps]);

  const completedSteps = steps.filter(step => step.completed).length;
  const progress = Math.round((completedSteps / steps.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <List className="h-5 w-5 text-primary" />
            Next Steps
          </CardTitle>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">Your care coordination progress</p>
            <div className="flex items-center space-x-1">
              <p className="text-sm font-medium">{progress}%</p>
              <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {steps.map((step) => (
              <li key={step.id} className="flex items-start gap-3">
                <div className="mt-0.5">
                  {step.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className={`font-medium ${step.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                      {step.title}
                    </p>
                    {!step.completed && (
                      <div className="flex items-center text-xs text-gray-500 gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Pending</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
                <Link to={step.link}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-0 h-6 text-primary hover:text-primary-600"
                  >
                    {step.buttonText}
                    {step.buttonText === "Edit" ? (
                      <PenSquare className="ml-1 h-3 w-3" />
                    ) : (
                      <ArrowRight className="ml-1 h-3 w-3" />
                    )}
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="mt-4">
            <SubscriptionFeatureLink
              featureType="All Tasks View" 
              returnPath="/dashboard/family"
              referringPagePath="/dashboard/family"
              referringPageLabel="Family Dashboard"
              className="w-full"
            >
              <span className="flex justify-between items-center w-full">
                <span>View all tasks</span>
                <ArrowRight className="h-4 w-4" />
              </span>
            </SubscriptionFeatureLink>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
