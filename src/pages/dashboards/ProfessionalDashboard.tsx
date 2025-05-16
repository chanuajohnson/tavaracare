
import { DashboardHeader as BreadcrumbHeader } from "@/components/dashboard/DashboardHeader";
import { useAuth } from "@/components/providers/AuthProvider";
import { FadeIn } from "@/components/framer";
import { CaregiverHealthCard } from "@/components/professional/CaregiverHealthCard";
import { NextStepsPanel } from "@/components/professional/NextStepsPanel";
import { ProfessionalShortcutMenuBar } from "@/components/professional/ProfessionalShortcutMenuBar";
import { CaregiverMatchingCard } from "@/components/professional/CaregiverMatchingCard";
import { DashboardFamilyMatches } from "@/components/professional/DashboardFamilyMatches";
import { TrainingProgressTracker } from "@/components/professional/TrainingProgressTracker";
import { JobListings } from "@/components/professional/JobListings";
import { MessageBoard } from "@/components/professional/MessageBoard";
import { TrainingProgramSection } from "@/components/professional/TrainingProgramSection";
import { TrainingModulesSection } from "@/components/professional/TrainingModulesSection";

// Import the new smaller components
import WelcomeCard from "@/components/professional/dashboard/WelcomeCard";
import ProfileManagementCard from "@/components/professional/dashboard/ProfileManagementCard";
import AdminAssistantCard from "@/components/professional/dashboard/AdminAssistantCard";
import TrainingResourcesCard from "@/components/professional/dashboard/TrainingResourcesCard";
import ProfessionalAgencyCard from "@/components/professional/dashboard/ProfessionalAgencyCard";
import DashboardHeader from "@/components/professional/dashboard/DashboardHeader";
// Import the new CareAssignmentsCard
import CareAssignmentsCard from "@/components/professional/dashboard/CareAssignmentsCard";

const ProfessionalDashboard = () => {
  const { user } = useAuth();
  
  const breadcrumbItems = [
    {
      label: "Professional Dashboard",
      path: "/dashboard/professional",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8">
        <BreadcrumbHeader breadcrumbItems={breadcrumbItems} />

        <DashboardHeader />

        {/* Quick Access Menu Bar - Only show when user is logged in */}
        {user && <ProfessionalShortcutMenuBar />}

        {!user ? <WelcomeCard /> : null}

        {/* Caregiver Health Card - Show for all users */}
        <FadeIn delay={0.1} duration={0.5} className="mt-8">
          <CaregiverHealthCard />
        </FadeIn>

        {/* Care Assignments Card - Show for logged in users */}
        {user && (
          <FadeIn delay={0.15} duration={0.5} className="mt-8">
            <CareAssignmentsCard />
          </FadeIn>
        )}

        {/* Next Steps and Profile Management - side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <FadeIn delay={0.15} duration={0.5}>
            <NextStepsPanel />
          </FadeIn>
          
          {/* Profile Management Card */}
          <FadeIn delay={0.2} duration={0.5}>
            <ProfileManagementCard />
          </FadeIn>
        </div>

        <FadeIn delay={0.25} duration={0.5} className="mt-8">
          <CaregiverMatchingCard />
        </FadeIn>

        {/* Family Matches Section */}
        <FadeIn delay={0.3} duration={0.5} className="mt-8">
          <DashboardFamilyMatches />
        </FadeIn>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FadeIn delay={0.35} duration={0.5}>
              <TrainingProgressTracker />
            </FadeIn>
            
            <FadeIn delay={0.4} duration={0.5}>
              <JobListings />
            </FadeIn>
          </div>
              
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FadeIn delay={0.45} duration={0.5}>
              <MessageBoard />
            </FadeIn>
            
            {/* Admin Assistant */}
            <FadeIn delay={0.5} duration={0.5}>
              <AdminAssistantCard />
            </FadeIn>
          </div>
        </div>

        {/* Training Resources - single column, full width */}
        <TrainingResourcesCard />

        {/* Training Program Section */}
        <FadeIn delay={0.25} duration={0.5}>
          <TrainingProgramSection />
        </FadeIn>

        {/* Training Modules Section */}
        <FadeIn delay={0.3} duration={0.5}>
          <TrainingModulesSection />
        </FadeIn>

        {/* Professional Agency - single column, full width */}
        <ProfessionalAgencyCard />
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
