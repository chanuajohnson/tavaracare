
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardCardGrid } from "@/components/dashboard/DashboardCardGrid";
import { CaregiverMatchingCard } from "@/components/professional/CaregiverMatchingCard";
import { DashboardFamilyMatches } from "@/components/professional/DashboardFamilyMatches";
import { MessageBoard } from "@/components/professional/MessageBoard";
import { NextStepsPanel } from "@/components/professional/NextStepsPanel";
import { TrainingProgramSection } from "@/components/professional/TrainingProgramSection";
import { useAuth } from '@/components/providers/AuthProvider';
import { DashboardTracker } from '@/components/tracking/DashboardTracker';
import { IncompleteProfileBanner } from '@/components/registration/IncompleteProfileBanner';

const ProfessionalDashboard = () => {
  const { user, userRole, isProfileComplete } = useAuth();
  const navigate = useNavigate();
  const registrationSkipped = localStorage.getItem('registrationSkipped') === 'true';

  if (!user || userRole !== 'professional') {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-4">You must be logged in as a professional to view this page.</p>
        <Button onClick={() => navigate('/auth')}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <DashboardTracker dashboardType="professional" />
      
      <DashboardHeader 
        title="Professional Dashboard" 
        description="Welcome to your professional dashboard. Here you can manage your clients, view care requests, and access training resources."
      />

      {!isProfileComplete && registrationSkipped && <IncompleteProfileBanner />}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          <DashboardFamilyMatches />
          <TrainingProgramSection />
        </div>
        <div className="space-y-6">
          <NextStepsPanel />
          <CaregiverMatchingCard />
        </div>
      </div>
      
      <MessageBoard limit={3} showViewAll={true} />
      
      <DashboardCardGrid
        sectionTitle="Tools & Resources"
        cards={[
          {
            title: "Training Resources",
            description: "Access professional development courses and certifications",
            buttonText: "View Resources",
            buttonLink: "/professional/training-resources"
          },
          {
            title: "Message Board",
            description: "Connect with families and other professionals",
            buttonText: "Go to Message Board",
            buttonLink: "/professional/message-board"
          },
          {
            title: "Family Matching",
            description: "View families seeking care professionals with your expertise",
            buttonText: "Find Matches",
            buttonLink: "/family-matching"
          }
        ]}
      />
    </div>
  );
};

export default ProfessionalDashboard;
