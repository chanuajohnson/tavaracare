
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UpvoteFeatureButton } from "@/components/features/UpvoteFeatureButton";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface DashboardRegistrationCardProps {
  session: any;
}

export const DashboardRegistrationCard = ({ session }: DashboardRegistrationCardProps) => {
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  
  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (!session?.user?.id) return;
      
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('professional_type, full_name, care_services')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error checking profile completion:', error);
          return;
        }
        
        // For professional users, check if they have the minimum required fields
        const isProfessionalComplete = profile?.professional_type && 
                                      profile?.full_name && 
                                      profile?.care_services;
        
        setIsProfileComplete(!!isProfessionalComplete);
      } catch (error) {
        console.error('Error checking profile:', error);
      }
    };
    
    checkProfileCompletion();
  }, [session]);
  
  // If profile is complete, don't show the registration card
  if (isProfileComplete) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Registration</CardTitle>
          <CardDescription>Set up your professional profile to start connecting with families</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link to={session ? '/register/professional' : '/auth'}>
            <Button className="w-full">
              {session ? 'Complete Registration' : 'Sign in to Register'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <UpvoteFeatureButton 
            featureTitle="Professional Registration" 
            className="w-full" 
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};
