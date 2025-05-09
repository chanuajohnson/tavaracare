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
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const [steps, setSteps] = useState([{
    id: 1,
    title: "Complete your profile",
    description: "Add your contact information and preferences",
    completed: false,
    link: "/registration/family"
  }, {
    id: 2,
    title: "Complete your loved one's profile",
    description: "Add details about your care recipient",
    completed: false,
    link: "/registration/family"
  }, {
    id: 3,
    title: "Set care type preferences",
    description: "Specify the types of care needed",
    completed: false,
    link: "/registration/family"
  }, {
    id: 4,
    title: "Complete initial care assessment",
    description: "Help us understand your care needs better",
    completed: false,
    link: "/family/features-overview"
  }, {
    id: 5,
    title: "Connect with caregivers",
    description: "Start building your care team",
    completed: false,
    link: "/family/features-overview"
  }]);

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
  const progress = Math.round(completedSteps / steps.length * 100);
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.5
  }} className="mb-8">
      <Card className="border-l-4 border-l-primary">
        
        
      </Card>
    </motion.div>;
};