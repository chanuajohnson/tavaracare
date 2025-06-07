import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from "react-router-dom";
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import Account from './pages/Account';
import Home from './pages/Home';
import PricingPage from './pages/PricingPage';
import { Layout } from './components/Layout';
import { SubscriptionProvider } from './components/providers/SubscriptionProvider';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster"
import CarePlanPage from './pages/CarePlanPage';
import FamilyDashboard from './pages/family/FamilyDashboard';
import ProfessionalDashboard from './pages/professional/ProfessionalDashboard';
import CommunityDashboard from './pages/community/CommunityDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import FeedbackPage from './pages/FeedbackPage';
import AdminFeedbackPage from './pages/admin/AdminFeedbackPage';
import UserJourneyPage from './pages/admin/UserJourneyPage';
import AdminVisitSchedulePage from "./pages/admin/AdminVisitSchedulePage";

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const session = useSession();
  const supabase = useSupabaseClient();

  useEffect(() => {
    const initialize = async () => {
      // Check Supabase connection
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) {
        console.error("Failed to connect to Supabase:", error);
        // Handle connection error (e.g., display a message to the user)
      } else {
        console.log("Successfully connected to Supabase.");
      }

      setIsInitialized(true);
    };

    initialize();
  }, [supabase]);

  return (
    <SubscriptionProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route
              path="/account"
              element={
                !session ? (
                  <Navigate to="/login" replace />
                ) : (
                  <Account key={session.user.id} session={session} />
                )
              }
            />
            <Route path="/care-plan/:carePlanId" element={<CarePlanPage />} />
             {/* Family Routes */}
            <Route
              path="/family/dashboard"
              element={
                !session ? (
                  <Navigate to="/login" replace />
                ) : (
                  <FamilyDashboard key={session.user.id} session={session} />
                )
              }
            />

            {/* Professional Routes */}
            <Route
              path="/professional/dashboard"
              element={
                !session ? (
                  <Navigate to="/login" replace />
                ) : (
                  <ProfessionalDashboard key={session.user.id} session={session} />
                )
              }
            />

            {/* Community Routes */}
            <Route
              path="/community/dashboard"
              element={
                !session ? (
                  <Navigate to="/login" replace />
                ) : (
                  <CommunityDashboard key={session.user.id} session={session} />
                )
              }
            />

            {/* Admin Routes */}
           <Route
              path="/admin/dashboard"
              element={
                !session ? (
                  <Navigate to="/login" replace />
                ) : (
                  <AdminDashboard key={session.user.id} session={session} />
                )
              }
            />
            <Route path="/admin/feedback" element={<AdminFeedbackPage />} />
            <Route path="/admin/user-journey" element={<UserJourneyPage />} />
            <Route path="/admin/visit-schedule" element={<AdminVisitSchedulePage />} />

            <Route
              path="/login"
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                  <div className="max-w-md w-full space-y-8">
                    <div>
                      <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                      </h2>
                      <p className="mt-2 text-center text-sm text-gray-600">
                        Or{' '}
                        <Link
                          to="/pricing"
                          className={cn(
                            buttonVariants({
                              variant: "link",
                              className: "gap-1 underline-offset-4 transition-colors hover:text-foreground",
                            })
                          )}
                        >
                          start your free trial
                        </Link>
                      </p>
                    </div>
                    <Auth
                      supabaseClient={supabase}
                      appearance={{ theme: ThemeSupa }}
                      providers={['google', 'facebook']}
                      redirectTo={`${window.location.origin}/account`}
                    />
                  </div>
                </div>
              }
            />
            <Route
              path="/register"
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                  <div className="max-w-md w-full space-y-8">
                    <div>
                      <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                      </h2>
                    </div>
                    <Auth
                      supabaseClient={supabase}
                      appearance={{ theme: ThemeSupa }}
                      providers={['google', 'facebook']}
                      redirectTo={`${window.location.origin}/account`}
                      onlyThirdPartyProviders={true}
                    />
                  </div>
                </div>
              }
            />
          </Routes>
        </Layout>
        <Toaster />
      </Router>
    </SubscriptionProvider>
  );
}

export default App;
