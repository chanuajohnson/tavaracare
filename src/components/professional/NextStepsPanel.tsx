import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LazyCheckCircle2, 
  LazyCircle, 
  LazyList, 
  LazyArrowRight, 
  LazyClock, 
  LazyCalendar, 
  LazyLock,
  LazyHelpCircle, 
  LazyInfo 
} from "@/utils/lazyIcons";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SubscriptionFeatureLink } from "@/components/subscription/SubscriptionFeatureLink";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { CarePlanMetadata, OnboardingProgress } from "@/types/profile";
import { FadeIn } from '@/components/framer';

// Define the types for step status
type StepStatus = 'completed' | 'in_progress' | 'pending_admin' | 'scheduled' | 'not_started';

// Step definition interface
interface Step {
  id: number;
  title: string;
  description: string;
  status: StepStatus;
  link: string;
  isAdminControlled?: boolean;
  requiresPreviousStep?: boolean;
  visible: boolean;
  actionLabel?: string;
}

export const NextStepsPanel = () => {
  
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [steps, setSteps] = useState<Step[]>([
    { 
      id: 1, 
      title: "Complete your profile", 
      description: "Add your contact information and preferences", 
      status: 'not_started', 
      link: "/profile/family",
      visible: true,
      actionLabel: "Edit"
    },
    { 
      id: 2, 
      title: "Complete your loved one's care needs", 
      description: "Specify the types of care needed", 
      status: 'not_started', 
      link: "/careneeds/family",
      visible: true,
      actionLabel: "Edit"
    },
    { 
      id: 3, 
      title: "Complete your Loved One's Legacy Story", 
      description: "Add details about your care recipient's life story", 
      status: 'not_started', 
      link: "/family/story",
      visible: true,
      actionLabel: "Edit"
    },
    { 
      id: 4, 
      title: "Create New Care Plan", 
      description: "Create the plan that guides your loved one's care", 
      status: 'not_started', 
      link: "/family/care-management/create",
      visible: true,
      actionLabel: "Edit"
    },
    { 
      id: 5, 
      title: "Tavara Admin Site Visit", 
      description: "A Tavara Care coordinator will reach out to schedule a brief home or virtual visit.", 
      status: 'pending_admin', 
      link: "",
      isAdminControlled: true,
      requiresPreviousStep: true,
      visible: false,
      actionLabel: ""
    },
    { 
      id: 6, 
      title: "Assign Care Team", 
      description: "Assign available caregivers to shifts in your care plan", 
      status: 'not_started', 
      link: "/care-team/assign",
      requiresPreviousStep: true,
      visible: false,
      actionLabel: "Assign"
    },
    { 
      id: 7, 
      title: "Care Plan Active & In Execution", 
      description: "This step is activated by Tavara once your care plan is reviewed and ready to launch.", 
      status: 'pending_admin', 
      link: "",
      isAdminControlled: true,
      requiresPreviousStep: true,
      visible: false,
      actionLabel: ""
    }
  ]);

  // Get the actual completion status from the database
  useEffect(() => {
    const checkProfileStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log("Starting to fetch profile data for user:", user.id);
        setLoading(true);
        
        // Consolidated query to fetch all necessary data at once
        const [profileResponse, recipientProfileResponse, carePlansResponse, careTeamMembersResponse] = await Promise.all([
          supabase
            .from('profiles')
            .select('onboarding_progress')
            .eq('id', user.id)
            .single(),
          
          supabase
            .from('care_recipient_profiles')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle(),
            
          supabase
            .from('care_plans')
            .select('id, metadata')
            .eq('family_id', user.id)
            .order('created_at', { ascending: false }),
            
          supabase
            .from('care_team_members')
            .select('id')
            .eq('family_id', user.id)
            .limit(1)
        ]);
        
        if (profileResponse.error) {
          console.error("Error fetching profile data:", profileResponse.error);
          setError("Could not load profile data.");
          setLoading(false);
          return;
        }
        
        // Make a copy of steps to update
        const updatedSteps = [...steps];
        
        // Step 1: Profile is always completed if we're here
        updatedSteps[0].status = 'completed';
        
        // Get onboarding progress from profile data
        const onboardingProgress = profileResponse.data?.onboarding_progress as OnboardingProgress | null;
        console.log("Onboarding progress data:", onboardingProgress);
        
        // Step 2: Care needs step
        if (onboardingProgress?.completedSteps?.care_needs) {
          updatedSteps[1].status = 'completed';
        }
        
        // Step 3: Care recipient story
        if (onboardingProgress?.completedSteps?.care_recipient_story || recipientProfileResponse.data) {
          updatedSteps[2].status = 'completed';
        }
        
        // Get latest care plan
        const latestCarePlan = carePlansResponse.data && carePlansResponse.data.length > 0 ? carePlansResponse.data[0] : null;
        console.log("Latest care plan data:", latestCarePlan);
        
        // Step 4: Care plan creation
        let carePlanCreated = false;
        if (onboardingProgress?.completedSteps?.care_plan || latestCarePlan) {
          updatedSteps[3].status = 'completed';
          carePlanCreated = true;
        }
        
        // Only show site visit step if care plan is created
        if (carePlanCreated) {
          updatedSteps[4].visible = true;
          
          // Step 5: Tavara Admin Site Visit Status
          if (latestCarePlan?.metadata) {
            try {
              const metadata = latestCarePlan.metadata as CarePlanMetadata;
              const siteVisitStatus = metadata?.site_visit_status;
              
              if (siteVisitStatus === 'scheduled') {
                updatedSteps[4].status = 'scheduled';
              } else if (siteVisitStatus === 'completed') {
                updatedSteps[4].status = 'completed';
              } else {
                updatedSteps[4].status = 'pending_admin';
              }
            } catch (err) {
              console.error("Error processing site visit status:", err);
            }
          }
          
          // Only show care team assignment if care plan is created
          updatedSteps[5].visible = true;
          
          // Step 6: Care team assignment
          if (careTeamMembersResponse.data && careTeamMembersResponse.data.length > 0) {
            updatedSteps[5].status = 'completed';
          } else if (updatedSteps[4].status === 'completed') {
            // Mark as in_progress if site visit is completed
            updatedSteps[5].status = 'in_progress';
          }
          
          // Only show care plan activation if team is assigned or site visit is completed
          if (updatedSteps[5].status === 'completed' || updatedSteps[4].status === 'completed') {
            updatedSteps[6].visible = true;
            
            // Step 7: Care plan active status
            if (latestCarePlan?.metadata) {
              try {
                const metadata = latestCarePlan.metadata as CarePlanMetadata;
                const carePlanStatus = metadata?.care_plan_status;
                
                if (carePlanStatus === 'active') {
                  updatedSteps[6].status = 'completed';
                } else if (carePlanStatus === 'under_review') {
                  updatedSteps[6].status = 'in_progress';
                } else {
                  updatedSteps[6].status = 'pending_admin';
                }
              } catch (err) {
                console.error("Error processing care plan status:", err);
              }
            }
          }
        }
        
        console.log("Steps updated successfully, setting new state");
        setSteps(updatedSteps);
        setLoading(false);
      } catch (err) {
        console.error("Error checking profile status:", err);
        setError("Failed to load onboarding progress. Please refresh the page.");
        setLoading(false);
      }
    };
    
    checkProfileStatus();
    // Remove 'steps' from the dependency array to prevent infinite re-renders
  }, [user]);
  
  const visibleSteps = steps.filter(step => step.visible);
  const completedSteps = visibleSteps.filter(step => step.status === 'completed').length;
  const progress = visibleSteps.length > 0 ? Math.round((completedSteps / visibleSteps.length) * 100) : 0;

  // Render status icon based on step status
  const renderStatusIcon = (status: StepStatus) => {
    switch (status) {
      case 'completed':
        return <LazyCheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <LazyClock className="h-5 w-5 text-amber-500" />;
      case 'scheduled':
        return <LazyCalendar className="h-5 w-5 text-blue-500" />;
      case 'pending_admin':
        return <LazyLock className="h-5 w-5 text-purple-500" />;
      default:
        return <LazyCircle className="h-5 w-5 text-gray-300" />;
    }
  };
  
  // Get tooltip text for status type
  const getStatusTooltip = (status: StepStatus) => {
    switch (status) {
      case 'completed':
        return "Completed";
      case 'in_progress':
        return "In Progress";
      case 'scheduled':
        return "Scheduled";
      case 'pending_admin':
        return "Awaiting Tavara Admin";
      default:
        return "Not Started";
    }
  };

  if (loading) {
    console.log("FamilyNextStepsPanel is in loading state");
    return (
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <LazyList className="h-5 w-5 text-primary" />
            Next Steps
          </CardTitle>
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-40" />
            <div className="flex items-center space-x-1">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-2 w-24 rounded-full" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {[1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="flex items-start gap-3 mb-4">
              <Skeleton className="h-5 w-5 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-3/4 mb-1" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
          <Skeleton className="h-10 w-full mt-4" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.log("FamilyNextStepsPanel encountered an error:", error);
    return (
      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <LazyList className="h-5 w-5 text-red-500" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <LazyHelpCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
          <p className="text-red-500 mb-2">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </CardContent>
      </Card>
    );
  }

  console.log("FamilyNextStepsPanel rendering successfully with steps:", visibleSteps);
  return (
    <FadeIn
      className="mb-8"
      delay={0.2}
      duration={0.5}
    >
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <LazyList className="h-5 w-5 text-primary" />
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
            {steps.filter(step => step.visible).map((step) => (
              <li key={step.id} className="flex items-start gap-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="mt-0.5">
                        {renderStatusIcon(step.status)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{getStatusTooltip(step.status)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className={`font-medium ${step.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                      {step.title}
                      {step.isAdminControlled && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <LazyInfo className="inline-block ml-1 h-4 w-4 text-blue-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">This step requires action from a Tavara administrator.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </p>
                    {step.status !== 'completed' && (
                      <div className="flex items-center text-xs text-gray-500 gap-1">
                        {step.status === 'scheduled' && (
                          <>
                            <LazyCalendar className="h-3 w-3 text-blue-500" />
                            <span>Scheduled</span>
                          </>
                        )}
                        {step.status === 'in_progress' && (
                          <>
                            <LazyClock className="h-3 w-3 text-amber-500" />
                            <span>In Progress</span>
                          </>
                        )}
                        {step.status === 'pending_admin' && (
                          <>
                            <LazyLock className="h-3 w-3 text-purple-500" />
                            <span>Admin Action Required</span>
                          </>
                        )}
                        {step.status === 'not_started' && (
                          <>
                            <LazyClock className="h-3 w-3" />
                            <span>Pending</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>

                {/* Only show action button for editable steps */}
                {step.link && step.actionLabel && (step.status === 'completed' || !step.isAdminControlled) && (
                  <Link to={step.link}>
                    <Button variant="ghost" size="sm" className="p-0 h-6 text-primary hover:text-primary-600">
                      {step.actionLabel}
                      <LazyArrowRight className="ml-1 h-3 w-3" />
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
                <LazyArrowRight className="h-4 w-4" />
              </span>
            </SubscriptionFeatureLink>
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
};
