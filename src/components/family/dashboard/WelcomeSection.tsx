
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Profile } from "@/types/profileTypes";

interface WelcomeSectionProps {
  user: any | null;
  profileData: Profile | null;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({ user, profileData }) => {
  if (!user) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg mb-8 border border-green-100">
        <h2 className="text-2xl font-bold mb-2">Welcome to Tavara! 🚀 It takes a village to care.</h2>
        <p className="text-gray-600 mb-4">Connect with caregivers, explore features, and help shape the future of care</p>
        <div className="flex flex-wrap gap-3 mt-4">
          <Link to="/auth">
            <Button variant="default" size="sm">
              View Care Plans
            </Button>
          </Link>
          <Link to="/auth">
            <Button variant="outline" size="sm">
              Find a Caregiver
            </Button>
          </Link>
          <Link to="/auth">
            <Button variant="outline" size="sm">
              Upvote Features
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return null;
};
