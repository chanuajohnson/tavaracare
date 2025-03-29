
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { HandHeart, Users, ShoppingBag, HeartHandshake, Footprints, ChevronDown, ChevronUp, HelpCircle, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface CaregiverHealthCardProps {
  className?: string;
}

export function CaregiverHealthCard({
  className
}: CaregiverHealthCardProps) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleRequestClick = () => {
    if (!user) {
      toast.info("Please log in or register", {
        description: "You need to be logged in to request support services.",
        duration: 5000
      });
    }
  };
  
  const supportServices = [
    {
      icon: <HandHeart className="h-10 w-10 text-primary-500" />,
      title: "Caregiver Support Network",
      description: "Connect with other professionals for emotional support and work-life balance advice."
    },
    {
      icon: <HeartHandshake className="h-10 w-10 text-primary-500" />,
      title: "Wellness Resources",
      description: "Access mental health resources and self-care strategies tailored for caregivers."
    },
    {
      icon: <Users className="h-10 w-10 text-primary-500" />,
      title: "Peer Mentorship",
      description: "Connect with experienced caregivers who can provide guidance and advice."
    },
    {
      icon: <ShoppingBag className="h-10 w-10 text-primary-500" />,
      title: "Professional Development",
      description: "Access training resources to enhance your caregiving skills and career growth."
    }
  ];
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className="overflow-hidden border-l-4 border-l-primary-300 bg-gradient-to-br from-blue-50 to-primary-50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <HandHeart className="h-6 w-6 text-primary" />
            Caregiver Health & Wellbeing
          </CardTitle>
          <CardDescription>
            Access resources designed to support your wellbeing as a professional caregiver
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Collapsible
            open={isExpanded}
            onOpenChange={setIsExpanded}
            className="space-y-2"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {supportServices.slice(0, isExpanded ? 4 : 2).map((service, idx) => (
                <div key={idx} className="bg-white rounded-lg p-4 shadow-sm border border-blue-100 flex flex-col items-center text-center">
                  {service.icon}
                  <h3 className="font-medium mt-2 mb-1">{service.title}</h3>
                  <p className="text-sm text-gray-600">{service.description}</p>
                </div>
              ))}
            </div>
            
            <CollapsibleContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-800">Why Caregiver Wellbeing Matters</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Caregiving is a demanding profession. Taking care of your mental and physical health 
                      allows you to provide the best care possible while avoiding burnout.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Footprints className="h-5 w-5 text-primary mr-2" />
                    Self-Care Steps
                  </h3>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      <span>Set boundaries between work and personal time</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      <span>Practice mindfulness and stress management</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      <span>Maintain a healthy work-life balance</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      <span>Seek support when needed</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                  <h3 className="font-medium mb-2 flex items-center">
                    <HeartHandshake className="h-5 w-5 text-primary mr-2" />
                    Support Resources
                  </h3>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      <span>24/7 Caregiver Support Helpline</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      <span>Monthly wellness webinars</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      <span>Stress management resources</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      <span>Personal development workshops</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CollapsibleContent>
            
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center justify-center w-full mt-2">
                {isExpanded ? (
                  <>
                    Show Less <ChevronUp className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Show More <ChevronDown className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </CardContent>
        
        <CardFooter className="bg-white/60 border-t border-blue-100 flex flex-wrap justify-between gap-3 pt-3">
          <Button
            variant="default"
            className="flex-1 sm:flex-none"
            onClick={handleRequestClick}
          >
            Request Support
          </Button>
          <Link to="/professional/profile#caregiver-health" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full">
              View Wellbeing Resources
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
