
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ChatUIProvider } from "@/components/providers/ChatUIProvider";
import { Navigation } from "@/components/layout/Navigation";
import { useEffect, Suspense, lazy, useState } from "react";
import { initializeSupabase, isSupabaseExperiencingIssues } from "@/lib/supabase";
import { Fab } from "@/components/ui/fab";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy loaded page components
const Index = lazy(() => import("@/pages/Index"));
const AuthPage = lazy(() => import("@/pages/auth/AuthPage"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"));
const FeaturesPage = lazy(() => import("@/pages/features/FeaturesPage"));
const AboutPage = lazy(() => import("@/pages/about/AboutPage"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const UserJourneyPage = lazy(() => import("@/pages/admin/UserJourneyPage"));
const FamilyDashboard = lazy(() => import("@/pages/dashboards/FamilyDashboard"));
const CommunityDashboard = lazy(() => import("@/pages/dashboards/CommunityDashboard"));
const ProfessionalDashboard = lazy(() => import("@/pages/dashboards/ProfessionalDashboard"));

const FamilyRegistration = lazy(() => import("@/pages/registration/FamilyRegistration"));
const ProfessionalRegistration = lazy(() => import("@/pages/registration/ProfessionalRegistration"));
const ProfessionalRegistrationFix = lazy(() => import("@/pages/registration/ProfessionalRegistrationFix"));
const CommunityRegistration = lazy(() => import("@/pages/registration/CommunityRegistration"));

const CommunityFeaturesOverview = lazy(() => import("@/pages/community/CommunityFeaturesOverview"));
const ProfessionalFeaturesOverview = lazy(() => import("@/pages/professional/ProfessionalFeaturesOverview"));
const MessageBoardPage = lazy(() => import("@/pages/professional/MessageBoardPage"));
const TrainingResourcesPage = lazy(() => import("@/pages/professional/TrainingResourcesPage"));
const ProfessionalProfileHub = lazy(() => import("@/pages/professional/ProfessionalProfileHub"));
const ProfessionalAssignmentPage = lazy(() => import("@/pages/professional/ProfessionalAssignmentPage"));
const ProfessionalSchedulePage = lazy(() => import("@/pages/professional/ProfessionalSchedulePage"));

const ModuleViewerPage = lazy(() => import("@/pages/professional/ModuleViewerPage"));

const FamilyFeaturesOverview = lazy(() => import("@/pages/family/FamilyFeaturesOverview"));
const FamilyStoryPage = lazy(() => import("@/pages/family/FamilyStoryPage"));
const CareManagementPage = lazy(() => import("@/pages/family/care-management/CareManagementPage"));
const CreateCarePlanPage = lazy(() => import("@/pages/family/care-management/CreateCarePlanPage"));
const CarePlanDetailPage = lazy(() => import("@/pages/family/care-management/CarePlanDetailPage"));
const LegacyStoriesPage = lazy(() => import("@/pages/legacy/LegacyStoriesPage"));
const FAQPage = lazy(() => import("@/pages/support/FAQPage"));
const SubscriptionPage = lazy(() => import("@/pages/subscription/SubscriptionPage"));
const SubscriptionFeaturesPage = lazy(() => import("@/pages/subscription/SubscriptionFeaturesPage"));

const CaregiverMatchingPage = lazy(() => import("@/pages/caregiver/CaregiverMatchingPage"));
const CaregiverHealthPage = lazy(() => import("@/pages/caregiver/CaregiverHealthPage"));
const FamilyMatchingPage = lazy(() => import("@/pages/family/FamilyMatchingPage"));

const NotFound = lazy(() => import("@/pages/NotFound"));

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

// Loading fallback component for Suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-full max-w-md p-6 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </div>
  </div>
);

const RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const routeParam = params.get('route');
    
    if (routeParam) {
      const newUrl = '/' + routeParam;
      navigate(newUrl, { replace: true });
    }
  }, [location, navigate]);
  
  return null;
};

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
    
    const checkInterval = setInterval(() => {
      setSupabaseStatus(isSupabaseExperiencingIssues() ? 'issues' : 'available');
    }, 30000);
    
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
          <RedirectHandler />
          <AuthProvider>
            <ChatUIProvider>
              <AppContent />
            </ChatUIProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const AppContent = () => {
  const location = useLocation();
  const isIndexPage = location.pathname === "/";
  
  useEffect(() => {
    console.log('[App] Route changed to:', location.pathname);
  }, [location.pathname]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/admin/user-journey" element={<UserJourneyPage />} />
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
            <Route path="/professional/profile" element={<ProfessionalProfileHub />} />
            
            <Route path="/professional/assignments/:planId" element={<ProfessionalAssignmentPage />} />
            <Route path="/professional/schedule" element={<ProfessionalSchedulePage />} />
            
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
            <Route path="/caregiver/health" element={<CaregiverHealthPage />} />
            <Route path="/family-matching" element={<FamilyMatchingPage />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
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
