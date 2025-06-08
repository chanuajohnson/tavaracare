import { Routes, Route } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import Index from "@/pages/Index";
import AuthPage from "@/pages/auth/AuthPage";
import ResetPassword from "@/pages/auth/ResetPassword";
import ResetPasswordConfirm from "@/pages/auth/reset-password/ResetPasswordConfirm";
import FamilyDashboard from "@/pages/dashboards/FamilyDashboard";
import ProfessionalDashboard from "@/pages/dashboards/ProfessionalDashboard";
import CommunityDashboard from "@/pages/dashboards/CommunityDashboard";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminVisitSchedulePage from "@/pages/admin/AdminVisitSchedulePage";
import UserJourneyPage from "@/pages/admin/UserJourneyPage";
import FeedbackManagementPage from "@/pages/admin/FeedbackManagementPage";
import FeaturesPage from "@/pages/features/FeaturesPage";
import AboutPage from "@/pages/about/AboutPage";
import FAQPage from "@/pages/support/FAQPage";
import NotFound from "@/pages/NotFound";
import SupabaseDebugPage from "@/pages/debug/SupabaseDebugPage";

// Registration Components
import FamilyRegistration from "@/pages/registration/FamilyRegistration";
import ProfessionalRegistration from "@/pages/registration/ProfessionalRegistration";
import CommunityRegistration from "@/pages/registration/CommunityRegistration";

// Professional Pages
import ProfessionalFeaturesOverview from "@/pages/professional/ProfessionalFeaturesOverview";
import ProfessionalProfileHub from "@/pages/professional/ProfessionalProfileHub";
import ProfessionalSchedulePage from "@/pages/professional/ProfessionalSchedulePage";
import ProfessionalAssignmentPage from "@/pages/professional/ProfessionalAssignmentPage";
import TrainingResourcesPage from "@/pages/professional/TrainingResourcesPage";
import ModuleViewerPage from "@/pages/professional/ModuleViewerPage";
import MessageBoardPage from "@/pages/professional/MessageBoardPage";

// Family Pages
import FamilyFeaturesOverview from "@/pages/family/FamilyFeaturesOverview";
import FamilyMatchingPage from "@/pages/family/FamilyMatchingPage";
import FamilyStoryPage from "@/pages/family/FamilyStoryPage";
import CareNeedsAssessmentPage from "@/pages/family/CareNeedsAssessmentPage";
import MealManagementPage from "@/pages/family/MealManagementPage";
import MedicationManagementPage from "@/pages/family/MedicationManagementPage";
import CareManagementPage from "@/pages/family/care-management/CareManagementPage";
import CarePlanDetailPage from "@/pages/family/care-management/CarePlanDetailPage";
import CreateCarePlanPage from "@/pages/family/care-management/CreateCarePlanPage";
import CareJourneyProgressPage from "@/pages/family/CareJourneyProgressPage";

// Community Pages
import CommunityFeaturesOverview from "@/pages/community/CommunityFeaturesOverview";

// Caregiver Pages
import CaregiverMatchingPage from "@/pages/caregiver/CaregiverMatchingPage";
import CaregiverHealthPage from "@/pages/caregiver/CaregiverHealthPage";

// Subscription Pages
import SubscriptionPage from "@/pages/subscription/SubscriptionPage";
import SubscriptionFeaturesPage from "@/pages/subscription/SubscriptionFeaturesPage";

// Legacy Pages
import LegacyStoriesPage from "@/pages/legacy/LegacyStoriesPage";

export const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />
      <Route path="/auth/reset-password/confirm" element={<ResetPasswordConfirm />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/faq" element={<FAQPage />} />
      
      {/* Registration Routes */}
      <Route path="/registration/family" element={<FamilyRegistration />} />
      <Route path="/registration/professional" element={<ProfessionalRegistration />} />
      <Route path="/registration/community" element={<CommunityRegistration />} />
      
      {/* Dashboard Routes */}
      <Route path="/dashboard/family" element={<FamilyDashboard />} />
      <Route path="/dashboard/professional" element={<ProfessionalDashboard />} />
      <Route path="/dashboard/community" element={<CommunityDashboard />} />
      <Route path="/dashboard/admin" element={<AdminDashboard />} />
      
      {/* Professional Routes */}
      <Route path="/professional" element={<ProfessionalFeaturesOverview />} />
      <Route path="/professional/profile" element={<ProfessionalProfileHub />} />
      <Route path="/professional/schedule" element={<ProfessionalSchedulePage />} />
      <Route path="/professional/assignment/:assignmentId" element={<ProfessionalAssignmentPage />} />
      <Route path="/professional/training" element={<TrainingResourcesPage />} />
      <Route path="/professional/training/module/:moduleId" element={<ModuleViewerPage />} />
      <Route path="/professional/message-board" element={<MessageBoardPage />} />
      
      {/* Family Routes */}
      <Route path="/family" element={<FamilyFeaturesOverview />} />
      <Route path="/family/matching" element={<FamilyMatchingPage />} />
      <Route path="/family/story" element={<FamilyStoryPage />} />
      <Route path="/family/care-assessment" element={<CareNeedsAssessmentPage />} />
      <Route path="/family/meal-management" element={<MealManagementPage />} />
      <Route path="/family/medication-management" element={<MedicationManagementPage />} />
      <Route path="/family/care-management" element={<CareManagementPage />} />
      <Route path="/family/care-management/:id" element={<CarePlanDetailPage />} />
      <Route path="/family/care-management/:id/medications" element={<MedicationManagementPage />} />
      <Route path="/family/care-management/:id/meals" element={<MealManagementPage />} />
      <Route path="/family/care-management/create" element={<CreateCarePlanPage />} />
      <Route path="/family/care-journey-progress" element={<CareJourneyProgressPage />} />
      
      {/* Community Routes */}
      <Route path="/community" element={<CommunityFeaturesOverview />} />
      
      {/* Caregiver Routes */}
      <Route path="/caregiver/matching" element={<CaregiverMatchingPage />} />
      <Route path="/caregiver/health" element={<CaregiverHealthPage />} />
      
      {/* Subscription Routes */}
      <Route path="/subscription" element={<SubscriptionPage />} />
      <Route path="/subscription/features" element={<SubscriptionFeaturesPage />} />
      
      {/* Admin Routes */}
      <Route path="/admin/visit-schedule" element={<AdminVisitSchedulePage />} />
      <Route path="/admin/user-journey" element={<UserJourneyPage />} />
      <Route path="/admin/feedback" element={<FeedbackManagementPage />} />
      
      {/* Legacy Routes */}
      <Route path="/legacy/stories" element={<LegacyStoriesPage />} />
      
      {/* Debug Routes */}
      <Route path="/debug/supabase" element={<SupabaseDebugPage />} />
      
      {/* Catch all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
