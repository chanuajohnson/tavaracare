
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { PageViewTracker } from '@/components/tracking/PageViewTracker';
import { CaregiverMatchingModal } from '@/components/family/CaregiverMatchingModal';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users } from 'lucide-react';

const CaregiverMatchesPage = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true);

  const handleCloseModal = () => {
    setShowModal(false);
    navigate('/dashboard/family');
  };

  return (
    <div className="min-h-screen bg-background">
      <PageViewTracker 
        actionType="caregiver_matches_page_view" 
        journeyStage="matching"
      />
      
      <DashboardHeader 
        breadcrumbItems={[
          { label: "Family Dashboard", path: "/dashboard/family" },
          { label: "Caregiver Matches", path: "/family/caregiver-matches" }
        ]} 
      />
      
      <div className="container max-w-4xl py-10">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/family')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Your Caregiver Matches</h1>
          </div>
        </div>
        
        <p className="text-gray-600 mb-8">
          We've found caregivers in your area who match your family's needs. 
          Review their profiles, read their reviews, and connect with the ones that feel right for your family.
        </p>

        {/* The modal will handle the actual matching functionality */}
        <CaregiverMatchingModal 
          isOpen={showModal}
          onClose={handleCloseModal}
        />
        
        {/* Fallback content if modal is closed */}
        {!showModal && (
          <div className="bg-white rounded-lg border p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Caregiver Matching</h2>
            <p className="text-gray-600 mb-4">
              Find the perfect caregiver for your family's unique needs.
            </p>
            <Button onClick={() => setShowModal(true)}>
              View Caregiver Matches
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaregiverMatchesPage;
