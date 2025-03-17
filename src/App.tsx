
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './components/providers/AuthProvider';
import { ToastContainer } from 'sonner';
import { StripeScriptLoader } from '@stripe/react-stripe-js';
import { stripePromise } from './lib/stripe';
import { supabase } from './lib/supabase';
import { useAuth } from './components/providers/AuthProvider';

// Import components
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';

// Import pages
import { LandingPage } from './pages/LandingPage';
import SubscriptionFeaturesPage from './pages/subscription/SubscriptionFeaturesPage';
import FamilySettingsPage from './pages/settings/FamilySettingsPage';
import ProfessionalSettingsPage from './pages/settings/ProfessionalSettingsPage';
import { ProfessionalDashboard } from './pages/professional/ProfessionalDashboard';
import { FamilyDashboard } from './pages/family/FamilyDashboard';
import { CaregiverProfilePage } from './pages/CaregiverProfilePage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { ContactUsPage } from './pages/ContactUsPage';
import { AboutUsPage } from './pages/AboutUsPage';
import { PricingV2 } from './pages/new-pricing/PricingV2';

// Import professional pages
import Dashboard from './pages/Dashboard';
import { ProfessionalJobListingPage } from './pages/professional/ProfessionalJobListingPage';
import { ProfessionalAllJobListingsPage } from './pages/professional/ProfessionalAllJobListingsPage';
import TrainingResourcesPage from './pages/training/TrainingResourcesPage';
import TrainingModulePage from './pages/training/TrainingModulePage';
import TrainingLessonPage from './pages/training/TrainingLessonPage';

// Import community pages
import MessageBoardPage from './pages/community/MessageBoardPage';
import { BlogPostPage } from './pages/community/BlogPostPage';
import { BlogListPage } from './pages/community/BlogListPage';

// Import auth pages
import AuthenticationPage from './pages/auth/AuthenticationPage';

// Import pricing pages
import PricingPage from './pages/pricing/PricingPage';

// Import matching pages
import FamilyMatchingPage from "./pages/family/FamilyMatchingPage";
import ProfessionalMatchingPage from "./pages/professional/ProfessionalMatchingPage";

// Registration page (from auth directory)
import RegistrationPage from './pages/auth/RegistrationPage';

function App() {
  useEffect(() => {
    const handleAuthStateChange = async (event: any, session: any) => {
      if (event === 'SIGNED_IN') {
        // User signed in
        console.log('User signed in:', session);
        // You can perform actions here when a user signs in, like updating local storage
      } else if (event === 'SIGNED_OUT') {
        // User signed out
        console.log('User signed out');
        // Perform actions here when a user signs out, like clearing local storage
      }
    };

    supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Clean up subscription
    return () => {
      supabase.auth.offAuthStateChange(handleAuthStateChange);
    };
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <ToastContainer />
        <StripeScriptLoader stripePromise={stripePromise}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthenticationPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/pricing-v2" element={<PricingV2 />} />
            <Route path="/subscription-features" element={<SubscriptionFeaturesPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/training-resources" element={<TrainingResourcesPage />} />
            <Route path="/module/:moduleId" element={<TrainingModulePage />} />
            <Route path="/lesson/:lessonId" element={<TrainingLessonPage />} />
            <Route path="/message-board" element={<MessageBoardPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/contact-us" element={<ContactUsPage />} />
            <Route path="/about-us" element={<AboutUsPage />} />
            <Route path="/blog/:blogPostId" element={<BlogPostPage />} />
            <Route path="/blog" element={<BlogListPage />} />

            {/* Settings Pages */}
            <Route path="/settings/family" element={<FamilySettingsPage />} />
            <Route path="/settings/professional" element={<ProfessionalSettingsPage />} />

            {/* Professional Routes */}
            <Route path="/dashboard/professional" element={<ProfessionalDashboard />} />
            <Route path="/professional/job/:jobId" element={<ProfessionalJobListingPage />} />
            <Route path="/professional/jobs" element={<ProfessionalAllJobListingsPage />} />
            <Route path="/caregiver/:caregiverId" element={<CaregiverProfilePage />} />

            {/* Family Routes */}
            <Route path="/dashboard/family" element={<FamilyDashboard />} />

            {/* Family Matching Page */}
            <Route path="/family-matching" element={<FamilyMatchingPage />} />
        
            {/* Professional Matching Page */}
            <Route path="/professional-matching" element={<ProfessionalMatchingPage />} />
          </Routes>
        </StripeScriptLoader>
      </AuthProvider>
      <Footer />
    </Router>
  );
}

export default App;
