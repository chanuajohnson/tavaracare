
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/components/providers/AuthProvider';

// Import pages from family directory
import { LegacyStoriesPage, CaregiverMatchingPage } from '@/pages/family';
import CareNeedsPage from '@/pages/careneeds';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Show a loading indicator while checking authentication
  }

  return user ? <>{children}</> : <Navigate to="/auth" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<div>Landing Page</div>} />
          <Route path="/auth" element={<div>Auth Page</div>} />
          <Route path="/registration" element={<div>Registration Page</div>} />
          <Route path="/registration/family" element={<div>Family Registration Page</div>} />
          
          <Route path="/dashboard" element={<ProtectedRoute><div>Dashboard</div></ProtectedRoute>} />
          <Route path="/dashboard/family" element={<ProtectedRoute><div>Family Dashboard</div></ProtectedRoute>} />
          
          <Route path="/careneeds/family" element={<ProtectedRoute><CareNeedsPage /></ProtectedRoute>} />
          <Route path="/family/legacy-stories" element={<LegacyStoriesPage />} />
          <Route path="/family/caregiver-matching" element={<CaregiverMatchingPage />} />
          
          <Route path="*" element={<div>Page Not Found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
