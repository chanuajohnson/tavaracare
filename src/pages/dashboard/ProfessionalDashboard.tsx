import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { EnhancedProfessionalNextStepsPanel } from "@/components/professional/EnhancedProfessionalNextStepsPanel";
import { CaregiverHealthCard } from "@/components/professional/CaregiverHealthCard";
import { TrainingProgressTracker } from "@/components/professional/TrainingProgressTracker";
import { ProfessionalShortcutMenuBar } from "@/components/professional/ProfessionalShortcutMenuBar";

import { ManualMatchNotification } from "@/components/professional/ManualMatchNotification";
import { CurrentAssignmentsSection } from "@/components/professional/CurrentAssignmentsSection";

import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Briefcase, ChevronDown, ChevronUp, TrendingUp, Target, AlertCircle } from "lucide-react";
import { UserJourneyTracker } from "@/components/tracking/UserJourneyTracker";
import { useJourneyTracking } from "@/hooks/useJourneyTracking";
import { useState, useEffect } from "react";

const ProfessionalDashboard = () => {
  const { user, userRole, isLoading } = useAuth();
  const [isHealthCardExpanded, setIsHealthCardExpanded] = useState(false);
  const [dashboardLoaded, setDashboardLoaded] = useState(false);

  const breadcrumbItems = [
    {
      label: "Dashboard",
      path: "/dashboard/professional",
    },
  ];

  // ENHANCED: Track professional dashboard visits with auth state
  useJourneyTracking({
    journeyStage: "professional_dashboard_visit",
    additionalData: {
      professional_section: "main_dashboard",
      user_id: user?.id,
      user_role: userRole
    }
  });

  // ENHANCED: Dashboard loading state management
  useEffect(() => {
    console.log('[ProfessionalDashboard] Auth state check:', {
      hasUser: !!user,
      userRole,
      userEmail: user?.email,
      isLoading,
      userMetadata: user?.user_metadata
    });

    if (!isLoading && user) {
      // Small delay to ensure all components are ready
      const timer = setTimeout(() => {
        setDashboardLoaded(true);
        console.log('[ProfessionalDashboard] Dashboard marked as loaded');
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [user, userRole, isLoading]);

  // ENHANCED: Show loading state while auth is resolving
  if (isLoading || !dashboardLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading your professional dashboard...</p>
          <p className="text-xs text-gray-400 mt-2">
            {isLoading ? 'Authenticating...' : 'Preparing dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  // ENHANCED: Show auth required message if no user after loading
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to access your professional dashboard.</p>
          <Link to="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  console.log('[ProfessionalDashboard] Rendering dashboard for user:', {
    id: user.id,
    email: user.email,
    role: userRole,
    hasMetadataRole: !!user.user_metadata?.role
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Show shortcut menu for authenticated users */}
      <ProfessionalShortcutMenuBar />
      
      <div className="container px-4 py-8">
        <UserJourneyTracker 
          journeyStage="professional_section_view" 
          additionalData={{ 
            section: "professional_dashboard",
            user_id: user.id,
            user_role: userRole 
          }}
        />
        
        <DashboardHeader breadcrumbItems={breadcrumbItems} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Professional Dashboard</h1>
              <p className="text-gray-600 mt-1">Track your journey to caregiving excellence</p>
              {/* ENHANCED: Add debug info in development */}
              {window.location.hostname.includes('lovable.app') && (
                <p className="text-xs text-blue-600 mt-1">
                  Debug: User {user.email} • Role: {userRole || user.user_metadata?.role || 'Not set'}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Manual Match Notifications */}
            <ManualMatchNotification />
            
            {/* Current Assignments Section */}
            <CurrentAssignmentsSection />
            
            {/* Enhanced Next Steps Panel with Real Data */}
            <EnhancedProfessionalNextStepsPanel />
            
            {/* Collapsible Caregiver Health Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border-l-4 border-l-primary-300">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl text-primary-800">Caregiver Health Support</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsHealthCardExpanded(!isHealthCardExpanded)}
                      className="p-1 h-8 w-8"
                    >
                      {isHealthCardExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <CardDescription className="text-primary-600">
                    Support your well-being while caring for others
                  </CardDescription>
                </CardHeader>
                {isHealthCardExpanded && (
                  <CardContent>
                    <CaregiverHealthCard />
                  </CardContent>
                )}
              </Card>
            </motion.div>

            {/* Professional Agency Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    Professional Agency Network
                  </CardTitle>
                  <CardDescription>
                    Connect with Tavara's professional network and access exclusive opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Join our professional agency network for enhanced opportunities, 
                    training programs, and direct placement services with verified families.
                  </p>
                  <Link to="/features">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Learn About Agency Features
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="space-y-6">
            {/* Training Progress Tracker */}
            <TrainingProgressTracker />
            
            {/* Admin Assistant Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Users className="h-5 w-5 text-green-600" />
                    Admin Assistant
                  </CardTitle>
                  <CardDescription>
                    Get help with platform features and administrative tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Access administrative tools, training materials, and get assistance 
                    with platform features to streamline your professional workflow.
                  </p>
                  <Link to="/professional/profile?tab=admin-assistant">
                    <Button className="bg-green-600 hover:green-700 text-white w-full">
                      Access Admin Assistant
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Professional Insights Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Target className="h-5 w-5 text-purple-600" />
                    Professional Insights
                  </CardTitle>
                  <CardDescription className="text-purple-700">
                    Track your progress and discover growth opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Profile Strength</span>
                      <span className="text-sm font-medium text-purple-600">Building...</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Match Potential</span>
                      <span className="text-sm font-medium text-purple-600">Growing</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Career Stage</span>
                      <span className="text-sm font-medium text-purple-600">Foundation</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4 border-purple-200 text-purple-700 hover:bg-purple-50">
                    View Detailed Insights
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
