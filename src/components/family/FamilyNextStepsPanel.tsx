
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, List, ArrowRight, Clock } from "lucide-react";
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
    care_plan?: boolean;
    care_recipient_story?: boolean;
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
      link: "/registration/family" 
    },
    { 
      id: 2, 
      title: "Complete your loved one's care needs", 
      description: "Specify the types of care needed", 
      completed: false, 
      link: "/careneeds/family" 
    },
    { 
      id: 3, 
      title: "Complete your Loved One's Legacy Story", 
      description: "Add details about your care recipient's life story", 
      completed: false, 
      link: "/family/story" 
    },
    { 
      id: 4, 
      title: "Complete initial care assessment", 
      description: "Help us understand your care needs better", 
      completed: false, 
      link: "/family/features-overview" 
    },
    { 
      id: 5, 
      title: "Connect with caregivers", 
      description: "Start building your care team", 
      completed: false, 
      link: "/family/features-overview" 
    }
  ]);

  // Get the actual completion status from the database
  useEffect(() => {
    const checkProfileStatus = async () => {
      if (!user) return;

      try {
        // Get profile data from Supabase
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('onboarding_progress')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error("Error fetching profile data:", error);
          return;
        }
        
        const updatedSteps = [...steps];
        
        // Mark first step as completed if user exists
        updatedSteps[0].completed = true;
        
        // Get onboarding progress from profile data
        const onboardingProgress = profileData?.onboarding_progress as OnboardingProgress | null;
        
        // Mark care needs step as completed based on database status
        if (onboardingProgress?.completedSteps?.care_needs) {
          updatedSteps[1].completed = true;
        }
        
        // Check if user has created care recipient story
        if (onboardingProgress?.completedSteps?.care_recipient_story) {
          updatedSteps[2].completed = true;
        } else {
          // Check if care recipient profile exists as another way to verify the story
          const { data: recipientProfile } = await supabase
            .from('care_recipient_profiles')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();
            
          updatedSteps[2].completed = !!recipientProfile;
        }
        
        // Check if there are any care plans created
        if (onboardingProgress?.completedSteps?.care_plan) {
          updatedSteps[3].completed = true;
        } else {
          const { data: carePlans } = await supabase
            .from('care_plans')
            .select('id')
            .eq('family_id', user.id)
            .limit(1);
            
          updatedSteps[3].completed = carePlans && carePlans.length > 0;
        }
        
        // Check if care team members exist
        const { data: careTeamMembers } = await supabase
          .from('care_team_members')
          .select('id')
          .eq('family_id', user.id)
          .limit(1);
          
        updatedSteps[4].completed = careTeamMembers && careTeamMembers.length > 0;
        
        setSteps(updatedSteps);
      } catch (err) {
        console.error("Error checking profile status:", err);
      }
    };
    
    checkProfileStatus();
  }, [user]);

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
                {/* Modified condition to show button for steps 1, 2, and 3 regardless of completion status */}
                {(!step.completed || step.id === 1 || step.id === 2 || step.id === 3) && (
                  <Link to={step.link}>
                    <Button variant="ghost" size="sm" className="p-0 h-6 text-primary hover:text-primary-600">
                      {(step.id === 1 || step.id === 2 || step.id === 3) && step.completed ? "Edit" : "Complete"}
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                )}
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
