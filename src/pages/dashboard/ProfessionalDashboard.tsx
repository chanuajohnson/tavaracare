
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { NextStepsPanel } from "@/components/professional/NextStepsPanel";
import { CaregiverHealthCard } from "@/components/professional/CaregiverHealthCard";
import { TrainingProgressTracker } from "@/components/professional/TrainingProgressTracker";
import { ProfessionalShortcutMenuBar } from "@/components/professional/ProfessionalShortcutMenuBar";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Briefcase, ChevronDown, ChevronUp } from "lucide-react";
import { UserJourneyTracker } from "@/components/tracking/UserJourneyTracker";
import { useJourneyTracking } from "@/hooks/useJourneyTracking";
import { useState } from "react";

const ProfessionalDashboard = () => {
  const { user } = useAuth();
  const [isHealthCardExpanded, setIsHealthCardExpanded] = useState(false);

  const breadcrumbItems = [
    {
      label: "Dashboard",
      path: "/dashboard/professional",
    },
  ];

  // Track professional dashboard visits
  useJourneyTracking({
    journeyStage: "professional_dashboard_visit",
    additionalData: {
      professional_section: "main_dashboard"
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Show shortcut menu only for logged-in users */}
      {user && <ProfessionalShortcutMenuBar />}
      
      <div className="container px-4 py-8">
        <UserJourneyTracker 
          journeyStage="professional_section_view" 
          additionalData={{ section: "professional_dashboard" }}
        />
        
        <DashboardHeader
          breadcrumbItems={breadcrumbItems}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Professional Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to your professional caregiving hub</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Next Steps Panel */}
            <NextStepsPanel />
            
            {/* Collapsible Caregiver Health Card - Only for logged-in users */}
            {user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
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
            )}

            {/* Professional Agency Card - Updated redirect */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    Professional Agency
                  </CardTitle>
                  <CardDescription>
                    Connect with Tavara's professional network and access agency features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Join our professional agency network for enhanced opportunities, 
                    training programs, and direct placement services.
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
            {/* Training Progress Tracker - Only for logged-in users */}
            {user && <TrainingProgressTracker />}
            
            {/* Admin Assistant Card - Updated redirect */}
            {user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="border-l-4 border-l-green-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Users className="h-5 w-5 text-green-600" />
                      Admin Assistant
                    </CardTitle>
                    <CardDescription>
                      Get help with platform features and training resources
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Access administrative tools, training materials, and get assistance with platform features.
                    </p>
                    <Link to="/professional/profile?tab=admin-assistant">
                      <Button className="bg-green-600 hover:bg-green-700 text-white w-full">
                        Access Admin Assistant
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
