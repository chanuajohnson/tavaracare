
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, List, ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SubscriptionFeatureLink } from "@/components/subscription/SubscriptionFeatureLink";

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

  // This would normally be fetched from the backend
  // Mock user profile completeness for demonstration purposes
  useEffect(() => {
    // Simulate checking profile status
    const checkProfileStatus = () => {
      const updatedSteps = [...steps];
      // Mark first step as completed if user exists
      if (user) {
        updatedSteps[0].completed = true;
      }
      
      // Randomly mark some steps as completed for demonstration
      if (user) {
        updatedSteps[1].completed = Math.random() > 0.5;
        updatedSteps[2].completed = Math.random() > 0.7;
      }
      
      setSteps(updatedSteps);
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
                {!step.completed && (
                  <Link to={step.link}>
                    <Button variant="ghost" size="sm" className="p-0 h-6 text-primary hover:text-primary-600">
                      Complete
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
