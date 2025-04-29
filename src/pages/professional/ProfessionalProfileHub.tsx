import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UserCircle, 
  Calendar, 
  GraduationCap, 
  ClipboardList, 
  ListChecks, 
  FileText,
  Briefcase,
  Users,
  AlertCircle
} from "lucide-react";
import { useJourneyTracking } from "@/hooks/useJourneyTracking";
import { useTrainingProgress } from "@/hooks/useTrainingProgress";
import { useProfileHubData } from "@/hooks/professional/useProfileHubData";
import { useCarePlanData } from "@/hooks/professional/useCarePlanData";
import { useProfileActions } from "@/hooks/professional/useProfileActions";
import { useCareShifts } from "@/hooks/useCareShifts";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DocumentsTab } from "@/components/professional/assignments/DocumentsTab";
import { AdminAssistantTab } from "@/components/professional/assignments/AdminAssistantTab";
import {
  ProfileOverview,
  AvailabilitySection,
  OnboardingProgress,
  AvailabilityDialog,
  NextStepsTab,
  AssignmentsTab,
  CareTeamTab,
  CalendarTab,
  TrainingTab
} from "@/components/professional/profile-hub";

const ProfessionalProfileHub = () => {
  const { 
    user, 
    profileData, 
    loading, 
    error,
    steps,
    setSteps,
    completedSteps,
    progress,
    selectedAvailability,
    setSelectedAvailability,
    isAvailabilityModalOpen,
    setIsAvailabilityModalOpen,
    getInitials
  } = useProfileHubData();

  const {
    carePlans,
    loadingCarePlans,
    careTeamMembers,
    loadingCareTeamMembers
  } = useCarePlanData();

  const { renderActionButton, saveAvailability } = useProfileActions();
  
  const { shifts, loading: loadingShifts } = useCareShifts();
  const { modules, loading: loadingModules, totalProgress } = useTrainingProgress();

  const breadcrumbItems = [
    {
      label: "Professional Dashboard",
      path: "/dashboard/professional",
    },
    {
      label: "Profile Hub",
      path: "/professional/profile",
    },
  ];

  useJourneyTracking({
    journeyStage: 'profile_management',
    additionalData: { page: 'professional_profile_hub' },
    trackOnce: true
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 py-8">
          <DashboardHeader breadcrumbItems={breadcrumbItems} />
          <h1 className="text-3xl font-bold mb-6">Professional Profile Hub</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Loading skeleton... */}
            {/* ... keep existing code (loading skeleton UI) */}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 py-8">
          <DashboardHeader breadcrumbItems={breadcrumbItems} />
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg max-w-2xl mx-auto">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h2>
              <p className="mb-6 text-gray-600">{error}</p>
              <div className="space-y-2">
                <Button onClick={() => window.location.reload()}>Reload Page</Button>
                <div className="flex justify-center mt-4">
                  <Link to="/dashboard/professional">
                    <Button variant="outline">Return to Dashboard</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 py-8">
          <DashboardHeader breadcrumbItems={breadcrumbItems} />
          <div className="text-center py-12">
            <div className="bg-blue-50 border border-blue-200 text-blue-700 p-6 rounded-lg max-w-2xl mx-auto">
              <AlertCircle className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
              <p className="mb-6 text-gray-600">Please log in to view your professional profile hub.</p>
              <Link to="/auth">
                <Button>Log In or Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveAvailability = async () => {
    await saveAvailability(
      selectedAvailability, 
      "", // otherAvailability - we'll handle this in the dialog component
      steps, 
      setSteps, 
      setIsAvailabilityModalOpen
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />
        
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-2"
          >
            <h1 className="text-3xl font-bold">Professional Profile Hub</h1>
            <p className="text-muted-foreground">
              Manage your profile, availability, training progress, and care assignments
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <ProfileOverview
                  profileData={profileData}
                  getInitials={getInitials}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <AvailabilitySection 
                  selectedAvailability={selectedAvailability}
                  setIsAvailabilityModalOpen={setIsAvailabilityModalOpen}
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <OnboardingProgress
                  steps={steps}
                  completedSteps={completedSteps}
                  progress={progress}
                  renderActionButton={(step) => renderActionButton(step, steps, setSteps, setIsAvailabilityModalOpen)}
                />
              </motion.div>
            </div>
            
            <div className="md:col-span-2">
              <Tabs defaultValue="next-steps" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="next-steps" className="flex items-center gap-2">
                    <ListChecks className="h-4 w-4" />
                    <span>Next Steps</span>
                  </TabsTrigger>
                  <TabsTrigger value="assignments" className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    <span>Care Assignments</span>
                  </TabsTrigger>
                  <TabsTrigger value="team" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Care Teams</span>
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Calendar</span>
                  </TabsTrigger>
                  <TabsTrigger value="training" className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>Training</span>
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Documents</span>
                  </TabsTrigger>
                  <TabsTrigger value="admin-assistant" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span>Admin Assistant</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="next-steps" className="space-y-6">
                  <NextStepsTab
                    steps={steps}
                    completedSteps={completedSteps}
                    progress={progress}
                    renderActionButton={(step) => renderActionButton(step, steps, setSteps, setIsAvailabilityModalOpen)}
                  />
                </TabsContent>
                
                <TabsContent value="assignments" className="space-y-6">
                  <AssignmentsTab
                    loadingCarePlans={loadingCarePlans}
                    carePlans={carePlans}
                  />
                </TabsContent>
                
                <TabsContent value="team" className="space-y-6">
                  <CareTeamTab
                    loadingCareTeamMembers={loadingCareTeamMembers}
                    careTeamMembers={careTeamMembers}
                  />
                </TabsContent>
                
                <TabsContent value="calendar" className="space-y-6">
                  <CalendarTab
                    loadingShifts={loadingShifts}
                    shifts={shifts}
                  />
                </TabsContent>
                
                <TabsContent value="training" className="space-y-6">
                  <TrainingTab
                    loadingModules={loadingModules}
                    modules={modules}
                    totalProgress={totalProgress}
                  />
                </TabsContent>
                
                <TabsContent value="documents" className="space-y-6">
                  <DocumentsTab />
                </TabsContent>
                
                <TabsContent value="admin-assistant" className="space-y-6">
                  <AdminAssistantTab />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      
      <AvailabilityDialog
        isOpen={isAvailabilityModalOpen}
        onOpenChange={setIsAvailabilityModalOpen}
        selectedAvailability={selectedAvailability}
        onAvailabilityChange={setSelectedAvailability}
        saveAvailability={handleSaveAvailability}
      />
    </div>
  );
};

export default ProfessionalProfileHub;
