
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, List, ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export const NextStepsPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState([
    { 
      id: 1, 
      title: "Create your account", 
      description: "Set up your Tavara account", 
      completed: true, // Always completed if user exists
      link: "/auth" 
    },
    { 
      id: 2, 
      title: "Complete your professional profile", 
      description: "Add your experience and certifications", 
      completed: false, 
      link: "/registration/professional" 
    },
    { 
      id: 3, 
      title: "Upload certifications & documents", 
      description: "Verify your credentials", 
      completed: false, 
      link: "/professional/profile" 
    },
    { 
      id: 4, 
      title: "Set your availability preferences", 
      description: "Configure your work schedule", 
      completed: false, 
      link: "/professional/profile" 
    },
    { 
      id: 5, 
      title: "Complete training modules", 
      description: "Enhance your skills", 
      completed: false, 
      link: "/professional/training" 
    },
    { 
      id: 6, 
      title: "Schedule orientation session", 
      description: "Complete your onboarding", 
      completed: false, 
      link: "/professional/profile" 
    }
  ]);

  useEffect(() => {
    if (user) {
      checkStepCompletion();
    }
  }, [user]);

  const checkStepCompletion = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Check user profile completion from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('professional_type, years_of_experience, certifications, availability')
        .eq('id', user.id)
        .maybeSingle();

      // Check for uploaded documents
      const { data: documents } = await supabase
        .from('professional_documents')
        .select('id')
        .eq('user_id', user.id);

      const updatedSteps = [...steps];
      
      // Step 1: Account creation - always completed if user exists
      updatedSteps[0].completed = true;
      
      // Step 2: Complete professional profile - check if professional details are filled
      if (profile && profile.professional_type && profile.years_of_experience) {
        updatedSteps[1].completed = true;
      }
      
      // Step 3: Upload documents - check if any documents exist
      if (documents && documents.length > 0) {
        updatedSteps[2].completed = true;
      }
      
      // Step 4: Availability - check if availability is set
      if (profile && profile.availability && profile.availability.length > 0) {
        updatedSteps[3].completed = true;
      }
      
      // Steps 5 and 6 will be completed based on future implementations
      
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
      if (step.id === 1) return "Account Created";
      if (step.id === 2) return "Edit Profile";
      if (step.id === 3) return "View Documents";
      if (step.id === 4) return "Edit Availability";
      if (step.id === 5) return "Continue Training";
      if (step.id === 6) return "Reschedule";
      return "Edit";
    }
    
    if (step.id === 1) return "Complete";
    if (step.id === 2) return "Complete Profile";
    if (step.id === 3) return "Upload Docs";
    if (step.id === 4) return "Set Availability";
    if (step.id === 5) return "Start Training";
    if (step.id === 6) return "Schedule";
    
    return "Complete";
  };

  const getButtonIcon = (step: any) => {
    return <ArrowRight className="ml-1 h-3 w-3" />;
  };

  const handleStepClick = (step: any) => {
    navigate(step.link);
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
            Your Professional Journey Progress
          </CardTitle>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">Complete these steps to start connecting with families</p>
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
                <Button 
                  variant={step.completed ? "outline" : "ghost"} 
                  size="sm" 
                  className={`p-0 h-6 ${
                    step.completed 
                      ? 'text-blue-600 hover:text-blue-700' 
                      : 'text-primary hover:text-primary-600'
                  }`}
                  onClick={() => handleStepClick(step)}
                  disabled={step.id === 1 && step.completed}
                >
                  {getButtonText(step)}
                  {step.id !== 1 && getButtonIcon(step)}
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};
