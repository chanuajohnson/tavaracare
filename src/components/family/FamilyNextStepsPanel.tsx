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
import { ScheduleVisitModal } from "./ScheduleVisitModal";
import { useUserCarePlan } from "@/hooks/useUserCarePlan";

export const FamilyNextStepsPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { carePlanId, loading: carePlanLoading } = useUserCarePlan();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
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
      title: "Complete initial care assessment", 
      description: "Help us understand your care needs better", 
      completed: false, 
      link: "/family/care-assessment" 
    },
    { 
      id: 3, 
      title: "Complete your loved one's Legacy Story", 
      description: "Because care is more than tasks — our Legacy Story feature honors the voices, memories, and wisdom of those we care for.", 
      completed: false, 
      link: "/family/story" 
    },
    { 
      id: 4, 
      title: "See your instant caregiver matches", 
      description: "Now that your loved one's profile is complete unlock personalized caregiver recommendations.", 
      completed: false, 
      link: "/caregiver/matching" 
    },
    { 
      id: 5, 
      title: "Set up medication management", 
      description: "Add medications and set up schedules for your care plan", 
      completed: false, 
      link: "/family/care-management" 
    },
    { 
      id: 6, 
      title: "Set up meal management", 
      description: "Plan meals and create grocery lists for your care plan", 
      completed: false, 
      link: "/family/care-management" 
    },
    { 
      id: 7, 
      title: "Schedule your Visit", 
      description: "Ready to meet your care coordinator? Send us a message to schedule.", 
      completed: false, 
      link: "/family/schedule-visit" 
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [carePlans, setCarePlans] = useState([]);

  useEffect(() => {
    if (user) {
      checkStepCompletion();
    }
  }, [user]);

  const checkStepCompletion = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Check if care assessment is completed
      const { data: careAssessment } = await supabase
        .from('care_needs_family')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle();

      // Check if care recipient profile exists
      const { data: careRecipient } = await supabase
        .from('care_recipient_profiles')
        .select('id, full_name, life_story')
        .eq('user_id', user.id)
        .maybeSingle();

      // Check user profile completion from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone_number, address, care_types')
        .eq('id', user.id)
        .maybeSingle();

      // Check for care plans
      const { data: carePlansData } = await supabase
        .from('care_plans')
        .select('id, title')
        .eq('family_id', user.id);

      console.log('Care plans found:', carePlansData);
      setCarePlans(carePlansData || []);

      // Check for medications
      const { data: medications } = await supabase
        .from('medications')
        .select('id')
        .in('care_plan_id', (carePlansData || []).map(cp => cp.id));

      // Check for meal plans
      const { data: mealPlans } = await supabase
        .from('meal_plans')
        .select('id')
        .in('care_plan_id', (carePlansData || []).map(cp => cp.id));

      const updatedSteps = [...steps];
      
      // Mark first step as completed if user exists and has basic info
      if (user && profile?.full_name) {
        updatedSteps[0].completed = true;
      }
      
      // Mark second step (care assessment) as completed if care assessment exists
      if (careAssessment) {
        updatedSteps[1].completed = true;
      }
      
      // Mark third step (Legacy Story) as completed if care recipient profile exists with meaningful data
      if (careRecipient && careRecipient.full_name) {
        updatedSteps[2].completed = true;
      }
      
      // Mark fourth step (care recipient profile) as completed if care recipient profile exists
      if (careRecipient) {
        updatedSteps[3].completed = true;
      }
      
      // Mark fifth step (medication management) as completed if medications exist
      if (medications && medications.length > 0) {
        updatedSteps[4].completed = true;
      }
      
      // Mark sixth step (meal management) as completed if meal plans exist
      if (mealPlans && mealPlans.length > 0) {
        updatedSteps[5].completed = true;
      }
      
      // Note: Step 7 will be checked once that feature is implemented
      
      setSteps(updatedSteps);
    } catch (error) {
      console.error("Error checking step completion:", error);
    } finally {
      setLoading(false);
    }
  };

  const completedSteps = steps.filter(step => step.completed).length;
  const progress = Math.round((completedSteps / steps.length) * 100);

  // Check if first three steps are completed for step 4 access
  const canAccessMatching = steps[0]?.completed && steps[1]?.completed && steps[2]?.completed;

  const getButtonText = (step: any) => {
    if (step.id === 4) {
      if (!canAccessMatching) {
        return "Complete Above Steps to View";
      }
      return step.completed ? "View Matches" : "View Matches";
    }
    
    if (step.id === 5) {
      return step.completed ? "Edit Medications" : "Start Medication Setup";
    }
    
    if (step.id === 6) {
      return step.completed ? "Edit Meal Plans" : "Start Meal Planning";
    }
    
    if (step.id === 7) {
      return "Schedule your Visit";
    }
    
    if (step.completed) {
      if (step.id === 1) {
        return "Edit Registration Form";
      } else if (step.id === 2) {
        return "Edit Assessment";
      } else if (step.id === 3) {
        return "Edit Legacy Story";
      }
      return "Edit";
    }
    return step.id === 2 ? "Start Assessment" : "Complete";
  };

  const getButtonIcon = (step: any) => {
    return <ArrowRight className="ml-1 h-3 w-3" />;
  };

  const openWhatsApp = () => {
    const phoneNumber = "8687865357";
    const message = "I am ready to schedule my initial site visit with matched nurses";
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleStepClick = (step: any) => {
    if (step.id === 4 && !canAccessMatching) {
      return;
    }
    if (step.id === 5) {
      // Navigate to medication management using dynamic care plan ID
      if (carePlanId) {
        navigate(`/family/care-management/${carePlanId}/medications`);
      } else {
        navigate('/family/care-management');
      }
      return;
    }
    if (step.id === 6) {
      // Navigate to meal management using dynamic care plan ID
      if (carePlanId) {
        navigate(`/family/care-management/${carePlanId}/meals`);
      } else {
        navigate('/family/care-management');
      }
      return;
    }
    if (step.id === 7) {
      setShowScheduleModal(true);
      return;
    }
    navigate(step.link);
  };

  if (loading || carePlanLoading) {
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
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading progress...</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <>
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
              Your Care Journey Progress
            </CardTitle>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">Complete these steps to get matched with the right caregiver</p>
              <div className="flex items-center space-x-1">
                <p className="text-sm font-medium">{progress}%</p>
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-300" 
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
                  {(step.id === 4 || step.id === 6 || step.id === 5 || step.id === 7) ? (
                    <Button 
                      variant={step.completed ? "outline" : "ghost"} 
                      size="sm" 
                      className={`p-0 h-6 ${
                        step.id === 4 && !canAccessMatching 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : step.completed 
                            ? 'text-blue-600 hover:text-blue-700' 
                            : 'text-primary hover:text-primary-600'
                    }`}
                    disabled={step.id === 4 && !canAccessMatching}
                    onClick={() => handleStepClick(step)}
                  >
                    {getButtonText(step)}
                    {getButtonIcon(step)}
                  </Button>
                ) : (
                  <Link to={step.link}>
                    <Button 
                      variant={step.completed ? "outline" : "ghost"} 
                      size="sm" 
                      className={`p-0 h-6 ${step.completed ? 'text-blue-600 hover:text-blue-700' : 'text-primary hover:text-primary-600'}`}
                    >
                      {getButtonText(step)}
                      {getButtonIcon(step)}
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

      {/* Schedule Visit Modal */}
      <ScheduleVisitModal 
        open={showScheduleModal}
        onOpenChange={setShowScheduleModal}
      />
    </>
  );
};
