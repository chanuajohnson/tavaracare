import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Lock } from "lucide-react";
import { SubscriptionFeatureLink } from "@/components/subscription/SubscriptionFeatureLink";
import { useAuth } from "@/components/providers/AuthProvider";

export const MessageBoard = () => {
  const location = useLocation();
  const { isProfileComplete, user } = useAuth();
  
  // Determine the current dashboard path to use as referring page
  const currentPath = location.pathname;
  const isInProfessionalDashboard = currentPath.includes("/dashboard/professional");
  const referringPagePath = isInProfessionalDashboard ? "/dashboard/professional" : currentPath;
  const referringPageLabel = isInProfessionalDashboard ? "Professional Dashboard" : "Dashboard";
  
  // Check if user has skipped registration
  const hasSkippedRegistration = user?.user_metadata?.registrationSkipped === true;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Message Board</CardTitle>
        <CardDescription>
          Connect with families and other caregivers in your community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          
          <h3 className="text-lg font-medium mb-2">Premium Feature Coming Soon</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Our message board will allow caregivers to connect with families, discuss care techniques, and build a professional network.
          </p>
          
          {/* Show different button based on profile status */}
          {!isProfileComplete && hasSkippedRegistration ? (
            <div className="space-y-3">
              <p className="text-amber-600 text-sm mb-2">
                Complete your profile to access this feature
              </p>
              <Button asChild variant="secondary" className="w-full md:w-auto">
                <Link to="/registration/professional">
                  Complete Profile
                </Link>
              </Button>
            </div>
          ) : (
            <SubscriptionFeatureLink 
              featureType="Premium Message Board"
              returnPath="/professional/message-board"
              referringPagePath={referringPagePath}
              referringPageLabel={referringPageLabel}
              className="w-full md:w-auto"
            >
              Learn about Premium Features
            </SubscriptionFeatureLink>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
