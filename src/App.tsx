import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Navigation } from "@/components/layout/Navigation";
import { useEffect, Suspense, lazy, useState } from "react";
import { initializeSupabase, isSupabaseExperiencingIssues } from "@/lib/supabase";
import { Fab } from "@/components/ui/fab";

// Import all page components
import Index from "@/pages/Index";
import AuthPage from "@/pages/auth/AuthPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import FeaturesPage from "@/pages/features/FeaturesPage";
import AboutPage from "@/pages/about/AboutPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import FamilyDashboard from "@/pages/dashboards/FamilyDashboard";
import CommunityDashboard from "@/pages/dashboards/CommunityDashboard";
import ProfessionalDashboard from "@/pages/dashboards/ProfessionalDashboard";
import FamilyRegistration from "@/pages/registration/FamilyRegistration";
import ProfessionalRegistration from "@/pages/registration/ProfessionalRegistration";
import ProfessionalRegistrationFix from "@/pages/registration/ProfessionalRegistrationFix";
import CommunityRegistration from "@/pages/registration/CommunityRegistration";
import CommunityFeaturesOverview from "@/pages/community/CommunityFeaturesOverview";
import ProfessionalFeaturesOverview from "@/pages/professional/ProfessionalFeaturesOverview";
import MessageBoardPage from "@/pages/professional/MessageBoardPage";
import TrainingResourcesPage from "@/pages/professional/TrainingResourcesPage";
import ModuleViewerPage from "@/pages/professional/ModuleViewerPage";
import FamilyFeaturesOverview from "@/pages/family/FamilyFeaturesOverview";
import FamilyStoryPage from "@/pages/family/FamilyStoryPage";
import FAQPage from "@/pages/support/FAQPage";
import SubscriptionPage from "@/pages/subscription/SubscriptionPage";
import SubscriptionFeaturesPage from "@/pages/subscription/SubscriptionFeaturesPage";
import CaregiverMatchingPage from "@/pages/caregiver/CaregiverMatchingPage";
import FamilyMatchingPage from "@/pages/family/FamilyMatchingPage";
import LegacyStoriesPage from "@/pages/legacy/LegacyStoriesPage";
import CareManagementPage from "@/pages/family/care-management/CareManagementPage";
import CreateCarePlanPage from "@/pages/family/care-management/CreateCarePlanPage";
import NotFound from "@/pages/NotFound";
import CarePlanDetailPage from "@/pages/family/care-management/CarePlanDetailPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (was cacheTime)
      refetchOnWindowFocus: false,
    },
  },
});

const AppWithProviders = () => {
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'available' | 'issues'>('checking');
  
  useEffect(() => {
    initializeSupabase()
      .then(success => {
        setSupabaseStatus(success ? 'available' : 'issues');
      })
      .catch(() => {
        setSupabaseStatus('issues');
      });
    
    // Add custom style to reposition Lovable badge to top-right
    const style = document.createElement('style');
    style.textContent = `
      .lovable-badge {
        bottom: auto !important;
        right: auto !important;
        top: 10px !important;
        left: 10px !important;
        z-index: 100 !important;
        opacity: 0.7 !important;
        transform: scale(0.8) !important;
      }
      .lovable-badge:hover {
        opacity: 1 !important;
      }
    `;
    document.head.appendChild(style);
    
    // Check Supabase status periodically
    const checkInterval = setInterval(() => {
      setSupabaseStatus(isSupabaseExperiencingIssues() ? 'issues' : 'available');
    }, 30000); // Check every 30 seconds
    
    return () => {
      clearInterval(checkInterval);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        {supabaseStatus === 'issues' && (
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 fixed top-0 left-0 right-0 z-50 text-center">
            Supabase is currently experiencing issues. Some features may not work properly.
          </div>
        )}
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const AppContent = () => {
  const location = useLocation();
  const isIndexPage = location.pathname === "/";
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/family" element={<FamilyDashboard />} />
          <Route path="/dashboard/community" element={<CommunityDashboard />} />
          <Route path="/dashboard/professional" element={<ProfessionalDashboard />} />
          
          <Route path="/registration/family" element={<FamilyRegistration />} />
          <Route path="/registration/professional" element={<ProfessionalRegistration />} />
          <Route path="/registration/professional-fix" element={<ProfessionalRegistrationFix />} />
          <Route path="/registration/community" element={<CommunityRegistration />} />
          
          <Route path="/community/features-overview" element={<CommunityFeaturesOverview />} />
          <Route path="/professional/features-overview" element={<ProfessionalFeaturesOverview />} />
          <Route path="/professional/message-board" element={<MessageBoardPage />} />
          <Route path="/professional/training-resources" element={<TrainingResourcesPage />} />
          
          <Route path="/professional/module/:moduleId" element={<ModuleViewerPage />} />
          <Route path="/professional/training-resources/module/:moduleId" element={<ModuleViewerPage />} />
          <Route path="/professional/training-resources/module/:moduleId/lesson/:lessonId" element={<ModuleViewerPage />} />
          
          <Route path="/family/features-overview" element={<FamilyFeaturesOverview />} />
          <Route path="/family/message-board" element={<MessageBoardPage />} />
          <Route path="/family/story" element={<FamilyStoryPage />} />
          <Route path="/family/care-management" element={<CareManagementPage />} />
          <Route path="/family/care-management/create" element={<CreateCarePlanPage />} />
          <Route path="/family/care-management/:id" element={<CarePlanDetailPage />} />
          <Route path="/legacy-stories" element={<LegacyStoriesPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/subscription-features" element={<SubscriptionFeaturesPage />} />
          
          <Route path="/caregiver-matching" element={<CaregiverMatchingPage />} />
          <Route path="/family-matching" element={<FamilyMatchingPage />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      {!isIndexPage && <GlobalFAB />}
    </div>
  );
};

const GlobalFAB = () => {
  const location = useLocation();
  const pathname = location.pathname;
  
  if (pathname === "/" || pathname === "/faq") {
    return null;
  }
  
  return (
    <Fab 
      className="bg-primary-500 hover:bg-primary-600 text-white"
      label="Support options"
    />
  );
};

export default AppWithProviders;
