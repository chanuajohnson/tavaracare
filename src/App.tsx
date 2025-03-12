import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './components/providers/AuthProvider';
import { initializeSupabase } from './lib/supabase';
import AuthPage from './pages/auth/AuthPage';
import FamilyRegistrationForm from './pages/registration/FamilyRegistrationForm';
import ProfessionalRegistrationForm from './pages/registration/ProfessionalRegistrationForm';
import CommunityRegistrationForm from './pages/registration/CommunityRegistrationForm';
import Dashboard from './pages/dashboards/Dashboard';
import FamilyDashboard from './pages/dashboards/FamilyDashboard';
import ProfessionalDashboard from './pages/dashboards/ProfessionalDashboard';
import CommunityDashboard from './pages/dashboards/CommunityDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import CarePlanPage from './pages/family/CarePlanPage';
import DocumentUploadPage from './pages/family/DocumentUploadPage';
import SettingsPage from './pages/SettingsPage';
import LandingPage from './pages/LandingPage';
import LoadingPage from './pages/LoadingPage';
import MessageBoardPage from './pages/professional/MessageBoardPage';
import ProfessionalFeaturesOverview from './pages/professional/ProfessionalFeaturesOverview';
import TrainingResourcesPage from "./pages/professional/TrainingResourcesPage";
import ModuleViewerPage from "./pages/professional/ModuleViewerPage";

function App() {
  const { isLoggedIn, isLoading, userRole } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      const supabaseInitialized = await initializeSupabase();
      setIsInitialized(supabaseInitialized);
    };

    initializeApp();
  }, []);

  if (!isInitialized) {
    return <LoadingPage />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={isLoggedIn ? <Navigate to="/dashboard" /> : <AuthPage />} />
        <Route path="/loading" element={<LoadingPage />} />

        {/* Registration Routes */}
        <Route path="/registration/family" element={isLoggedIn && userRole === 'family' ? <FamilyRegistrationForm /> : <Navigate to="/auth" />} />
        <Route path="/registration/professional" element={isLoggedIn && userRole === 'professional' ? <ProfessionalRegistrationForm /> : <Navigate to="/auth" />} />
        <Route path="/registration/community" element={isLoggedIn && userRole === 'community' ? <CommunityRegistrationForm /> : <Navigate to="/auth" />} />

        {/* Dashboard Routes - Protected by Authentication */}
        <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/auth" />} >
          <Route index element={<Navigate to="/dashboard/family" />} /> {/* Redirect to family dashboard by default */}
          <Route path="family" element={userRole === 'family' ? <FamilyDashboard /> : <Navigate to="/dashboard" />} />
          <Route path="professional" element={userRole === 'professional' ? <ProfessionalDashboard /> : <Navigate to="/dashboard" />} />
          <Route path="community" element={userRole === 'community' ? <CommunityDashboard /> : <Navigate to="/dashboard" />} />
          <Route path="admin" element={userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" />} />
        </Route>

        {/* Family Routes */}
        <Route path="/family/care-plan" element={isLoggedIn && userRole === 'family' ? <CarePlanPage /> : <Navigate to="/auth" />} />
        <Route path="/family/documents" element={isLoggedIn && userRole === 'family' ? <DocumentUploadPage /> : <Navigate to="/auth" />} />

        {/* Professional Routes */}
        <Route path="/professional/training-resources" element={<TrainingResourcesPage />} />
        <Route path="/professional/training-resources/module/:moduleId" element={<ModuleViewerPage />} />
        <Route path="/professional/training-resources/module/:moduleId/lesson/:lessonId" element={<ModuleViewerPage />} />
        <Route path="/professional/message-board" element={<MessageBoardPage />} />
        <Route path="/professional/features-overview" element={<ProfessionalFeaturesOverview />} />

        {/* Settings Route - Protected by Authentication */}
        <Route path="/settings" element={isLoggedIn ? <SettingsPage /> : <Navigate to="/auth" />} />

        {/* Catch-all route for 404 - Redirect to home page */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
