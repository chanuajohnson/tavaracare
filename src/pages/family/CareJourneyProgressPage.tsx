import React from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Clock, ArrowRight, Users, Heart, Calendar, Star, FileText, Utensils, Pill, Video, Home, List } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ScheduleVisitModal } from "@/components/family/ScheduleVisitModal";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

interface JourneyStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  optional?: boolean;
  link?: string;
  action?: () => void;
  category: 'foundation' | 'scheduling' | 'trial' | 'conversion';
  statusField?: string;
  accessible?: boolean;
}

export default function CareJourneyProgressPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  
  const [journeyData, setJourneyData] = useState({
    visitStatus: 'not_started',
    visitDate: null as string | null,
    carePlans: [] as any[],
    trialCompleted: false,
    careModel: null as string | null,
    subscriptionActive: false
  });

  const [steps, setSteps] = useState<JourneyStep[]>([
    {
      id: 1,
      title: "Complete Your Profile",
      description: "Add your contact information and preferences.",
      icon: <Users className="h-5 w-5" />,
      completed: false,
      category: 'foundation',
      link: "/registration/family",
      statusField: "profile_completed_at",
      accessible: true
    },
    {
      id: 2,
      title: "Complete Initial Care Assessment",
      description: "Help us understand your care needs better.",
      icon: <FileText className="h-5 w-5" />,
      completed: false,
      category: 'foundation',
      link: "/family/care-assessment",
      statusField: "assessment_completed_at",
      accessible: true
    },
    {
      id: 3,
      title: "Complete Your Loved One's Legacy Story",
      description: "Because care is more than tasks—our Legacy Story feature honors the voices, memories, and wisdom of those we care for.",
      icon: <Heart className="h-5 w-5" />,
      completed: false,
      optional: true,
      category: 'foundation',
      link: "/family/story",
      statusField: "legacy_story_submitted_at",
      accessible: true
    },
    {
      id: 4,
      title: "See Your Instant Caregiver Matches",
      description: "Now that your loved one's profile is complete, unlock personalized caregiver recommendations.",
      icon: <Star className="h-5 w-5" />,
      completed: false,
      category: 'foundation',
      link: "/caregiver/matching",
      statusField: "match_viewed_at",
      accessible: false
    },
    {
      id: 5,
      title: "Set Up Medication Management",
      description: "Add medications and set up schedules for your care plan.",
      icon: <Pill className="h-5 w-5" />,
      completed: false,
      category: 'foundation',
      statusField: "medications_added_at",
      accessible: true
    },
    {
      id: 6,
      title: "Set Up Meal Management",
      description: "Plan meals and create grocery lists for your care plan.",
      icon: <Utensils className="h-5 w-5" />,
      completed: false,
      category: 'foundation',
      statusField: "meals_added_at",
      accessible: true
    },
    {
      id: 7,
      title: "Schedule Your Tavara.Care Visit",
      description: "Choose to meet your match and a care coordinator virtually (Free) or in person ($300 TTD).",
      icon: <Calendar className="h-5 w-5" />,
      completed: false,
      category: 'scheduling',
      statusField: "visit_scheduling_status",
      accessible: true
    },
    {
      id: 8,
      title: "Confirm Visit",
      description: "Confirm the video link or complete payment for in-person visit.",
      icon: <CheckCircle2 className="h-5 w-5" />,
      completed: false,
      category: 'scheduling',
      statusField: "visit_confirmed_at",
      accessible: false
    },
    {
      id: 9,
      title: "Schedule Trial Day (Optional)",
      description: "Choose a trial date with your matched caregiver. This is an optional step before choosing your care model.",
      icon: <Clock className="h-5 w-5" />,
      completed: false,
      optional: true,
      category: 'trial',
      statusField: "trial_scheduled_at",
      accessible: false
    },
    {
      id: 10,
      title: "Pay for Trial Day (Optional)",
      description: "Pay a one-time fee of $320 TTD for an 8-hour caregiver experience.",
      icon: <Star className="h-5 w-5" />,
      completed: false,
      optional: true,
      category: 'trial',
      statusField: "trial_day_paid",
      accessible: false
    },
    {
      id: 11,
      title: "Begin Your Trial (Optional)",
      description: "Your caregiver begins the scheduled trial session.",
      icon: <Heart className="h-5 w-5" />,
      completed: false,
      optional: true,
      category: 'trial',
      statusField: "trial_started_at",
      accessible: false
    },
    {
      id: 12,
      title: "Rate & Choose Your Path",
      description: "Decide between: Hire your caregiver ($40/hr) or Subscribe to Tavara ($45/hr) for full support tools. Can skip trial and go directly here after visit confirmation.",
      icon: <ArrowRight className="h-5 w-5" />,
      completed: false,
      category: 'conversion',
      statusField: "trial_completed_at",
      accessible: false
    }
  ]);

  useEffect(() => {
    if (user) {
      loadJourneyProgress();
    }
  }, [user]);

  const loadJourneyProgress = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get profile data including visit status
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Get care assessment
      const { data: careAssessment } = await supabase
        .from('care_needs_family')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle();

      // Get care recipient profile  
      const { data: careRecipient } = await supabase
        .from('care_recipient_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Get care plans
      const { data: carePlansData } = await supabase
        .from('care_plans')
        .select('id, title')
        .eq('family_id', user.id);

      // Get medications
      const { data: medications } = await supabase
        .from('medications')
        .select('id')
        .in('care_plan_id', (carePlansData || []).map(cp => cp.id));

      // Get meal plans
      const { data: mealPlans } = await supabase
        .from('meal_plans')
        .select('id')
        .in('care_plan_id', (carePlansData || []).map(cp => cp.id));

      // Get trial payments
      const { data: trialPayments } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('transaction_type', 'trial_day')
        .eq('status', 'completed');

      // Parse visit notes to get care model choice
      let visitNotes = null;
      try {
        visitNotes = profile?.visit_notes ? JSON.parse(profile.visit_notes) : null;
      } catch (error) {
        console.error('Error parsing visit notes:', error);
      }

      // Update journey data
      setJourneyData({
        visitStatus: profile?.visit_scheduling_status || 'not_started',
        visitDate: profile?.visit_scheduled_date,
        carePlans: carePlansData || [],
        trialCompleted: (trialPayments && trialPayments.length > 0) || false,
        careModel: visitNotes?.care_model || null,
        subscriptionActive: visitNotes?.subscription_active || false
      });

      // Update step completion status
      const updatedSteps = steps.map(step => {
        let completed = false;
        
        switch (step.id) {
          case 1: // Profile completion
            completed = !!(user && profile?.full_name);
            break;
          case 2: // Care assessment
            completed = !!careAssessment;
            break;
          case 3: // Legacy story
            completed = !!(careRecipient && careRecipient.full_name);
            break;
          case 4: // Caregiver matches
            completed = !!careRecipient;
            break;
          case 5: // Medication management
            completed = !!(medications && medications.length > 0);
            break;
          case 6: // Meal management
            completed = !!(mealPlans && mealPlans.length > 0);
            break;
          case 7: // Schedule visit
            completed = profile?.visit_scheduling_status === 'scheduled' || profile?.visit_scheduling_status === 'completed';
            break;
          case 8: // Confirm visit
            completed = profile?.visit_scheduling_status === 'completed';
            break;
          case 9: // Schedule trial day
            completed = !!(trialPayments && trialPayments.length > 0);
            break;
          case 10: // Pay for trial day
            completed = !!(trialPayments && trialPayments.length > 0);
            break;
          case 11: // Begin trial
            completed = !!(trialPayments && trialPayments.length > 0);
            break;
          case 12: // Rate & choose path
            completed = !!(visitNotes?.care_model);
            break;
        }
        
        return {
          ...step,
          completed,
          action: () => handleStepAction(step)
        };
      });
      
      setSteps(updatedSteps);
    } catch (error) {
      console.error("Error loading journey progress:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStepAccessibility = (updatedSteps: JourneyStep[]) => {
    return updatedSteps.map(step => {
      let accessible = true;
      
      switch (step.id) {
        case 4: // Caregiver matches - need steps 1-3 completed
          accessible = updatedSteps[0]?.completed && updatedSteps[1]?.completed && updatedSteps[2]?.completed;
          break;
        case 8: // Confirm visit - need step 7 completed
          accessible = updatedSteps[6]?.completed; // Step 7 (index 6)
          break;
        case 9: // Schedule trial - need step 7 completed
          accessible = updatedSteps[6]?.completed; // Step 7 (index 6)
          break;
        case 10: // Pay for trial - need steps 8 and 9 completed
          accessible = updatedSteps[7]?.completed && updatedSteps[8]?.completed; // Steps 8,9
          break;
        case 11: // Begin trial - need step 10 completed
          accessible = updatedSteps[9]?.completed; // Step 10 (index 9)
          break;
        case 12: // Choose path - need step 8 completed (can skip trial)
          accessible = updatedSteps[7]?.completed; // Step 8 (index 7)
          break;
        default:
          accessible = true;
      }
      
      return { ...step, accessible };
    });
  };

  const handleStepAction = (step: JourneyStep) => {
    if (!step.accessible) return;
    
    if (step.id === 4) {
      // Check if first three steps are completed
      const canAccessMatching = steps[0]?.completed && steps[1]?.completed && steps[2]?.completed;
      if (!canAccessMatching) return;
    }
    
    if (step.id === 5) {
      // Navigate to medication management
      if (journeyData.carePlans.length > 0) {
        navigate(`/family/care-management/${journeyData.carePlans[0].id}/medications`);
      } else {
        navigate('/family/care-management');
      }
      return;
    }
    
    if (step.id === 6) {
      // Navigate to meal management
      if (journeyData.carePlans.length > 0) {
        navigate(`/family/care-management/${journeyData.carePlans[0].id}/meals`);
      } else {
        navigate('/family/care-management');
      }
      return;
    }
    
    if (step.id === 7) {
      setShowScheduleModal(true);
      return;
    }
    
    if (step.link) {
      navigate(step.link);
    }
  };

  const getStepButtonText = (step: JourneyStep) => {
    if (!step.accessible) {
      if (step.id === 4) return "Complete Above Steps";
      if (step.id === 8) return "Schedule Visit First";
      if (step.id === 9) return "Schedule Visit First";
      if (step.id === 10) return "Complete Previous Steps";
      if (step.id === 11) return "Complete Previous Steps";
      if (step.id === 12) return "Confirm Visit First";
      return "Not Available";
    }
    
    if (step.id === 4) {
      const canAccessMatching = steps[0]?.completed && steps[1]?.completed && steps[2]?.completed;
      if (!canAccessMatching) return "Complete Above Steps";
      return step.completed ? "View Matches" : "View Matches";
    }
    
    if (step.id === 5) {
      return step.completed ? "Edit Medications" : "Start Setup";
    }
    
    if (step.id === 6) {
      return step.completed ? "Edit Meal Plans" : "Start Planning";
    }
    
    if (step.id === 7) {
      switch (journeyData.visitStatus) {
        case 'scheduled':
          return journeyData.visitDate 
            ? `Scheduled for ${new Date(journeyData.visitDate).toLocaleDateString()}`
            : "Modify Visit";
        case 'completed':
          return "Schedule Another";
        case 'cancelled':
          return "Schedule Visit";
        default:
          return "Schedule Visit";
      }
    }
    
    if (step.completed) {
      return "Edit";
    }
    
    return "Complete";
  };

  const overallProgress = Math.round((steps.filter(step => step.completed).length / steps.length) * 100);
  const completedCount = steps.filter(step => step.completed).length;
  const totalCount = steps.length;

  const breadcrumbItems = [
    { label: "Family Dashboard", href: "/dashboard/family" },
    { label: "Care Journey Progress", href: "/family/care-journey-progress" }
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading your journey progress...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumbs items={breadcrumbItems} />
          </div>

          {/* Header with Progress */}
          <Card className="border-l-4 border-l-primary mb-8">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-2xl mb-2">
                    <List className="h-6 w-6 text-primary" />
                    🌿 Tavara Care Journey Progress
                  </CardTitle>
                  <p className="text-gray-600">Complete these steps to get matched and begin personalized care with confidence</p>
                </div>
                <div className="flex items-center gap-4 ml-6">
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">{overallProgress}%</div>
                    <div className="text-sm text-gray-500">{completedCount} of {totalCount} completed</div>
                  </div>
                  <div className="w-20 h-20 relative">
                    <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-200"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="transparent"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-primary"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="transparent"
                        strokeDasharray={`${overallProgress}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Steps List */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-1">
                {steps.map((step, index) => (
                  <div key={step.id} className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                    step.accessible ? 'hover:bg-gray-50' : 'bg-gray-50'
                  }`}>
                    <div className="flex-shrink-0">
                      {step.completed ? (
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      ) : (
                        <Circle className={`h-6 w-6 ${step.accessible ? 'text-gray-300' : 'text-gray-200'}`} />
                      )}
                    </div>
                    
                    <div className={`flex-shrink-0 ${step.accessible ? 'text-primary' : 'text-gray-300'}`}>
                      {step.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-medium text-sm ${
                          step.completed 
                            ? 'text-gray-500 line-through' 
                            : step.accessible 
                              ? 'text-gray-800' 
                              : 'text-gray-400'
                        }`}>
                          {step.title}
                        </h3>
                        {step.optional && (
                          <Badge variant="secondary" className="text-xs">Optional</Badge>
                        )}
                      </div>
                      <p className={`text-xs ${step.accessible ? 'text-gray-600' : 'text-gray-400'}`}>
                        {step.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {!step.completed && (
                        <div className="flex items-center text-xs text-gray-500 gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{step.accessible ? 'Pending' : 'Locked'}</span>
                        </div>
                      )}
                      
                      <Button 
                        variant={step.completed ? "outline" : "ghost"} 
                        size="sm" 
                        className={`text-xs px-3 py-1 h-auto ${
                          !step.accessible
                            ? 'text-gray-400 cursor-not-allowed opacity-50' 
                            : step.completed 
                              ? 'text-blue-600 hover:text-blue-700' 
                              : 'text-primary hover:text-primary-600'
                        }`}
                        disabled={!step.accessible}
                        onClick={() => handleStepAction(step)}
                      >
                        {getStepButtonText(step)}
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Path Branches Section */}
          {journeyData.careModel && (
            <Card className="mt-8 border-2 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  🔁 Your Chosen Path
                </CardTitle>
              </CardHeader>
              <CardContent>
                {journeyData.careModel === 'direct_hire' ? (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-blue-800">Direct Hire Path</h3>
                    <p className="text-sm text-gray-600">Build your care team by adding more matches or caregivers to expand your care support.</p>
                    <Button 
                      onClick={() => navigate('/caregiver/matching')}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Add More Matches
                    </Button>
                  </div>
                ) : journeyData.careModel === 'tavara_subscribed' ? (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-purple-800">Tavara Care Village</h3>
                    <p className="text-sm text-gray-600">Unlock your full dashboard: meal planning, medication management, payroll, receipts, shifts, and 24/7 support.</p>
                    <Button 
                      onClick={() => navigate('/family/care-management')}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Open Care Dashboard
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}

          {/* Back to Dashboard */}
          <div className="mt-8 text-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard/family')}
              className="gap-2"
            >
              ← Back to Dashboard
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Schedule Visit Modal */}
      <ScheduleVisitModal 
        open={showScheduleModal}
        onOpenChange={setShowScheduleModal}
      />
    </>
  );
}
