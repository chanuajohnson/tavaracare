import { motion } from "framer-motion";
import { useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Heart, UserPlus, MessageSquare, CheckCircle2 } from "lucide-react";
import { UpvoteFeatureButton } from "@/components/features/UpvoteFeatureButton";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { FamilyNextStepsPanel } from "@/components/family/FamilyNextStepsPanel";
import { DashboardCaregiverMatches } from "@/components/family/DashboardCaregiverMatches";
import { CaregiverMatchingCard } from "@/components/family/CaregiverMatchingCard";
import { FamilyShortcutMenuBar } from "@/components/family/FamilyShortcutMenuBar";
import { TellTheirStoryCard } from "@/components/family/TellTheirStoryCard";
import { FamilyProfileHeaderSection } from "@/components/family/FamilyProfileHeaderSection";

const FamilyDashboard = () => {
  const { user } = useAuth();

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
      label: "Family Dashboard",
      path: "/dashboard/family",
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
          <h1 className="text-3xl font-bold">Family Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your care needs and connect with trusted caregivers.
          </p>
        </motion.div>

        {/* Quick Access Menu Bar - Only show when user is logged in */}
        {user && <FamilyShortcutMenuBar />}

        {/* Family Profile Header - Only show when user is logged in */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mt-8"
          >
            <FamilyProfileHeaderSection />
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
                <h2 className="text-2xl font-bold">Welcome to Tavara! 🏠 Your Family Care Hub.</h2>
                <p className="mt-2 text-gray-600">
                  Connect with trusted caregivers, manage care plans, and get the support your family needs.
                </p>
                
                <div className="flex flex-wrap gap-3 mt-6">
                  <Link to="/auth">
                    <Button variant="default" size="sm">
                      Find Caregivers
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button variant="outline" size="sm">
                      Create Care Plan
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button variant="outline" size="sm">
                      Explore Features
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}

        {/* Next Steps Panel and Tell Their Story - side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <FamilyNextStepsPanel />
          <TellTheirStoryCard />
        </div>

        {/* Caregiver Matching Card */}
        <CaregiverMatchingCard />

        {/* Family Matches Section */}
        <div className="mt-8">
          <DashboardCaregiverMatches />
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Community Support - Hide for logged in users */}
            {!user && (
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Community Support
                  </CardTitle>
                  <CardDescription>
                    Connect with other families and support networks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 mb-4 text-left">
                    <p className="text-sm text-gray-600">Join Family Support Groups</p>
                    <p className="text-sm text-gray-600">Share Resources</p>
                    <p className="text-sm text-gray-600">Get Advice</p>
                    <p className="text-sm text-gray-600">Build Connections</p>
                  </div>
                  <Link to="/features">
                    <Button 
                      variant="default"
                      className="w-full bg-primary hover:bg-primary-600 text-white"
                    >
                      Find Support
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <div className="pt-4">
                    <UpvoteFeatureButton
                      featureTitle="Community Support Features"
                      buttonText="Upvote this Feature"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Care Assessment - Hide for logged in users */}
            {!user && (
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Care Assessment
                  </CardTitle>
                  <CardDescription>
                    Understand your care needs better
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 mb-4 text-left">
                    <p className="text-sm text-gray-600">Complete Care Assessment</p>
                    <p className="text-sm text-gray-600">Get Personalized Recommendations</p>
                    <p className="text-sm text-gray-600">Plan Care Strategy</p>
                    <p className="text-sm text-gray-600">Track Care Goals</p>
                  </div>
                  <Link to="/family/care-needs-assessment">
                    <Button 
                      variant="default"
                      className="w-full bg-primary hover:bg-primary-600 text-white"
                    >
                      Start Assessment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <div className="pt-4">
                    <UpvoteFeatureButton
                      featureTitle="Care Assessment Tools"
                      buttonText="Upvote this Feature"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Resource Library - Hide for logged in users */}
            {!user && (
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Resource Library
                  </CardTitle>
                  <CardDescription>
                    Access helpful guides and information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 mb-4 text-left">
                    <p className="text-sm text-gray-600">Care Guides</p>
                    <p className="text-sm text-gray-600">Educational Materials</p>
                    <p className="text-sm text-gray-600">Best Practices</p>
                    <p className="text-sm text-gray-600">Expert Advice</p>
                  </div>
                  <Link to="/features">
                    <Button 
                      variant="default"
                      className="w-full bg-primary hover:bg-primary-600 text-white"
                    >
                      Browse Resources
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <div className="pt-4">
                    <UpvoteFeatureButton
                      featureTitle="Resource Library"
                      buttonText="Upvote this Feature"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Care Management - Full Width at Bottom */}
        <div className="mt-8">
          <Card className="bg-white shadow-sm w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Care Management
              </CardTitle>
              <CardDescription>
                Organize and manage care for your loved ones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium text-gray-900">Create Care Plans</p>
                  <p className="text-xs text-gray-600 mt-1">Organize care activities</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium text-gray-900">Schedule Care Activities</p>
                  <p className="text-xs text-gray-600 mt-1">Plan daily routines</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium text-gray-900">Track Progress</p>
                  <p className="text-xs text-gray-600 mt-1">Monitor care goals</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium text-gray-900">Coordinate with Caregivers</p>
                  <p className="text-xs text-gray-600 mt-1">Seamless communication</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Link to="/family/care-management" className="flex-1">
                  <Button 
                    variant="default"
                    className="w-full bg-primary hover:bg-primary-600 text-white"
                  >
                    Manage Care
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <div className="flex-shrink-0">
                  <UpvoteFeatureButton
                    featureTitle="Care Management Tools"
                    buttonText="Upvote this Feature"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FamilyDashboard;
