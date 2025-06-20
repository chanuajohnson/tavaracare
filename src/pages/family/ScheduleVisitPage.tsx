
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { PageViewTracker } from '@/components/tracking/PageViewTracker';
import { ScheduleVisitModal } from '@/components/family/ScheduleVisitModal';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar } from 'lucide-react';

const ScheduleVisitPage = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true);

  const handleCloseModal = () => {
    setShowModal(false);
    navigate('/dashboard/family');
  };

  const handleVisitScheduled = () => {
    setShowModal(false);
    navigate('/dashboard/family');
  };

  return (
    <div className="min-h-screen bg-background">
      <PageViewTracker 
        actionType="schedule_visit_page_view" 
        journeyStage="scheduling"
      />
      
      <DashboardHeader 
        breadcrumbItems={[
          { label: "Family Dashboard", path: "/dashboard/family" },
          { label: "Schedule Visit", path: "/family/schedule-visit" }
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
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Schedule Your Visit</h1>
          </div>
        </div>
        
        <p className="text-gray-600 mb-8">
          Schedule a consultation visit with our care team to discuss your needs and preferences.
        </p>

        <ScheduleVisitModal
          open={showModal}
          onOpenChange={setShowModal}
          onVisitScheduled={handleVisitScheduled}
        />
        
        {/* Fallback content if modal is closed */}
        {!showModal && (
          <div className="bg-white rounded-lg border p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Schedule Visit</h2>
            <p className="text-gray-600 mb-4">
              Book a consultation to get started with your care plan.
            </p>
            <Button onClick={() => setShowModal(true)}>
              Schedule Visit
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleVisitPage;
