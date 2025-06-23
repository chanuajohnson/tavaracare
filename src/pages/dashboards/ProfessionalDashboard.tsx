import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, UserCog, Building, Users, ChevronDown, ChevronUp, TrendingUp } from "lucide-react";
import { UpvoteFeatureButton } from "@/components/features/UpvoteFeatureButton";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { EnhancedProfessionalNextStepsPanel } from "@/components/professional/EnhancedProfessionalNextStepsPanel";
import { DashboardFamilyMatches } from "@/components/professional/DashboardFamilyMatches";
import { CaregiverMatchingCard } from "@/components/professional/CaregiverMatchingCard";
import { ProfessionalShortcutMenuBar } from "@/components/professional/ProfessionalShortcutMenuBar";
import { CaregiverHealthCard } from "@/components/professional/CaregiverHealthCard";
import { ChatRequestsSection } from "@/components/professional/ChatRequestsSection";

const ProfessionalDashboard = () => {
  const { user } = useAuth();
  const [isHealthCardExpanded, setIsHealthCardExpanded] = useState(false);
  
  // Ensure dashboard always loads at the top with enhanced scroll behavior
  useEffect(() => {
    // Use a small delay to ensure DOM is fully rendered
    const scrollToTop = () => {
      window.scrollTo({ 
        top: 0, 
        left: 0, 
        behavior: 'instant' 
      });
    };
    
    // Immediate scroll
    scrollToTop();
    
    // Additional delayed scroll to ensure it takes effect
    setTimeout(scrollToTop, 50);
    setTimeout(scrollToTop, 150);
  }, []);
  
  const breadcrumbItems = [
    {
      label: "Professional Dashboard",
      path: "/dashboard/professional",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Professional Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Track your journey to caregiving excellence and manage your professional development.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Access Menu Bar - Only show when user is logged in */}
        {user && <ProfessionalShortcutMenuBar />}

        {/* Add Chat Requests Section - Only for logged-in users */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8"
          >
            <ChatRequestsSection />
          </motion.div>
        )}

        {!user ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="my-8"
          >
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
              <CardContent className="p-0">
                <h2 className="text-2xl font-bold">Welcome to Tavara! 🚀 Your Care Coordination Hub.</h2>
                <p className="mt-2 text-gray-600">
                  We're building this platform with you in mind. Explore features, connect with clients, and help shape the future of care by voting on features!
                </p>
                
                <div className="flex flex-wrap gap-3 mt-6">
                  <Link to="/auth">
                    <Button variant="default" size="sm">
                      View Professional Tools
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button variant="outline" size="sm">
                      Connect with Clients
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button variant="outline" size="sm">
                      Upvote Features
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}

        {/* Enhanced Professional Journey Progress - Real Data */}
        <div className="mt-8">
          <EnhancedProfessionalNextStepsPanel />
        </div>

        {/* Collapsible Caregiver Health Card - Only for logged-in users */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8"
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

        {/* Profile Management and Features - side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          
          {/* Profile Management Card */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                Profile Management
              </CardTitle>
              <CardDescription>
                Manage your professional profile and qualifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 mb-4 text-left">
                <p className="text-sm text-gray-600">Update Personal Information</p>
                <p className="text-sm text-gray-600">Manage Professional Credentials</p>
                <p className="text-sm text-gray-600">Update Skills & Experience</p>
                <p className="text-sm text-gray-600">Set Availability & Preferences</p>
              </div>
              <Link to="/professional/profile">
                <Button 
                  variant="default"
                  className="w-full bg-primary hover:bg-primary-600 text-white"
                >
                  View Profile Hub
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
             {/*   <div className="pt-4">
                <UpvoteFeatureButton
                  featureTitle="Professional Profile Management"
                  buttonText="Upvote this Feature"
                />
              </div>*/}
            </CardContent>
          </Card>

          {/* Admin Assistant */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Admin Assistant
              </CardTitle>
              <CardDescription>
                Streamline your administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4 text-left">
                <p className="text-sm text-gray-600">Get Job Letters</p>
                <p className="text-sm text-gray-600">NIS Registration Assistance</p>
                <p className="text-sm text-gray-600">Document Management</p>
                <p className="text-sm text-gray-600">Administrative Support</p>
              </div>
              <Link to="/professional/profile?tab=admin-assistant">
                <Button 
                  variant="default"
                  className="w-full bg-primary hover:bg-primary-600 text-white"
                >
                  Access Tools
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            {/*  <div className="pt-4">
                <UpvoteFeatureButton
                  featureTitle="Admin Assistant Tools"
                  buttonText="Upvote this Feature"
                />
              </div>*/}
            </CardContent>
          </Card>
        </div>

        <CaregiverMatchingCard />

        {/* Family Matches Section - Add the missing ID here */}
        <div id="family-matches" className="mt-8">
          <DashboardFamilyMatches />
        </div>

        {/* Professional Agency */}
        <div className="mt-8">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Professional Agency
              </CardTitle>
              <CardDescription>
                Agency management features for professional caregivers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-4 text-left">
                <div className="p-3 bg-gray-50 rounded-md">
                  <h4 className="font-medium text-sm">Professional Dashboard (Agency)</h4>
                  <p className="text-xs text-gray-600 mt-1">A comprehensive agency management hub for overseeing caregivers, handling client relationships, and streamlining operations.</p>
                  <p className="text-xs text-gray-500 mt-1">Status: Planned</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-md">
                  <h4 className="font-medium text-sm">Access Professional Tools</h4>
                  <p className="text-xs text-gray-600 mt-1">A resource hub providing administrative tools, job letter requests, and workflow management for caregivers and agencies.</p>
                  <p className="text-xs text-gray-500 mt-1">Status: Planned</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-md">
                  <h4 className="font-medium text-sm">Agency Training & Development Hub</h4>
                  <p className="text-xs text-gray-600 mt-1">A training center for agencies offering certifications, compliance training, and workforce development.</p>
                  <p className="text-xs text-gray-500 mt-1">Status: Planned</p>
                </div>
              </div>
              
              <Link to="/features">
                <Button 
                  variant="default"
                  className="w-full bg-primary hover:bg-primary-600 text-white"
                >
                  Learn About Agency Features
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              
              {/*<div className="pt-4">
                <UpvoteFeatureButton
                  featureTitle="Professional Agency Management"
                  buttonText="Upvote this Feature"
                />
              </div>*/}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
