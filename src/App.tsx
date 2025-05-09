
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/components/providers/AuthProvider';
import { FeaturesProvider } from '@/components/providers/FeaturesProvider';
import { SubscriptionProvider } from '@/components/providers/SubscriptionProvider';
import { TrackingProvider } from '@/components/providers/TrackingProvider';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from '@/components/analytics/Analytics';
import CareNeedsPage from '@/pages/careneeds';
import { LegacyStoriesPage, CaregiverMatchingPage } from '@/pages/family';
import { RedirectHandler } from '@/components/routing/RedirectHandler';
import { Navigation } from '@/components/layout/Navigation';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Show a loading indicator while checking authentication
  }

  return isLoggedIn ? <>{children}</> : <Navigate to="/auth" />;
};

// Create placeholder pages for essential routes
const LandingPage = () => (
  <div className="container mx-auto p-6">
    <h1 className="text-3xl font-bold mb-4">Welcome to Tavara</h1>
    <p className="text-lg mb-6">It takes a village to care</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">Care Management</h2>
        <p className="mb-4">Manage care plans, coordinate with caregivers, and track progress.</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">Caregiver Matching</h2>
        <p className="mb-4">Find the perfect caregiver for your loved one's specific needs.</p>
      </div>
    </div>
  </div>
);

const AuthPage = () => (
  <div className="container mx-auto p-6 flex justify-center items-center min-h-[80vh]">
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
      <h1 className="text-2xl font-bold mb-4">Sign In</h1>
      <p className="text-gray-600 mb-6">Please sign in to access your account</p>
      <form className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">Email</label>
          <input type="email" className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Password</label>
          <input type="password" className="w-full p-2 border rounded" />
        </div>
        <button className="w-full bg-blue-600 text-white py-2 rounded">Sign In</button>
      </form>
    </div>
  </div>
);

const DashboardPage = () => <div className="container mx-auto p-6"><h1 className="text-2xl font-bold mb-4">Dashboard</h1></div>;
const FamilyDashboardPage = () => <div className="container mx-auto p-6"><h1 className="text-2xl font-bold mb-4">Family Dashboard</h1></div>;

function App() {
  return (
    <AuthProvider>
      <FeaturesProvider>
        <SubscriptionProvider>
          <TrackingProvider>
            <Router>
              <Navigation />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/dashboard/family" element={<ProtectedRoute><FamilyDashboardPage /></ProtectedRoute>} />
                
                <Route path="/careneeds/family" element={<ProtectedRoute><CareNeedsPage /></ProtectedRoute>} />
                
                <Route path="/family/legacy-stories" element={<LegacyStoriesPage />} />
                <Route path="/family/caregiver-matching" element={<CaregiverMatchingPage />} />
                
                <Route path="*" element={<RedirectHandler />} />
              </Routes>
              <Toaster />
              <Analytics />
            </Router>
          </TrackingProvider>
        </SubscriptionProvider>
      </FeaturesProvider>
    </AuthProvider>
  );
}

export default App;
