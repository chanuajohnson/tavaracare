
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCog, ArrowRight } from "lucide-react";
import { UpvoteFeatureButton } from "@/components/features/UpvoteFeatureButton";

export const ProfileManagementSection = () => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog className="h-5 w-5 text-primary" />
          Profile Management
        </CardTitle>
        <CardDescription>Manage your profile information and preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600">
          Keep your profile up-to-date to ensure you receive the most relevant care coordination support and recommendations.
        </p>
        <Link to="/registration/family">
          <Button variant="default" className="w-full">
            Manage Profile
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <UpvoteFeatureButton 
          featureTitle="Profile Management" 
          className="w-full" 
          buttonText="Upvote this Feature" 
        />
      </CardContent>
    </Card>
  );
};
