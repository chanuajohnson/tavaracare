import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, UserCog, Building, Users, ChevronDown, ChevronUp, Heart, Calendar, User, MessageCircle, DollarSign, X } from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { EnhancedFamilyNextStepsPanel } from "@/components/family/EnhancedFamilyNextStepsPanel";
import { useFamilyStage } from "@/hooks/useFamilyStage";
import { FamilyReadinessQuickAccess } from "@/components/family/FamilyReadinessQuickAccess";
import { readQuizProgress, countAnswered } from "@/data/familyReadinessQuiz";
import { CaregiverReadinessCard } from "@/components/family/CaregiverReadinessCard";
import { FamilyReadinessChecker } from "@/components/family/FamilyReadinessChecker";
import { FamilyShortcutMenuBar } from "@/components/family/FamilyShortcutMenuBar";
import { DailyCareQuickView } from "@/components/family/DailyCareQuickView";
import { SchedulingStatusBanner } from "@/components/family/SchedulingStatusBanner";
import { ScheduleVisitModal } from "@/components/family/ScheduleVisitModal";
import { ProfessionalChatRequestsSection } from "@/components/family/ProfessionalChatRequestsSection";
import { FamilyMatchNotification } from "@/components/family/FamilyMatchNotification";
import { LeadCaptureModal } from "@/components/family/LeadCaptureModal";
import { CaregiverMatchingModal } from "@/components/family/CaregiverMatchingModal";
import { useEnhancedJourneyProgress } from "@/hooks/useEnhancedJourneyProgress";
import { toast } from "sonner";

/**
 * Soft banner inviting families who haven't taken the readiness quiz to do so.
 * Hidden once `client_stage` is set in their profile or localStorage.
 * Becomes progress-aware when in-progress quiz data exists.
 */
const ReadinessQuizBanner = () => {
  const { hasStage, isLoading } = useFamilyStage();
  const [progressInfo, setProgressInfo] = useState<{ answered: number; total: number } | null>(null);

  useEffect(() => {
    const p = readQuizProgress();
    if (p) {
      const answered = countAnswered(p.answers);
      if (answered > 0 && answered < p.answers.length) {
        setProgressInfo({ answered, total: p.answers.length });
      }
    }
  }, []);

  if (isLoading || hasStage) return null;

  const hasProgress = !!progressInfo;
  return (
    <Link
      to="/family/readiness-quiz"
      className="block mt-6 rounded-lg border-l-4 border-l-primary bg-primary/5 hover:bg-primary/10 transition-colors px-4 py-3"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            {hasProgress
              ? `Finish your readiness check (${progressInfo!.answered} of ${progressInfo!.total} answered)`
              : "How are you doing today?"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {hasProgress
              ? "Pick up where you left off — about 30 seconds to finish."
              : "Take a 60-second emotional check-in so we can meet you where you actually are — not where the platform assumes."}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 text-primary shrink-0" />
      </div>
    </Link>
  );
};

/**
 * Stage-4-only nudge: families past the basics often just need someone to
 * keep the house stocked. Dismissible, persisted in localStorage.
 */
const STAGE4_SUPPLY_NUDGE_KEY = "tavara_stage4_supply_nudge_dismissed";
const Stage4SupplyNudge = () => {
  const { stage, hasStage, isLoading } = useFamilyStage();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(STAGE4_SUPPLY_NUDGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  if (isLoading || !hasStage || stage !== 4 || dismissed) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      localStorage.setItem(STAGE4_SUPPLY_NUDGE_KEY, "true");
    } catch {
      // ignore
    }
    setDismissed(true);
  };

  return (
    <Link
      to="/errands#supplies"
      className="block mt-4 rounded-lg border-l-4 border-l-rose-500 bg-rose-50/70 hover:bg-rose-100/70 transition-colors px-4 py-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            📦 Tired of holding the list?
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Set up recurring delivery for groceries, meds, and household consumables. We deliver on your schedule.
          </p>
          <p className="text-xs font-medium text-rose-700 mt-1.5 inline-flex items-center gap-1">
            Set it up <ArrowRight className="h-3 w-3" />
          </p>
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="text-muted-foreground hover:text-foreground shrink-0 -mt-1 -mr-1 p-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </Link>
  );
};

