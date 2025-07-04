import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, UserCog, Building, Users, ChevronDown, ChevronUp, Heart, Calendar, User, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { EnhancedFamilyNextStepsPanel } from "@/components/family/EnhancedFamilyNextStepsPanel";
import { FamilyReadinessChecker } from "@/components/family/FamilyReadinessChecker";
import { FamilyShortcutMenuBar } from "@/components/family/FamilyShortcutMenuBar";
import { ProfessionalChatRequestsSection } from "@/components/family/ProfessionalChatRequestsSection";
import { LeadCaptureModal } from "@/components/family/LeadCaptureModal";
import { CaregiverMatchingModal } from "@/components/family/CaregiverMatchingModal";
import { toast } from "sonner";

const FamilyDashboard = () => {
  const { user } = useAuth();
  const [isWelcomeCardExpanded, setIsWelcomeCardExpanded] = useState(false);
  
  // Phase 1A: Lead Capture Modal state
  const [showLeadCaptureModal, setShowLeadCaptureModal] = useState(false);
  const [leadCaptureSource, setLeadCaptureSource] = useState('');
  
  // Phase 1B: Caregiver Matching Modal state
  const [showCaregiverModal, setShowCaregiverModal] = useState(false);
  
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
  
  // Phase 1A: Handle lead capture modal triggers
  const handleLeadCaptureClick = (source: string) => {
    setLeadCaptureSource(source);
    setShowLeadCaptureModal(true);
  };
  
  // Phase 1B: Handle caregiver matching modal trigger
  const handleCaregiverMatchingClick = () => {
    setShowCaregiverModal(true);
  };
  
  // Phase 1B: Handle skip from lead capture to caregiver matching
  const handleSkipToCaregiverMatching = () => {
    setShowCaregiverModal(true);
  };

  // Handler for Family Resources "Coming Soon" toast
  const handleAccessResourcesClick = () => {
    toast.info("Coming Soon", {
      description: "Family resources and support tools are currently being developed and will be available soon."
    });
  };
  
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
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Family Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Your central hub for managing care, connecting with caregivers, and accessing support.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Access Menu Bar - Only show when user is logged in */}
        {user && <FamilyShortcutMenuBar />}

        {/* Professional Chat Requests Section - Only for logged-in users */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8"
          >
            <ProfessionalChatRequestsSection />
          </motion.div>
        )}

        {!user ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="my-8"
          >
            <Card className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-lg border border-pink-100">
              <CardContent className="p-0">
                <h2 className="text-2xl font-bold">Welcome to Tavara! 💝 Your Family Care Hub.</h2>
                <p className="mt-2 text-gray-600">
                  We're here to support your family's caregiving journey. Connect with trusted caregivers, manage care plans, and access resources designed specifically for families like yours.
                </p>
                
                <div className="flex flex-wrap gap-3 mt-6">
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => handleLeadCaptureClick('family_dashboard_find_caregivers')}
                  >
                    Find Caregivers
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleLeadCaptureClick('family_dashboard_create_plan')}
                  >
                    Create Care Plan
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleAccessResourcesClick}
                  >
                    Access Resources
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}

        {/* Enhanced Family Journey Progress - Real Data */}
        <div className="mt-8">
          <EnhancedFamilyNextStepsPanel />
        </div>

        {/* Collapsible Welcome & Support Card - Only for logged-in users */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8"
          >
            <Card className="border-l-4 border-l-pink-300">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl text-pink-800">Family Care Support</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsWelcomeCardExpanded(!isWelcomeCardExpanded)}
                    className="p-1 h-8 w-8"
                  >
                    {isWelcomeCardExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <CardDescription className="text-pink-600">
                  Resources and support for your family's caregiving journey
                </CardDescription>
              </CardHeader>
              {isWelcomeCardExpanded && (
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-medium text-pink-800">Quick Actions</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <User className="h-4 w-4 text-pink-600" />
                          <span>Update your care recipient's profile</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-pink-600" />
                          <span>Schedule a care assessment visit</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-pink-600" />
                          <span>Connect with verified caregivers</span>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium text-pink-800">Support Resources</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• 24/7 emergency support hotline</li>
                        <li>• Family caregiver support groups</li>
                        <li>• Care planning guides and checklists</li>
                        <li>• Insurance and financial assistance info</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        )}

        {/* Care Management and Resources - side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          
          {/* Care Management Card */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                Care Management
              </CardTitle>
              <CardDescription>
                Manage your family's care plans and caregivers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 mb-4 text-left">
                <p className="text-sm text-gray-600">Create and manage care plans</p>
                <p className="text-sm text-gray-600">Schedule care visits and activities</p>
                <p className="text-sm text-gray-600">Track medications and health info</p>
                <p className="text-sm text-gray-600">Coordinate with care team</p>
              </div>
              {user ? (
                <Link to="/family/care-management">
                  <Button 
                    variant="default"
                    className="w-full bg-primary hover:bg-primary-600 text-white"
                  >
                    Manage Care Plans
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Button 
                  variant="default"
                  className="w-full bg-primary hover:bg-primary-600 text-white"
                  onClick={() => handleLeadCaptureClick('family_dashboard_manage_care')}
                >
                  Manage Care Plans
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Family Resources */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Family Resources
              </CardTitle>
              <CardDescription>
                Access helpful resources and support tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4 text-left">
                <p className="text-sm text-gray-600">Caregiver guides and checklists</p>
                <p className="text-sm text-gray-600">Insurance and financial assistance</p>
                <p className="text-sm text-gray-600">Emergency contacts and procedures</p>
                <p className="text-sm text-gray-600">Support group connections</p>
              </div>
              <Button 
                variant="default"
                className="w-full bg-primary hover:bg-primary-600 text-white"
                onClick={handleAccessResourcesClick}
              >
                Access Resources
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Family Readiness Checker - Replaces DashboardCaregiverMatches */}
        <div className="mt-8">
          <FamilyReadinessChecker />
        </div>

        {/* Community Support */}
        <div className="mt-8">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Community Support
              </CardTitle>
              <CardDescription>
                Connect with other families and community resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-4 text-left">
                <div className="p-3 bg-gray-50 rounded-md">
                  <h4 className="font-medium text-sm">Family Support Groups</h4>
                  <p className="text-xs text-gray-600 mt-1">Connect with other families facing similar caregiving challenges and share experiences.</p>
                  <p className="text-xs text-gray-500 mt-1">Status: Available</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-md">
                  <h4 className="font-medium text-sm">Community Resources</h4>
                  <p className="text-xs text-gray-600 mt-1">Access local resources, volunteer programs, and community support services.</p>
                  <p className="text-xs text-gray-500 mt-1">Status: Available</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-md">
                  <h4 className="font-medium text-sm">Educational Workshops</h4>
                  <p className="text-xs text-gray-600 mt-1">Attend workshops on caregiving topics, health management, and family wellness.</p>
                  <p className="text-xs text-gray-500 mt-1">Status: Coming Soon</p>
                </div>
              </div>
              
              {user ? (
                <Link to="/community">
                  <Button 
                    variant="default"
                    className="w-full bg-primary hover:bg-primary-600 text-white"
                  >
                    Explore Community
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Button 
                  variant="default"
                  className="w-full bg-primary hover:bg-primary-600 text-white"
                  onClick={() => handleLeadCaptureClick('family_dashboard_explore_community')}
                >
                  Explore Community
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Phase 1A: Lead Capture Modal */}
        <LeadCaptureModal
          open={showLeadCaptureModal}
          onOpenChange={setShowLeadCaptureModal}
          source={leadCaptureSource}
          onSkipToCaregiverMatching={handleSkipToCaregiverMatching}
        />

        {/* Phase 1B: Caregiver Matching Modal */}
        <CaregiverMatchingModal
          open={showCaregiverModal}
          onOpenChange={setShowCaregiverModal}
          referringPagePath="/dashboard/family"
          referringPageLabel="Family Dashboard"
        />
      </div>
    </div>
  );
};

export default FamilyDashboard;
