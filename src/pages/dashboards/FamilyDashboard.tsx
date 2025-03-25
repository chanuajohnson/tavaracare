
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FamilyShortcutMenuBar } from "@/components/family/FamilyShortcutMenuBar";
import { DashboardCaregiverMatches } from "@/components/family/DashboardCaregiverMatches";
import { TellTheirStoryCard } from "@/components/family/TellTheirStoryCard";
import { FamilyNextStepsPanel } from "@/components/family/FamilyNextStepsPanel";
import { CaregiverMatchingCard } from "@/components/family/CaregiverMatchingCard";
import { MessageBoard } from "@/components/professional/MessageBoard"; // reused component
import { DashboardCardGrid } from "@/components/dashboard/DashboardCardGrid";
import { useAuth } from '@/components/providers/AuthProvider';
import { DashboardTracker } from '@/components/tracking/DashboardTracker';
import { IncompleteProfileBanner } from '@/components/registration/IncompleteProfileBanner';

const FamilyDashboard = () => {
  const { user, userRole, isProfileComplete } = useAuth();
  const navigate = useNavigate();
  const registrationSkipped = localStorage.getItem('registrationSkipped') === 'true';
  
  if (!user || userRole !== 'family') {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-4">You must be logged in as a family user to view this page.</p>
        <Button onClick={() => navigate('/auth')}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <DashboardTracker dashboardType="family" />
      
      <DashboardHeader 
        title="Family Dashboard" 
        description="Welcome to your family dashboard. Here you can manage care plans, find caregivers, and share your story."
      />
      
      {!isProfileComplete && registrationSkipped && <IncompleteProfileBanner />}
      
      <FamilyShortcutMenuBar />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          <DashboardCaregiverMatches />
          <TellTheirStoryCard />
        </div>
        <div className="space-y-6">
          <FamilyNextStepsPanel />
          <CaregiverMatchingCard />
        </div>
      </div>
      
      <MessageBoard limit={3} showViewAll={true} />
      
      <DashboardCardGrid
        sectionTitle="Resources & Tools"
        cards={[
          {
            title: "Care Management",
            description: "Create and manage care plans for your loved ones",
            buttonText: "Care Plans",
            buttonLink: "/family/care-management"
          },
          {
            title: "Tell Their Story",
            description: "Share your loved one's story to help others",
            buttonText: "Start Writing",
            buttonLink: "/family/story"
          },
          {
            title: "Caregiver Matching",
            description: "Find caregivers that match your needs",
            buttonText: "Find Caregivers",
            buttonLink: "/caregiver-matching"
          }
        ]}
      />
    </div>
  );
};

export default FamilyDashboard;
