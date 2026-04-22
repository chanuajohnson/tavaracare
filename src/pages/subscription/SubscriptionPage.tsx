import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, ArrowLeft, Crown, XCircle, Clock, Video, MessageCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTracking } from "@/hooks/useTracking";
import { supabase } from "@/integrations/supabase/client";
import { useSubscriptionPlans, formatPlanPrice, SubscriptionPlan } from "@/hooks/useSubscriptionPlans";
import { PlanManagerDrawer } from "@/components/admin/subscription/PlanManagerDrawer";


const SubscriptionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole, requireAuth } = useAuth();
  const { trackEngagement } = useTracking();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [userSubscription, setUserSubscription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<"weekly" | "monthly">("weekly");
  const isAdmin = userRole === "admin";
  const {
    familyPlans: dbFamilyPlans,
    professionalPlans: dbProfessionalPlans,
    isLoading: plansLoading,
    refetch: refetchPlans,
  } = useSubscriptionPlans();
  const returnPath = location.state?.returnPath || (userRole === 'professional' ? "/dashboard/professional" : "/dashboard/family");
  const featureType = location.state?.featureType || "premium feature";
  const referringPagePath = location.state?.referringPagePath || returnPath;
  const referringPageLabel = location.state?.referringPageLabel || "Dashboard";
  
  // Check if this is video call related
  const isVideoCallFeature = featureType?.toLowerCase().includes('video') || 
                            featureType?.toLowerCase().includes('call');
  
  const breadcrumbItems = [{
    label: "Dashboard",
    path: referringPagePath.split('/').slice(0, 3).join('/')
  }, {
    label: referringPageLabel !== "Dashboard" ? referringPageLabel : "Family Dashboard",
    path: referringPagePath
  }, {
    label: "Subscription",
    path: "/subscription"
  }];
  
  

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access subscription features.",
        variant: "destructive"
      });
      navigate('/auth', {
        state: {
          returnPath: '/subscription',
          referringPagePath,
          referringPageLabel
        }
      });
      return;
    }
    const fetchUserSubscription = async () => {
      try {
        setIsLoading(true);
        if (userRole === 'professional') {
          setUserSubscription('basic');
        } else if (userRole === 'family') {
          setUserSubscription('basic');
        } else {
          setUserSubscription(null);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user subscription:", error);
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Failed to load your subscription information. Please try again.",
          variant: "destructive"
        });
      }
    };
    fetchUserSubscription();
  }, [user, userRole, navigate, referringPagePath, referringPageLabel]);
  
  // Map a DB-backed SubscriptionPlan to the shape the existing render loop expects
  const mapPlan = (p: SubscriptionPlan) => ({
    id: p.slug || p.id,
    dbId: p.id,
    name: p.name,
    priceWeekly: formatPlanPrice(p.price_weekly),
    priceMonthly: formatPlanPrice(p.price_monthly),
    periodWeekly: p.period_weekly,
    periodMonthly: p.period_monthly,
    description: p.description ?? "",
    features: p.features.map((f) => ({
      name: f.is_addon && !f.name.startsWith("Add-on:") ? `Add-on: ${f.name}` : f.name,
      included: f.included,
    })),
    popular: p.is_popular,
    buttonColor:
      p.price_weekly === null && p.price_monthly === null
        ? "bg-muted text-muted-foreground hover:bg-muted/90"
        : "bg-primary hover:bg-primary/90",
    buttonText: p.button_text,
  });

  const familyPlans = dbFamilyPlans.map(mapPlan);
  const professionalPlans = dbProfessionalPlans.map(mapPlan);

  const getUserSpecificPlans = () => {
    if (userRole === 'professional' || referringPagePath.includes('professional') || location.state?.fromProfessionalFeatures) {
      return professionalPlans;
    }
    if (userRole === 'family' || referringPagePath.includes('family')) {
      return familyPlans;
    }
    return referringPagePath.includes('professional') ? professionalPlans : familyPlans;
  };

  const getPlanPrice = (plan: { priceWeekly: string; priceMonthly: string }) => {
    return billingCycle === "weekly" ? plan.priceWeekly : plan.priceMonthly;
  };

  const getPlanPeriod = (plan: { periodWeekly: string; periodMonthly: string }) => {
    return billingCycle === "weekly" ? plan.periodWeekly : plan.periodMonthly;
  };

  // (legacy hardcoded professionalPlans array removed — now sourced from DB)
  
  const plans = getUserSpecificPlans();
  
  const isCurrentPlan = (planId: string) => {
    return userSubscription === planId;
  };
  
  const getPlanAction = (planId: string) => {
    if (!userSubscription) return "upgrade";
    const planRank = {
      "basic": 1,
      "care": 2,
      "premium": 3,
      "pro": 2,
      "expert": 3
    };
    const currentRank = planRank[userSubscription as keyof typeof planRank] || 0;
    const newRank = planRank[planId as keyof typeof planRank] || 0;
    if (newRank > currentRank) return "upgrade";
    if (newRank < currentRank) return "downgrade";
    return "same";
  };
  
  const getButtonText = (plan: any) => {
    if (isCurrentPlan(plan.id)) {
      return plan.id === "basic" ? "Get Started Free" : "Current Plan";
    }
    const action = getPlanAction(plan.id);
    if (action === "upgrade") {
      if (plan.id === "care") return "Start Care Coordination";
      if (plan.id === "premium") return "Choose Premium";
      return plan.buttonText;
    } else if (action === "downgrade") {
      return `Downgrade to ${plan.name.split(' ').pop()}`;
    }
    return plan.buttonText;
  };
  
  const getButtonColor = (plan: any) => {
    if (isCurrentPlan(plan.id)) {
      return "bg-muted text-muted-foreground hover:bg-muted/90";
    }
    const action = getPlanAction(plan.id);
    if (action === "upgrade") {
      return "bg-primary hover:bg-primary/90";
    } else if (action === "downgrade") {
      return "bg-orange-500 hover:bg-orange-600 text-white";
    }
    return plan.buttonColor;
  };
  
  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to a plan.",
        variant: "destructive"
      });
      navigate('/auth', {
        state: {
          returnPath: '/subscription',
          referringPagePath,
          referringPageLabel
        }
      });
      return;
    }
    if (isCurrentPlan(planId)) {
      toast({
        title: "Already Subscribed",
        description: "You are already subscribed to this plan.",
        variant: "destructive"
      });
      return;
    }
    try {
      setSelectedPlan(planId);
      setProcessingPayment(true);
      await trackEngagement('subscription_plan_selected', {
        plan_id: planId,
        plan_name: plans.find(p => p.id === planId)?.name,
        feature_accessed: featureType,
        referring_page: referringPagePath,
        user_role: userRole || 'anonymous',
        action: getPlanAction(planId)
      });
      await new Promise(resolve => setTimeout(resolve, 2000));
      const planName = plans.find(p => p.id === planId)?.name;
      const action = getPlanAction(planId);
      toast({
        title: action === "upgrade" ? "Subscription Upgraded!" : "Subscription Changed!",
        description: `Successfully ${action === "upgrade" ? "upgraded to" : "changed to"} ${planName} plan! (Demo only: No payment has been processed. When launched, an email with payment details will be sent to complete your subscription.)`,
        variant: "default"
      });
      setUserSubscription(planId);
      await trackEngagement('subscription_completed', {
        plan_id: planId,
        plan_name: planName,
        feature_accessed: featureType,
        price: getPlanPrice(plans.find(p => p.id === planId) as any),
        previous_plan: userSubscription,
        action: action
      });
      const isProfessionalPlan = professionalPlans.some(p => p.id === planId);
      let dashboardPath;
      if (returnPath && returnPath !== '/dashboard/professional' && returnPath !== '/dashboard/family') {
        dashboardPath = returnPath;
      } else {
        if (isProfessionalPlan || userRole === 'professional' || referringPagePath.includes('professional') || location.state?.fromProfessionalFeatures) {
          dashboardPath = '/dashboard/professional';
        } else {
          dashboardPath = '/dashboard/family';
        }
      }
      console.log('Subscription redirect details:', {
        returnPath,
        referringPagePath,
        dashboardPath,
        isProfessionalPlan,
        planId,
        planType: isProfessionalPlan ? 'professional' : 'family',
        userRole
      });
      navigate(dashboardPath, {
        state: {
          from: 'subscription',
          subscriptionComplete: true,
          newPlan: planId,
          previousPlan: userSubscription,
          featureAccessed: featureType
        }
      });
    } catch (error) {
      console.error("Subscription error:", error);
      toast({
        title: "Subscription Failed",
        description: "Failed to process subscription. Please try again.",
        variant: "destructive"
      });
      await trackEngagement('subscription_failed', {
        plan_id: planId,
        plan_name: plans.find(p => p.id === planId)?.name,
        feature_accessed: featureType,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setProcessingPayment(false);
    }
  };
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  
  if (!user) {
    return <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You must be signed in to access subscription features.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleGoBack}>Go Back</Button>
            <Button onClick={() => navigate('/auth', {
            state: {
              returnPath: '/subscription',
              referringPagePath,
              referringPageLabel
            }
          })}>
              Sign In
            </Button>
          </CardFooter>
        </Card>
      </div>;
  }
  
  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading subscription information...</p>
        </div>
      </div>;
  }
  
  return (
    <div className="min-h-screen bg-background">
        <div className="container px-4 py-8">
          <DashboardHeader breadcrumbItems={breadcrumbItems} />
          
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5
        }} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">
                  Choose Your Care Coordination Plan
                </h1>
                <p className="text-lg text-muted-foreground mt-2">
                  Structure, coordination, and peace of mind — so you can focus on what matters most.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleGoBack} className="flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            </div>
            
            
            
            <div className="bg-muted/30 border p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Crown className="h-5 w-5 text-yellow-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">
                    Find the right level of care coordination for your family
                  </h3>
                  <p className="text-muted-foreground">
                    Every plan gives your family tools, guidance, and hands-on support to coordinate care with confidence.
                  </p>
                  {userSubscription && <p className="mt-2 text-sm">
                      <span className="font-medium">Your Current Plan:</span> {plans.find(p => p.id === userSubscription)?.name || "Basic"}
                    </p>}
                </div>
              </div>
            </div>
            
            {/* Billing Cycle Toggle */}
            {getUserSpecificPlans() === familyPlans && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <span className={`text-sm font-medium ${billingCycle === 'weekly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Weekly
                </span>
                <Switch
                  checked={billingCycle === 'monthly'}
                  onCheckedChange={(checked) => setBillingCycle(checked ? 'monthly' : 'weekly')}
                />
                <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Monthly
                </span>
              </div>
            )}
            
            {/* Clarity Block */}
            <div className="bg-accent/30 border border-accent rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Caregiver compensation is arranged directly between your family and your care team. Your Tavara subscription covers care coordination, management tools, and ongoing support to ensure care is delivered consistently and effectively.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {plans.map(plan => {
              const isCurrentUserPlan = isCurrentPlan(plan.id);
              const planAction = getPlanAction(plan.id);
              return <Card key={plan.id} className={`border-2 ${isCurrentUserPlan ? 'border-primary/30 bg-primary/5' : planAction === "same" ? 'border-gray-300' : selectedPlan === plan.id ? 'border-primary' : 'border-border'} ${plan.popular ? 'relative shadow-lg' : ''}`}>
                    {plan.popular && <Badge className="absolute -top-3 right-4 bg-primary">Most Popular</Badge>}
                    {isCurrentUserPlan}
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {plan.name}
                        {plan.id === 'basic' && <MessageCircle className="h-4 w-4 text-green-500" />}
                        {plan.id !== 'basic' && <Video className="h-4 w-4 text-purple-500" />}
                      </CardTitle>
                      <div className="flex items-end gap-1">
                        <span className="text-3xl font-bold">{getPlanPrice(plan)}</span>
                        {getPlanPeriod(plan) && <span className="text-muted-foreground">/{getPlanPeriod(plan)}</span>}
                      </div>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {plan.features.map((feature, index) => {
                          const isAddOn = feature.name.startsWith("Add-on:");
                          const displayName = isAddOn ? feature.name.replace(/^Add-on:\s*/, "") : feature.name;
                          return (
                            <div key={index} className="flex items-start gap-2">
                              {feature.included ? <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" /> : <XCircle className="h-5 w-5 text-gray-300 flex-shrink-0" />}
                              <span className={`flex flex-wrap items-center gap-1.5 ${feature.included ? "text-gray-700" : "text-gray-400"}`}>
                                <span>{displayName}</span>
                                {isAddOn && (
                                  <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-xs font-medium">
                                    Add-on
                                  </span>
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                      {!isCurrentUserPlan && plan.id !== "basic" && (
                        <Button
                          className={`w-full ${getButtonColor(plan)}`}
                          disabled={processingPayment}
                          onClick={() => handleSubscribe(plan.id)}
                        >
                          {processingPayment && selectedPlan === plan.id ? (
                            <>
                              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                              Selecting...
                            </>
                          ) : (
                            getButtonText(plan)
                          )}
                        </Button>
                      )}
                      
                      
                    </CardFooter>
                  </Card>;
            })}
            </div>
          </motion.div>
        </div>
      </div>
    );
};
export default SubscriptionPage;
