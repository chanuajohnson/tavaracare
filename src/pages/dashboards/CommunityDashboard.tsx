
import { motion } from "framer-motion";
import { useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Calendar, Heart, UserCog } from "lucide-react";
import { UpvoteFeatureButton } from "@/components/features/UpvoteFeatureButton";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { TechInnovatorsHub } from "@/components/features/TechInnovatorsHub";
import { CommunityShortcutMenuBar } from "@/components/community/CommunityShortcutMenuBar";

const CommunityDashboard = () => {
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
  
  const breadcrumbItems = [{
    label: "Community",
    path: "/dashboard/community"
  }];
  
  return (
    <div className="min-h-screen bg-background">
      {user && <CommunityShortcutMenuBar />}
      
      <div className="container px-4 py-8">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {!user ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-8 border border-blue-100">
              <h2 className="text-2xl font-bold mb-2">Join the Movement! 🌍 Supporting Care, Together.</h2>
              <p className="text-gray-600 mb-4">Help families, participate in care circles, and engage with the growing community</p>
              <div className="flex flex-wrap gap-3 mt-4">
                <Link to="/auth">
                  <Button variant="default" size="sm">
                    Find Care Circles
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="outline" size="sm">
                    Join Events
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="outline" size="sm">
                    Get Involved
                  </Button>
                </Link>
              </div>
            </div>
          ) : null}

          <h1 className="text-3xl font-bold">Community Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Connect and contribute to your local care community.
          </p>
        </motion.div>

        <div className="grid gap-6 mt-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="mb-4">
                  <UserCog className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Profile Management</CardTitle>
                <CardDescription>
                  Manage your community profile and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 mb-4 text-left">
                  <p className="text-sm text-gray-600">Update Personal Information</p>
                  <p className="text-sm text-gray-600">Set Community Preferences</p>
                  <p className="text-sm text-gray-600">Manage Notification Settings</p>
                  <p className="text-sm text-gray-600">Update Privacy Settings</p>
                </div>
                <Link to="/registration/community">
                  <Button className="w-full flex items-center justify-center">
                    Manage Profile
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <UpvoteFeatureButton featureTitle="Community Profile Management" buttonText="Upvote this Feature" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Join Care Circles</CardTitle>
                <CardDescription>
                  Connect with families and other community members
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link to="/features#community-features">
                  <Button className="w-full flex items-center justify-center">
                    Find Circles
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <UpvoteFeatureButton featureTitle="Care Circles" buttonText="Upvote this Feature" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Community Events</CardTitle>
                <CardDescription>
                  Discover and participate in local care events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link to="/features#community-features">
                  <Button className="w-full flex items-center justify-center">
                    View Events
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <UpvoteFeatureButton featureTitle="Community Events" buttonText="Upvote this Feature" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Support Network</CardTitle>
                <CardDescription>
                  Offer and receive community support
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link to="/features#community-features">
                  <Button className="w-full flex items-center justify-center">
                    Get Involved
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <UpvoteFeatureButton featureTitle="Support Network" buttonText="Upvote this Feature" />
              </CardContent>
            </Card>

            <TechInnovatorsHub />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityDashboard;
