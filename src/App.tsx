import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/components/providers/AuthProvider';
import { FeaturesProvider } from '@/components/providers/FeaturesProvider';
import { SubscriptionProvider } from '@/components/providers/SubscriptionProvider';
import { TrackingProvider } from '@/components/providers/TrackingProvider';
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { Analytics } from '@vercel/analytics/react';

// Import pages
import LandingPage from '@/pages/LandingPage';
import PricingPage from '@/pages/PricingPage';
import AuthPage from '@/pages/AuthPage';
import RegistrationPage from '@/pages/RegistrationPage';
import FamilyRegistrationPage from '@/pages/registration/FamilyRegistrationPage';
import ProfessionalRegistrationPage from '@/pages/registration/ProfessionalRegistrationPage';
import CommunityRegistrationPage from '@/pages/registration/CommunityRegistrationPage';
import Dashboard from '@/pages/Dashboard';
import FamilyDashboard from '@/pages/dashboards/FamilyDashboard';
import ProfessionalDashboard from '@/pages/dashboards/ProfessionalDashboard';
import CommunityDashboard from '@/pages/dashboards/CommunityDashboard';
import CarePlansPage from '@/pages/care-plans/CarePlansPage';
import CarePlanDetailsPage from '@/pages/care-plans/CarePlanDetailsPage';
import CareTeamPage from '@/pages/care-plans/CareTeamPage';
import CareSchedulePage from '@/pages/care-plans/CareSchedulePage';
import FeaturesOverviewPage from '@/pages/FeaturesOverviewPage';
import SubscriptionFeaturesPage from '@/pages/SubscriptionFeaturesPage';
import MessageBoardPage from '@/pages/MessageBoardPage';
import CaregiverDirectoryPage from '@/pages/CaregiverDirectoryPage';
import CaregiverProfilePage from '@/pages/CaregiverProfilePage';
import CareNeedsPage from '@/pages/careneeds';
import { RedirectHandler } from '@/components/routing/RedirectHandler';
import { LegacyStoriesPage, CaregiverMatchingPage } from '@/pages/family';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Show a loading indicator while checking authentication
  }

  return isLoggedIn ? <>{children}</> : <Navigate to="/auth" />;
};

function App() {
  return (
    <AuthProvider>
      <FeaturesProvider>
        <SubscriptionProvider>
          <TrackingProvider>
            <Router>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/registration" element={<RegistrationPage />} />
                <Route path="/registration/family" element={<FamilyRegistrationPage />} />
                <Route path="/registration/professional" element={<ProfessionalRegistrationPage />} />
                <Route path="/registration/community" element={<CommunityRegistrationPage />} />
                
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/dashboard/family" element={<ProtectedRoute><FamilyDashboard /></ProtectedRoute>} />
                <Route path="/dashboard/professional" element={<ProtectedRoute><ProfessionalDashboard /></ProtectedRoute>} />
                <Route path="/dashboard/community" element={<ProtectedRoute><CommunityDashboard /></ProtectedRoute>} />

                <Route path="/family/care-management" element={<ProtectedRoute><CarePlansPage /></ProtectedRoute>} />
                <Route path="/family/care-management/:carePlanId" element={<ProtectedRoute><CarePlanDetailsPage /></ProtectedRoute>} />
                <Route path="/family/care-management/team" element={<ProtectedRoute><CareTeamPage /></ProtectedRoute>} />
                <Route path="/family/care-management/schedule" element={<ProtectedRoute><CareSchedulePage /></ProtectedRoute>} />
                
                <Route path="/family/features-overview" element={<ProtectedRoute><FeaturesOverviewPage /></ProtectedRoute>} />
                <Route path="/subscription-features" element={<ProtectedRoute><SubscriptionFeaturesPage /></ProtectedRoute>} />
                <Route path="/family/message-board" element={<ProtectedRoute><MessageBoardPage /></ProtectedRoute>} />
                
                <Route path="/caregiver-directory" element={<ProtectedRoute><CaregiverDirectoryPage /></ProtectedRoute>} />
                <Route path="/caregiver/:caregiverId" element={<ProtectedRoute><CaregiverProfilePage /></ProtectedRoute>} />
                
                <Route path="/careneeds/family" element={<ProtectedRoute><CareNeedsPage /></ProtectedRoute>} />

                <Route path="/family/legacy-stories" element={<LegacyStoriesPage />} />
                <Route path="/family/caregiver-matching" element={<CaregiverMatchingPage />} />
                
                <Route path="*" element={<RedirectHandler />} />
              </Routes>
            </Router>
            <Toaster />
            <Analytics />
          </TrackingProvider>
        </SubscriptionProvider>
      </FeaturesProvider>
    </AuthProvider>
  );
}

export default App;
