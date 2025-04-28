import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import Account from './pages/Account';
import Home from './pages/Home';
import ProfessionalDirectory from './pages/ProfessionalDirectory';
import CommunityDirectory from './pages/CommunityDirectory';
import CarePlanDirectory from './pages/CarePlanDirectory';
import FamilyDashboard from './pages/dashboards/FamilyDashboard';
import ProfessionalDashboard from './pages/dashboards/ProfessionalDashboard';
import CommunityDashboard from './pages/dashboards/CommunityDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import ProfilePage from './pages/profile/ProfilePage';
import CarePlanDetailPage from './pages/family/care-management/CarePlanDetailPage';
import CarePlanCreatePage from './pages/family/care-management/CarePlanCreatePage';
import CarePlanEditPage from './pages/family/care-management/CarePlanEditPage';
import CareTeamPage from './pages/family/care-management/CareTeamPage';
import CareTasksPage from './pages/family/care-management/CareTasksPage';
import DocumentsPage from './pages/family/care-management/DocumentsPage';
import SettingsPage from './pages/SettingsPage';
import LegalPage from './pages/LegalPage';
import FeaturesOverviewPage from './pages/FeaturesOverviewPage';
import TrainingResourcesPage from './pages/TrainingResourcesPage';
import PricingPage from './pages/PricingPage';
import ContactUsPage from './pages/ContactUsPage';
import AboutUsPage from './pages/AboutUsPage';
import NotFoundPage from './pages/NotFoundPage';
import ComingSoonPage from './pages/ComingSoonPage';
import { usePageViewTracking } from './components/tracking/usePageViewTracking';
import { useAuthCheck } from './hooks/useAuthCheck';

const queryClient = new QueryClient();

function App() {
  usePageViewTracking();
  useAuthCheck();

  const supabase = useSupabaseClient();
  const user = useUser();

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/contact-us" element={<ContactUsPage />} />
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="/legal" element={<LegalPage />} />
        <Route path="/features-overview" element={<FeaturesOverviewPage />} />
        <Route path="/training-resources" element={<TrainingResourcesPage />} />
        <Route path="/professional-directory" element={<ProfessionalDirectory />} />
        <Route path="/community-directory" element={<CommunityDirectory />} />
        <Route path="/care-plan-directory" element={<CarePlanDirectory />} />
        <Route path="/coming-soon" element={<ComingSoonPage />} />
        <Route path="*" element={<NotFoundPage />} />

        {/* Authentication routes */}
        <Route
          path="/auth"
          element={
            <div className="grid h-screen place-items-center">
              <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={['google', 'github']}
                redirectTo={`${window.location.origin}/account`}
              />
            </div>
          }
        />

        {/* Account routes (protected) */}
        <Route path="/account" element={<Account />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Family routes */}
        <Route path="/dashboard/family" element={<FamilyDashboard />} />
        <Route path="/family/care-plan/:id" element={<CarePlanDetailPage />} />
        <Route path="/family/care-plan/create" element={<CarePlanCreatePage />} />
        <Route path="/family/care-plan/edit/:id" element={<CarePlanEditPage />} />
        <Route path="/family/care-team/:id" element={<CareTeamPage />} />
        <Route path="/family/care-tasks/:id" element={<CareTasksPage />} />
        <Route path="/family/documents/:id" element={<DocumentsPage />} />

        {/* Professional routes */}
        <Route path="/dashboard/professional" element={<ProfessionalDashboard />} />
        <Route path="/professional/care-assignments" element={<lazy(() => import('./pages/professional/CareAssignmentsPage'))()} />

        {/* Community routes */}
        <Route path="/dashboard/community" element={<CommunityDashboard />} />

        {/* Admin routes */}
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
