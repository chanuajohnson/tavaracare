
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import AboutPage from './pages/about/AboutPage';
import AuthPage from './pages/auth/AuthPage';
import FamilyDashboard from './pages/dashboards/FamilyDashboard';
import ProfessionalDashboard from './pages/dashboards/ProfessionalDashboard';
import CommunityDashboard from './pages/dashboards/CommunityDashboard';
import FamilyRegistration from './pages/registration/FamilyRegistration';
import ProfessionalRegistration from './pages/registration/ProfessionalRegistration';
import CommunityRegistration from './pages/registration/CommunityRegistration';
import { ChatUIProvider } from './components/providers/ChatUIProvider';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <ChatUIProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard/family" element={<FamilyDashboard />} />
          <Route path="/dashboard/professional" element={<ProfessionalDashboard />} />
          <Route path="/dashboard/community" element={<CommunityDashboard />} />
          <Route path="/registration/family" element={<FamilyRegistration />} />
          <Route path="/registration/professional" element={<ProfessionalRegistration />} />
          <Route path="/registration/community" element={<CommunityRegistration />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </ChatUIProvider>
  );
}

export default App;
