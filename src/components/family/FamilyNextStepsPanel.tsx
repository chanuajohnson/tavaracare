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
      title: "Complete your loved one's profile", 
      description: "Add details about your care recipient", 
      completed: false, 
      link: "/registration/family" 
    },
    { 
      id: 3, 
      title: "Set care type preferences", 
      description: "Specify the types of care needed", 
      completed: false, 
      link: "/registration/family" 
    },
    { 
      id: 4, 
      title: "Complete initial care assessment", 
      description: "Help us understand your care needs better", 
      completed: false, 
      link: "/family/care-assessment" 
    },
    { 
      id: 5, 
      title: "Tell their story", 
      description: "Share your loved one's life story and preferences", 
      completed: false, 
      link: "/family/tell-story" 
    },
    { 
      id: 6, 
      title: "Schedule initial site visit", 
      description: "Arrange a care coordinator visit", 
      completed: false, 
      link: "/family/schedule-visit" 
    }
  ]);
  const [loading, setLoading] = useState(true);

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
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      // Check user profile completion from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone_number, address, care_types')
        .eq('id', user.id)
        .maybeSingle();

      const updatedSteps = [...steps];
      
      // Mark first step as completed if user exists and has basic info
      if (user && profile?.full_name) {
        updatedSteps[0].completed = true;
      }
      
      // Mark second step as completed if care recipient profile exists
      if (careRecipient) {
        updatedSteps[1].completed = true;
      }
      
      // Mark third step as completed if care types are set
      if (profile?.care_types && profile.care_types.length > 0) {
        updatedSteps[2].completed = true;
      }
      
      // Mark fourth step as completed if care assessment exists
      if (careAssessment) {
        updatedSteps[3].completed = true;
      }
      
      // Note: Steps 5 and 6 will be checked once those features are implemented
      
      setSteps(updatedSteps);
    } catch (error) {
      console.error("Error checking step completion:", error);
    } finally {
      setLoading(false);
    }
  };

  const completedSteps = steps.filter(step => step.completed).length;
  const progress = Math.round((completedSteps / steps.length) * 100);

  const getButtonText = (step: any) => {
    if (step.completed) {
      return step.id === 4 ? "Edit Assessment" : "Edit";
    }
    return step.id === 4 ? "Start Assessment" : "Complete";
  };

  const getButtonIcon = (step: any) => {
    if (step.completed) {
      return <ArrowRight className="ml-1 h-3 w-3" />;
    }
    return <ArrowRight className="ml-1 h-3 w-3" />;
  };

  if (loading) {
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
