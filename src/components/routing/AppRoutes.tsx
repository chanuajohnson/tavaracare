import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { RedirectHandler } from './RedirectHandler';
import { RouteValidator } from './RouteValidator';

// Pages
import Index from '@/pages/Index';
import IndexStatic from '@/pages/IndexStatic';
import NotFound from '@/pages/NotFound';
import AboutPage from '@/pages/about/AboutPage';

// Auth pages
import AuthPage from '@/pages/auth/AuthPage';
import ResetPassword from '@/pages/auth/ResetPassword';
import ResetPasswordConfirm from '@/pages/auth/reset-password/ResetPasswordConfirm';

// Dashboard pages
import FamilyDashboard from '@/pages/dashboards/FamilyDashboard';
import ProfessionalDashboard from '@/pages/dashboard/ProfessionalDashboard';
import CommunityDashboard from '@/pages/dashboards/CommunityDashboard';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminHeroVideoManagement from '@/pages/admin/AdminHeroVideoManagement';
import AdminVisitSchedulePage from '@/pages/admin/AdminVisitSchedulePage';
import FeedbackManagementPage from '@/pages/admin/FeedbackManagementPage';
import UserJourneyPage from '@/pages/admin/UserJourneyPage';

// Registration pages
import FamilyRegistration from '@/pages/registration/FamilyRegistration';
import ProfessionalRegistration from '@/pages/registration/ProfessionalRegistration';
import CommunityRegistration from '@/pages/registration/CommunityRegistration';

// Feature pages
import FeaturesPage from '@/pages/features/FeaturesPage';

// Other pages
import CaregiverMatchingPage from '@/pages/caregiver/CaregiverMatchingPage';
import CaregiverHealthPage from '@/pages/caregiver/CaregiverHealthPage';

export function AppRoutes() {
  return (
    <>
      <RouteValidator />
      <Routes>
        {/* Redirect handlers */}
        <Route path="/index-static" element={<IndexStatic />} />
        <Route path="/dashboard/*" element={<RedirectHandler />} />
        
        {/* Main routes */}
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<AboutPage />} />
        
        {/* Auth routes */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/register" element={<AuthPage />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/auth/reset-password/confirm" element={<ResetPasswordConfirm />} />
        
        {/* Registration routes */}
        <Route path="/registration/family" element={<FamilyRegistration />} />
        <Route path="/registration/professional" element={<ProfessionalRegistration />} />
        <Route path="/registration/community" element={<CommunityRegistration />} />
        
        {/* Protected dashboard routes */}
        <Route path="/dashboard/family" element={<FamilyDashboard />} />
        <Route path="/dashboard/professional" element={<ProfessionalDashboard />} />
        <Route path="/dashboard/community" element={<CommunityDashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        
        {/* Admin routes */}
        <Route path="/admin/hero-videos" element={<AdminHeroVideoManagement />} />
        <Route path="/admin/visit-schedule" element={<AdminVisitSchedulePage />} />
        <Route path="/admin/feedback" element={<FeedbackManagementPage />} />
        <Route path="/admin/user-journey" element={<UserJourneyPage />} />
        
        {/* Feature routes */}
        <Route path="/features" element={<FeaturesPage />} />
        
        {/* Other routes */}
        <Route path="/caregiver-matching" element={<CaregiverMatchingPage />} />
        <Route path="/caregiver-health" element={<CaregiverHealthPage />} />
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