const FamilyDashboard = () => {
  const { user } = useAuth();
  const [isWelcomeCardExpanded, setIsWelcomeCardExpanded] = useState(false);
  
  // Phase 1A: Lead Capture Modal state
  const [showLeadCaptureModal, setShowLeadCaptureModal] = useState(false);
  const [leadCaptureSource, setLeadCaptureSource] = useState('');
  
  // Dashboard-level caregiver matching modal state
  const [showDashboardCaregiverModal, setShowDashboardCaregiverModal] = useState(false);
  
  // Get modal state and journey data from the hook
  const { setShowCaregiverMatchingModal, visitDetails, steps, agreedRate, weeklyHours, projectedWeeklyCost } = useEnhancedJourneyProgress();
  
  // Schedule modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showRateInfo, setShowRateInfo] = useState(() => {
    return localStorage.getItem('tavara_rate_info_dismissed') !== 'true';
  });
  
  // Check if user has caregiver matches (step 7 completed)
  const caregiverMatchesStep = steps.find(s => s.step_number === 7);
  const hasMatches = !!caregiverMatchesStep?.completed;
  
  // Check if caregiver is already assigned (step 9) or care model chosen (step 15)
  const caregiverAssignedStep = steps.find(s => s.step_number === 9);
  const careModelStep = steps.find(s => s.step_number === 15);
  const hasCaregiverAssigned = !!caregiverAssignedStep?.completed || !!careModelStep?.completed;
  
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ 
        top: 0, 
        left: 0, 
        behavior: 'instant' 
      });
    };
    
    scrollToTop();
    setTimeout(scrollToTop, 50);
    setTimeout(scrollToTop, 150);
  }, []);
  
  const handleLeadCaptureClick = (source: string) => {
    setLeadCaptureSource(source);
    setShowLeadCaptureModal(true);
  };
  
  const handleSkipToCaregiverMatching = () => {
    setShowCaregiverMatchingModal(true);
  };

  // New handler for dashboard-level caregiver matches modal
  const handleQuickAccessCaregiverMatches = () => {
    setShowDashboardCaregiverModal(true);
  };

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

        {/* Quick Access Menu Bar - Pass the dashboard caregiver matches handler */}
        {user && (
          <FamilyShortcutMenuBar 
            onCaregiverMatchesClick={handleQuickAccessCaregiverMatches} 
            onScheduleCareClick={() => setShowScheduleModal(true)}
          />
        )}

        {/* Readiness check — emotional check-in. Positioned high so families
            see it before scrolling. Only one of ReadinessQuizBanner /
            FamilyReadinessQuickAccess renders at a time (gated on hasStage),
            and Stage4SupplyNudge only appears at stage 4. */}
        {user && <ReadinessQuizBanner />}

        {/* Daily Care Quick View — today's meds & nurse logs */}
        <DailyCareQuickView />

        {user && <FamilyReadinessQuickAccess />}
        {user && <Stage4SupplyNudge />}

        {/* Rate Information Blurb */}
        {showRateInfo && (
          <div className="mt-4">
            <Collapsible defaultOpen={false}>
              <Card className="bg-blue-50 border-blue-200 relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground z-10"
                  onClick={() => {
                    setShowRateInfo(false);
                    localStorage.setItem('tavara_rate_info_dismissed', 'true');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
                <CollapsibleTrigger asChild>
                  <button className="w-full text-left">
                    <CardContent className="p-4 pr-10">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-blue-100 rounded-lg shrink-0">
                          <DollarSign className="h-5 w-5 text-blue-700" />
                        </div>
                        <div className="flex-1">
                        <h4 className="font-semibold text-blue-900">
                          {agreedRate ? 'Your Agreed Care Rate' : 'Tavara Care Rates'}
                        </h4>
                        <p className="text-sm text-blue-600">
                          {agreedRate 
                            ? `${agreedRate}${weeklyHours ? ` · ${weeklyHours} hrs/wk` : ''}${projectedWeeklyCost ? ` · ~$${projectedWeeklyCost.toLocaleString()}/wk` : ''}`
                            : '$40–$50+/hr · Click to view tier details'
                          }
                        </p>
                        </div>
                        <ChevronDown className="h-4 w-4 text-blue-600 shrink-0 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
                      </div>
                    </CardContent>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 px-4 pb-4">
                    <div className="space-y-1 text-sm border-t border-blue-200 pt-3 ml-10">
                      <p><span className="font-medium text-blue-800">$40/hr — Standard:</span> <span className="text-blue-700">GAPP-certified personal care, medication admin &amp; logging, vitals monitoring, basic daily dietary meal prep, daily care documentation, specialized care (dementia, palliative, post-surgical)</span></p>
                      <p><span className="font-medium text-blue-800">$45/hr — Full Service (Recommended):</span> <span className="text-blue-700">Everything in Standard + specialist-directed meal prep (holidays &amp; special occasions), complex medical needs (wound/catheter/oxygen care), overnight/live-in shifts, advanced certifications (RN, LPN)</span></p>
                      <p><span className="font-medium text-blue-800">$50+/hr — Premium:</span> <span className="text-blue-700">Everything in Full Service + care plan change management, disease progression support, multi-specialist coordination, 24/7 on-call, advanced palliative/end-of-life care, family training &amp; transition planning</span></p>
                      <p className="text-xs text-blue-600 pt-1">These rates reflect the professional standards of certified caregivers in Trinidad &amp; Tobago.</p>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>
        )}

        {user && (
          <div className="mt-4">
            <FamilyMatchNotification />
          </div>
        )}

        {/* Scheduling status banner — amber CTA or green confirmation */}
        {user && (
          <div className="mt-4">
            <SchedulingStatusBanner
              hasMatches={hasMatches}
              visitDetails={visitDetails}
              onScheduleClick={() => setShowScheduleModal(true)}
              hasCaregiverAssigned={hasCaregiverAssigned}
            />
          </div>
        )}

        {/* Caregiver Readiness Card — shows onboarding progress of assigned professional */}
        {user && (
          <div className="mt-4">
            <CaregiverReadinessCard />
          </div>
        )}

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

        {/* Readiness elements moved up — see directly after DailyCareQuickView */}

        <div className="mt-8">
          <EnhancedFamilyNextStepsPanel />
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
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

        <div className="mt-8" id="family-caregiver-matches">
          <FamilyReadinessChecker />
        </div>

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

        {/* Dashboard-level Caregiver Matching Modal */}
        <CaregiverMatchingModal
          open={showDashboardCaregiverModal}
          onOpenChange={setShowDashboardCaregiverModal}
          referringPagePath="/dashboard/family"
          referringPageLabel="Family Dashboard"
        />

        {/* Schedule Visit Modal */}
        <ScheduleVisitModal
          open={showScheduleModal}
          onOpenChange={setShowScheduleModal}
        />
      </div>
    </div>
  );
};

export default FamilyDashboard;
