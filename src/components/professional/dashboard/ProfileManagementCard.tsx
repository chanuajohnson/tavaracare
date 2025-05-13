
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, UserCog } from "lucide-react";
import { Link } from "react-router-dom";
import { FadeIn } from "@/components/framer";
import { UpvoteFeatureButton } from "@/components/features/UpvoteFeatureButton";

const ProfileManagementCard = () => {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog className="h-5 w-5" />
          Profile Management
        </CardTitle>
        <CardDescription>
          Manage your professional profile and qualifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 mb-4 text-left">
          <p className="text-sm text-gray-600">Update Personal Information</p>
          <p className="text-sm text-gray-600">Manage Professional Credentials</p>
          <p className="text-sm text-gray-600">Update Skills & Experience</p>
          <p className="text-sm text-gray-600">Set Availability & Preferences</p>
        </div>
        <Link to="/professional/profile">
          <Button 
            variant="default"
            className="w-full bg-primary hover:bg-primary-600 text-white"
          >
            View Profile Hub
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <div className="pt-4">
          <UpvoteFeatureButton
            featureTitle="Professional Profile Management"
            buttonText="Upvote this Feature"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileManagementCard;
