
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UserJourneyPage from "@/pages/admin/UserJourneyPage";
import HeroVideoManagementPage from "@/pages/admin/HeroVideoManagementPage";
import AdminVisitSchedulePage from "@/pages/admin/AdminVisitSchedulePage";
import WhatsAppNudgePage from "@/pages/admin/WhatsAppNudgePage";
import CareTeamCommunicationPage from "@/pages/admin/CareTeamCommunicationPage";
import FeedbackManagementPage from "@/pages/admin/FeedbackManagementPage";
import PlatformAnalyticsPage from "@/pages/admin/PlatformAnalyticsPage";
import ShiftManagementPage from "@/pages/admin/ShiftManagementPage";

import HomePage from "@/pages/Index";
import AuthPage from "@/pages/auth/AuthPage";
import CarePlanDetailPage from "@/pages/family/care-management/CarePlanDetailPage";

function App() {
  return (
    <Router>
      <QueryClientProvider client={new QueryClient()}>
        <ThemeProvider defaultTheme="light" storageKey="ui-theme">
          <AuthProvider>
            <Toaster position="top-right" />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />

              {/* Family routes */}
              <Route path="/care-plan/:id" element={<CarePlanDetailPage />} />

              {/* Admin routes */}
              <Route path="/dashboard/admin" element={<AdminDashboard />} />
              <Route path="/admin/user-journey" element={<UserJourneyPage />} />
              <Route path="/admin/hero-video-management" element={<HeroVideoManagementPage />} />
              <Route path="/admin/visit-schedule" element={<AdminVisitSchedulePage />} />
              <Route path="/admin/whatsapp-nudge" element={<WhatsAppNudgePage />} />
              <Route path="/admin/care-team-communication" element={<CareTeamCommunicationPage />} />
              <Route path="/admin/feedback" element={<FeedbackManagementPage />} />
              <Route path="/admin/platform-analytics" element={<PlatformAnalyticsPage />} />
              <Route path="/admin/shift-management" element={<ShiftManagementPage />} />

              {/* Fallback route */}
              <Route path="*" element={<div>Page Not Found</div>} />
            </Routes>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
