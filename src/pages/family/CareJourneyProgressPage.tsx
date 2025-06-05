import React from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Clock, ArrowRight, Users, Heart, Calendar, Star, FileText, Utensils, Pill, Video, Home, ChevronDown, ChevronRight } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ScheduleVisitModal } from "@/components/family/ScheduleVisitModal";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
}

export default function CareJourneyProgressPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({
    foundation: true,
    scheduling: true,
    trial: true,
    conversion: true
  });
  
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
      statusField: "profile_completed_at"
    },
    {
      id: 2,
      title: "Complete Initial Care Assessment",
      description: "Help us understand your care needs better.",
      icon: <FileText className="h-5 w-5" />,
      completed: false,
      category: 'foundation',
      link: "/family/care-assessment",
      statusField: "assessment_completed_at"
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
      statusField: "legacy_story_submitted_at"
    },
    {
      id: 4,
      title: "See Your Instant Caregiver Matches",
      description: "Now that your loved one's profile is complete, unlock personalized caregiver recommendations.",
      icon: <Star className="h-5 w-5" />,
      completed: false,
      category: 'foundation',
      link: "/caregiver/matching",
      statusField: "match_viewed_at"
    },
    {
      id: 5,
      title: "Set Up Medication Management",
      description: "Add medications and set up schedules for your care plan.",
      icon: <Pill className="h-5 w-5" />,
      completed: false,
      category: 'foundation',
      statusField: "medications_added_at"
    },
    {
      id: 6,
      title: "Set Up Meal Management",
      description: "Plan meals and create grocery lists for your care plan.",
      icon: <Utensils className="h-5 w-5" />,
      completed: false,
      category: 'foundation',
      statusField: "meals_added_at"
    },
    {
      id: 7,
      title: "Schedule Your Tavara.Care Visit",
      description: "Choose to meet your match and a care coordinator virtually (Free) or in person ($300 TTD).",
      icon: <Calendar className="h-5 w-5" />,
      completed: false,
      category: 'scheduling',
      statusField: "visit_scheduling_status"
    },
    {
      id: 8,
      title: "Confirm Visit",
      description: "Confirm the video link or complete payment for in-person visit.",
      icon: <CheckCircle2 className="h-5 w-5" />,
      completed: false,
      category: 'scheduling',
      statusField: "visit_confirmed_at"
    },
    {
      id: 9,
      title: "Schedule Trial Day",
      description: "Choose a trial date with your matched caregiver.",
      icon: <Clock className="h-5 w-5" />,
      completed: false,
      optional: true,
      category: 'trial',
      statusField: "trial_scheduled_at"
    },
    {
      id: 10,
      title: "Pay for Trial Day",
      description: "Pay a one-time fee of $320 TTD for an 8-hour caregiver experience.",
      icon: <Star className="h-5 w-5" />,
      completed: false,
      optional: true,
      category: 'trial',
      statusField: "trial_day_paid"
    },
    {
      id: 11,
      title: "Begin Your Trial",
      description: "Your caregiver begins the scheduled trial session.",
      icon: <Heart className="h-5 w-5" />,
      completed: false,
      optional: true,
      category: 'trial',
      statusField: "trial_started_at"
    },
    {
      id: 12,
      title: "Rate & Choose Your Path",
      description: "After the trial, decide between: Hire your caregiver ($40/hr) or Subscribe to Tavara ($45/hr) for full support tools.",
      icon: <ArrowRight className="h-5 w-5" />,
      completed: false,
      category: 'conversion',
      statusField: "trial_completed_at"
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

  const handleStepAction = (step: JourneyStep) => {
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

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getCategorySteps = (category: string) => {
    return steps.filter(step => step.category === category);
  };

  const getCategoryProgress = (category: string) => {
    const categorySteps = getCategorySteps(category);
    const completedSteps = categorySteps.filter(step => step.completed).length;
    return Math.round((completedSteps / categorySteps.length) * 100);
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'foundation': return 'Foundation Setup';
      case 'scheduling': return 'Scheduling & Coordination';
      case 'trial': return 'Trial Experience';
      case 'conversion': return 'Choose Your Path';
      default: return category;
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'foundation': return 'Essential setup steps to build your care foundation';
      case 'scheduling': return 'Meet your coordinator and schedule your visits';
      case 'trial': return 'Experience a trial day with your matched caregiver';
      case 'conversion': return 'Decide how to continue your care journey';
      default: return '';
    }
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

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              🌿 Tavara Care Journey Progress
            </h1>
            <p className="text-gray-600 mb-4">
              Complete these steps to get matched and begin personalized care with confidence.
            </p>
            
            {/* Overall Progress */}
            <Card className="border-l-4 border-l-primary">
              <CardContent className="py-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm font-medium">{completedCount} of {totalCount} completed</span>
                </div>
                <Progress value={overallProgress} className="h-3" />
                <p className="text-xs text-gray-500 mt-1">{overallProgress}% complete</p>
              </CardContent>
            </Card>
          </div>

          {/* Journey Categories */}
          <div className="space-y-6">
            {['foundation', 'scheduling', 'trial', 'conversion'].map((category) => {
              const categorySteps = getCategorySteps(category);
              const categoryProgress = getCategoryProgress(category);
              const isExpanded = expandedCategories[category];
              
              return (
                <Card key={category} className="overflow-hidden">
                  <CardHeader 
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleCategory(category)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-500" />
                        )}
                        <div>
                          <CardTitle className="text-lg">{getCategoryTitle(category)}</CardTitle>
                          <p className="text-sm text-gray-600">{getCategoryDescription(category)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{categoryProgress}%</span>
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-300" 
                            style={{ width: `${categoryProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {isExpanded && (
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {categorySteps.map((step, index) => (
                          <div key={step.id}>
                            <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                              <div className="mt-1">
                                {step.completed ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : (
                                  <Circle className="h-5 w-5 text-gray-300" />
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {step.icon}
                                  <h3 className={`font-medium ${step.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                                    {step.title}
                                  </h3>
                                  {step.optional && (
                                    <Badge variant="secondary" className="text-xs">Optional</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {!step.completed && (
                                  <div className="flex items-center text-xs text-gray-500 gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>Pending</span>
                                  </div>
                                )}
                                
                                <Button 
                                  variant={step.completed ? "outline" : "ghost"} 
                                  size="sm" 
                                  className={`${
                                    step.id === 4 && !steps[0]?.completed && !steps[1]?.completed && !steps[2]?.completed
                                      ? 'text-gray-400 cursor-not-allowed' 
                                      : step.completed 
                                        ? 'text-blue-600 hover:text-blue-700' 
                                        : 'text-primary hover:text-primary-600'
                                  }`}
                                  disabled={step.id === 4 && !steps[0]?.completed && !steps[1]?.completed && !steps[2]?.completed}
                                  onClick={() => handleStepAction(step)}
                                >
                                  {getStepButtonText(step)}
                                  <ArrowRight className="ml-1 h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            {index < categorySteps.length - 1 && (
                              <Separator className="ml-6" />
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>

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
