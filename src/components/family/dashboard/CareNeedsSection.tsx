
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Profile } from "@/types/profileTypes";
import { fromJson } from "@/utils/json";

interface CareNeedsSectionProps {
  profileData: Profile | null;
}

export const CareNeedsSection: React.FC<CareNeedsSectionProps> = ({ profileData }) => {
  // Parse onboarding_progress if it's a string
  const onboardingProgress = profileData?.onboarding_progress 
    ? (typeof profileData.onboarding_progress === 'string' 
        ? fromJson(profileData.onboarding_progress, {}) 
        : profileData.onboarding_progress)
    : undefined;
    
  // Check if care_needs step has been completed
  const careNeedsCompleted = onboardingProgress?.completedSteps?.care_needs;
  
  if (profileData && !careNeedsCompleted) {
    return (
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="text-xl">Complete Your Care Needs Profile</CardTitle>
          <CardDescription>
            Tell us about specific care needs to help match you with the right caregivers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-600">
            Step 2 of your family onboarding process is to complete your detailed care needs profile. 
            This will help us understand specific requirements and create a personalized care plan.
          </p>
          <Link to="/careneeds/family">
            <Button>
              Complete Care Needs
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return null;
};
