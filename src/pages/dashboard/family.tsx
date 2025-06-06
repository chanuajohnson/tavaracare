
import { useEffect } from 'react';
import { useAuth } from "@/components/providers/AuthProvider";
import { useNavigate } from 'react-router-dom';
import { ScheduleVisitModal } from "@/components/family/ScheduleVisitModal";
import { useEnhancedJourneyProgress } from "@/hooks/useEnhancedJourneyProgress";
import { FamilyDashboard } from "@/components/family/FamilyDashboard";

export default function FamilyDashboardPage() {
  const { user } = useAuth();
  const {
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
        <FamilyDashboard />
      </main>

      <ScheduleVisitModal
        open={showScheduleModal}
        onOpenChange={setShowScheduleModal}
        onVisitScheduled={onVisitScheduled}
      />
    </div>
  );
}
