import { useEffect } from 'react';
import { useAuth } from "@/components/providers/AuthProvider";
import { useNavigate } from 'react-router-dom';
import { JourneyProgressCard } from "@/components/family/JourneyProgressCard";
import { FamilyCarePlanOverview } from "@/components/family/FamilyCarePlanOverview";
import { FamilyRecentActivity } from "@/components/family/FamilyRecentActivity";
import { QuickActionsCard } from "@/components/family/QuickActionsCard";
import { FamilyUpcomingAppointments } from "@/components/family/FamilyUpcomingAppointments";
import { FamilySupportCard } from "@/components/family/FamilySupportCard";
import { ScheduleVisitModal } from "@/components/family/ScheduleVisitModal";
import { useEnhancedJourneyProgress } from "@/hooks/useEnhancedJourneyProgress";

export default function FamilyDashboard() {
  const { user } = useAuth();
  const {
    steps,
    paths,
    completionPercentage,
    nextStep,
    currentStage,
    loading,
    showScheduleModal,
    setShowScheduleModal,
    onVisitScheduled
  } = useEnhancedJourneyProgress();

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      console.log('No user found, redirecting to auth');
      navigate('/auth');
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Family Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome to your care management hub.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <JourneyProgressCard
              steps={steps}
              paths={paths}
              completionPercentage={completionPercentage}
              nextStep={nextStep}
              currentStage={currentStage}
              loading={loading}
            />
            <FamilyCarePlanOverview />
            <FamilyRecentActivity />
          </div>
          
          <div className="space-y-6">
            <QuickActionsCard />
            <FamilyUpcomingAppointments />
            <FamilySupportCard />
          </div>
        </div>
      </main>

      <ScheduleVisitModal
        open={showScheduleModal}
        onOpenChange={setShowScheduleModal}
        onVisitScheduled={onVisitScheduled}
      />
    </div>
  );
}
