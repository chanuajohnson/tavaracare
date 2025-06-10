
import { Routes, Route } from 'react-router-dom';
import { RedirectHandler } from './RedirectHandler';
import Index from '@/pages/Index';
import AuthPage from '@/pages/auth/AuthPage';
import ResetPassword from '@/pages/auth/ResetPassword';
import ResetPasswordConfirm from '@/pages/auth/reset-password/ResetPasswordConfirm';
import AboutPage from '@/pages/about/AboutPage';
import FeaturesPage from '@/pages/features/FeaturesPage';
import FamilyDashboard from '@/pages/dashboards/FamilyDashboard';
import ProfessionalDashboard from '@/pages/dashboards/ProfessionalDashboard';
import CommunityDashboard from '@/pages/dashboards/CommunityDashboard';
import FamilyRegistration from '@/pages/registration/FamilyRegistration';
import ProfessionalRegistration from '@/pages/registration/ProfessionalRegistration';
import CommunityRegistration from '@/pages/registration/CommunityRegistration';
import CareNeedsAssessmentPage from '@/pages/family/CareNeedsAssessmentPage';
import FamilyMatchingPage from '@/pages/family/FamilyMatchingPage';
import CaregiverMatchingPage from '@/pages/caregiver/CaregiverMatchingPage';
import CaregiverHealthPage from '@/pages/caregiver/CaregiverHealthPage';
import FAQPage from '@/pages/support/FAQPage';
import FamilyStoryPage from '@/pages/family/FamilyStoryPage';
import FamilyFeaturesOverview from '@/pages/family/FamilyFeaturesOverview';
import CommunityFeaturesOverview from '@/pages/community/CommunityFeaturesOverview';
import ProfessionalFeaturesOverview from '@/pages/professional/ProfessionalFeaturesOverview';
import SubscriptionPage from '@/pages/subscription/SubscriptionPage';
import SubscriptionFeaturesPage from '@/pages/subscription/SubscriptionFeaturesPage';
import LegacyStoriesPage from '@/pages/legacy/LegacyStoriesPage';
import MedicationManagementPage from '@/pages/family/MedicationManagementPage';
import MealManagementPage from '@/pages/family/MealManagementPage';
import CareManagementPage from '@/pages/family/care-management/CareManagementPage';
import CarePlanDetailPage from '@/pages/family/care-management/CarePlanDetailPage';
import CreateCarePlanPage from '@/pages/family/care-management/CreateCarePlanPage';
import ProfessionalSchedulePage from '@/pages/professional/ProfessionalSchedulePage';
import ProfessionalProfileHub from '@/pages/professional/ProfessionalProfileHub';
import { PersonalProfilePage } from '@/pages/professional/PersonalProfilePage';
import TrainingResourcesPage from '@/pages/professional/TrainingResourcesPage';
import ModuleViewerPage from '@/pages/professional/ModuleViewerPage';
import MessageBoardPage from '@/pages/professional/MessageBoardPage';
import ProfessionalAssignmentPage from '@/pages/professional/ProfessionalAssignmentPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import UserJourneyPage from '@/pages/admin/UserJourneyPage';
import FeedbackManagementPage from '@/pages/admin/FeedbackManagementPage';
import AdminVisitSchedulePage from '@/pages/admin/AdminVisitSchedulePage';
import CareJourneyProgressPage from '@/pages/family/CareJourneyProgressPage';
import SupabaseDebugPage from '@/pages/debug/SupabaseDebugPage';
import NotFound from '@/pages/NotFound';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      
      {/* Authentication */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth/callback" element={<ResetPasswordConfirm />} />
      
      {/* Static Pages */}
      <Route path="/about" element={<AboutPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/support/faq" element={<FAQPage />} />
      
      {/* Dashboard Routes */}
      <Route path="/dashboard/family" element={<FamilyDashboard />} />
      <Route path="/dashboard/professional" element={<ProfessionalDashboard />} />
      <Route path="/dashboard/community" element={<CommunityDashboard />} />
      
      {/* Registration Routes */}
      <Route path="/registration/family" element={<FamilyRegistration />} />
      <Route path="/registration/professional" element={<ProfessionalRegistration />} />
      <Route path="/registration/community" element={<CommunityRegistration />} />
      
      {/* Family Routes */}
      <Route path="/family/care-needs-assessment" element={<CareNeedsAssessmentPage />} />
      <Route path="/family/matching" element={<FamilyMatchingPage />} />
      <Route path="/family/story" element={<FamilyStoryPage />} />
      <Route path="/family/features" element={<FamilyFeaturesOverview />} />
      <Route path="/family/care-journey-progress" element={<CareJourneyProgressPage />} />
      <Route path="/family/medication-management" element={<MedicationManagementPage />} />
      <Route path="/family/meal-management" element={<MealManagementPage />} />
      <Route path="/family/care-management" element={<CareManagementPage />} />
      <Route path="/family/care-management/create" element={<CreateCarePlanPage />} />
      <Route path="/family/care-management/:id" element={<CarePlanDetailPage />} />
      
      {/* Professional Routes */}
      <Route path="/professional/matching" element={<CaregiverMatchingPage />} />
      <Route path="/professional/health" element={<CaregiverHealthPage />} />
      <Route path="/professional/features" element={<ProfessionalFeaturesOverview />} />
      <Route path="/professional/schedule" element={<ProfessionalSchedulePage />} />
      <Route path="/professional/profile" element={<ProfessionalProfileHub />} />
      <Route path="/professional/personal-profile" element={<PersonalProfilePage />} />
      <Route path="/professional/training" element={<TrainingResourcesPage />} />
      <Route path="/professional/training/module/:moduleId" element={<ModuleViewerPage />} />
      <Route path="/professional/message-board" element={<MessageBoardPage />} />
      <Route path="/professional/assignment/:assignmentId" element={<ProfessionalAssignmentPage />} />
      
      {/* Community Routes */}
      <Route path="/community/features" element={<CommunityFeaturesOverview />} />
      
      {/* Subscription Routes */}
      <Route path="/subscription" element={<SubscriptionPage />} />
      <Route path="/subscription/features" element={<SubscriptionFeaturesPage />} />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/user-journey" element={<UserJourneyPage />} />
      <Route path="/admin/feedback" element={<FeedbackManagementPage />} />
      <Route path="/admin/visits" element={<AdminVisitSchedulePage />} />
      
      {/* Legacy Routes */}
      <Route path="/legacy/stories" element={<LegacyStoriesPage />} />
      
      {/* Debug Routes */}
      <Route path="/debug/supabase" element={<SupabaseDebugPage />} />
      
      {/* Redirects */}
      <Route path="/redirect" element={<RedirectHandler />} />
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
