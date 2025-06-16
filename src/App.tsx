
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/sonner";
import { Layout } from './components/layout/Layout';
import { AuthProvider } from './components/providers/AuthProvider';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleBasedRoute } from './components/auth/RoleBasedRoute';
import { ScrollToTop } from './components/common/ScrollToTop';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './App.css';

// Lazy load pages for better performance
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const SignupPage = React.lazy(() => import('./pages/SignupPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/ResetPasswordPage'));
const UpdatePasswordPage = React.lazy(() => import('./pages/UpdatePasswordPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const FeaturesPage = React.lazy(() => import('./pages/FeaturesPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const PaymentPage = React.lazy(() => import('./pages/PaymentPage'));
const MealPlanningPage = React.lazy(() => import('./pages/MealPlanningPage'));
const ChatRegistration = React.lazy(() => import('./pages/registration/ChatRegistration'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const UserJourneyDashboard = React.lazy(() => import('./pages/admin/UserJourneyDashboard'));
const FeedbackPage = React.lazy(() => import('./pages/admin/FeedbackPage'));
const HeroVideoManagement = React.lazy(() => import('./pages/admin/HeroVideoManagement'));
const WhatsAppNudgePage = React.lazy(() => import('./pages/admin/WhatsAppNudgePage'));
const AdminVisitSchedulePage = React.lazy(() => import('./pages/admin/AdminVisitSchedulePage'));
const PlatformAnalytics = React.lazy(() => import('./pages/admin/PlatformAnalytics'));
const CarePlanPage = React.lazy(() => import('./pages/care-plans/CarePlanPage'));
const DebugPage = React.lazy(() => import('./pages/debug/DebugPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <Layout>
              <ScrollToTop />
              <React.Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              }>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/auth" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/update-password" element={<UpdatePasswordPage />} />
                  <Route path="/features" element={<FeaturesPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  
                  {/* Registration flow */}
                  <Route path="/register/:role" element={<ChatRegistration />} />
                  
                  {/* Protected routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/payment" element={
                    <ProtectedRoute>
                      <PaymentPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/meal-planning" element={
                    <ProtectedRoute>
                      <MealPlanningPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Care Plans */}
                  <Route path="/care-plans/:planId" element={
                    <ProtectedRoute>
                      <CarePlanPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Admin routes */}
                  <Route path="/dashboard/admin" element={
                    <RoleBasedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </RoleBasedRoute>
                  } />
                  
                  <Route path="/admin/user-journey" element={
                    <RoleBasedRoute allowedRoles={['admin']}>
                      <UserJourneyDashboard />
                    </RoleBasedRoute>
                  } />
                  
                  <Route path="/admin/feedback" element={
                    <RoleBasedRoute allowedRoles={['admin']}>
                      <FeedbackPage />
                    </RoleBasedRoute>
                  } />
                  
                  <Route path="/admin/hero-video-management" element={
                    <RoleBasedRoute allowedRoles={['admin']}>
                      <HeroVideoManagement />
                    </RoleBasedRoute>
                  } />
                  
                  <Route path="/admin/whatsapp-nudge" element={
                    <RoleBasedRoute allowedRoles={['admin']}>
                      <WhatsAppNudgePage />
                    </RoleBasedRoute>
                  } />
                  
                  <Route path="/admin/visit-schedule" element={
                    <RoleBasedRoute allowedRoles={['admin']}>
                      <AdminVisitSchedulePage />
                    </RoleBasedRoute>
                  } />
                  
                  <Route path="/admin/platform-analytics" element={
                    <RoleBasedRoute allowedRoles={['admin']}>
                      <PlatformAnalytics />
                    </RoleBasedRoute>
                  } />
                  
                  {/* Debug routes */}
                  <Route path="/debug" element={
                    <RoleBasedRoute allowedRoles={['admin']}>
                      <DebugPage />
                    </RoleBasedRoute>
                  } />
                </Routes>
              </React.Suspense>
            </Layout>
            <Toaster />
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
