import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, ArrowLeft, Crown, XCircle, Clock } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTracking } from "@/hooks/useTracking";
import { supabase } from "@/integrations/supabase/client";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { PayPalSubscribeButton } from "@/components/subscription/PayPalSubscribeButton";
const SubscriptionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    userRole,
    requireAuth
  } = useAuth();
  const {
    trackEngagement
  } = useTracking();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [userSubscription, setUserSubscription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const returnPath = location.state?.returnPath || (userRole === 'professional' ? "/dashboard/professional" : "/dashboard/family");
  const featureType = location.state?.featureType || "premium feature";
  const referringPagePath = location.state?.referringPagePath || returnPath;
  const referringPageLabel = location.state?.referringPageLabel || "Dashboard";
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
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb";
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
  const getUserSpecificPlans = () => {
    if (userRole === 'professional' || referringPagePath.includes('professional') || location.state?.fromProfessionalFeatures) {
      return professionalPlans;
    }
    if (userRole === 'family' || referringPagePath.includes('family')) {
      return familyPlans;
    }
    return referringPagePath.includes('professional') ? professionalPlans : familyPlans;
  };
  const familyPlans = [{
    id: "basic",
    name: "Family Basic",
    price: "Free",
    period: "",
    description: "Limited access to essential family features",
    features: [{
      name: "View 3 caregiver profiles per day",
      included: true
    }, {
      name: "Basic message board access (read-only)",
      included: true
    }, {
      name: "Limited job posting (1 active)",
      included: true
    }, {
      name: "Email support",
      included: true
    }, {
      name: "Post care need requests",
      included: false
    }, {
      name: "View full caregiver profiles",
      included: false
    }, {
      name: "Unlimited caregiver matching",
      included: false
    }, {
      name: "Priority support",
      included: false
    }],
    popular: false,
    buttonColor: "bg-muted text-muted-foreground hover:bg-muted/90",
    buttonText: "Current Plan"
  }, {
    id: "care",
    name: "Family Care",
    price: "$14.99",
    period: "monthly",
    description: "Enhanced features for active caregiving families",
    features: [{
      name: "View 3 caregiver profiles per day",
      included: true
    }, {
      name: "Basic message board access (read-only)",
      included: true
    }, {
      name: "Limited job posting (1 active)",
      included: true
    }, {
      name: "Email support",
      included: true
    }, {
      name: "Post care need requests",
      included: true
    }, {
      name: "View full caregiver profiles",
      included: true
    }, {
      name: "Unlimited caregiver matching",
      included: false
    }, {
      name: "Priority support",
      included: false
    }],
    popular: true,
    buttonColor: "bg-primary hover:bg-primary/90",
    buttonText: "Upgrade to Care"
  }, {
    id: "premium",
    name: "Family Premium",
    price: "$29.99",
    period: "monthly",
    description: "Complete access for families with ongoing care needs",
    features: [{
      name: "View 3 caregiver profiles per day",
      included: true
    }, {
      name: "Basic message board access (read-only)",
      included: true
    }, {
      name: "Limited job posting (1 active)",
      included: true
    }, {
      name: "Email support",
      included: true
    }, {
      name: "Post care need requests",
      included: true
    }, {
      name: "View full caregiver profiles",
      included: true
    }, {
      name: "Unlimited caregiver matching",
      included: true
    }, {
      name: "Priority support",
      included: true
    }],
    popular: false,
    buttonColor: "bg-primary hover:bg-primary/90",
    buttonText: "Upgrade to Premium"
  }];
  const professionalPlans = [{
    id: "basic",
    name: "Professional Basic",
    price: "Free",
    period: "",
    description: "Limited access for casual professionals",
    features: [{
      name: "Apply for 3 jobs per week",
      included: true
    }, {
      name: "Basic profile listing",
      included: true
    }, {
      name: "Limited training resources",
      included: true
    }, {
      name: "Email support",
      included: true
    }, {
      name: "Featured profile placement",
      included: false
    }, {
      name: "Unlimited job applications",
      included: false
    }, {
      name: "Advanced training resources",
      included: false
    }, {
      name: "Priority job matching",
      included: false
    }],
    popular: false,
    buttonColor: "bg-muted text-muted-foreground hover:bg-muted/90",
    buttonText: "Current Plan"
  }, {
    id: "pro",
    name: "Professional Pro",
    price: "$19.99",
    period: "monthly",
    description: "Enhanced features for active professionals",
    features: [{
      name: "Apply for 3 jobs per week",
      included: true
    }, {
      name: "Basic profile listing",
      included: true
    }, {
      name: "Limited training resources",
      included: true
    }, {
      name: "Email support",
      included: true
    }, {
      name: "Featured profile placement",
      included: true
    }, {
      name: "Unlimited job applications",
      included: true
    }, {
      name: "Advanced training resources",
      included: false
    }, {
      name: "Priority job matching",
      included: false
    }],
    popular: true,
    buttonColor: "bg-primary hover:bg-primary/90",
    buttonText: "Upgrade to Pro"
  }, {
    id: "expert",
    name: "Professional Expert",
    price: "$34.99",
    period: "monthly",
    description: "Complete access for dedicated care professionals",
    features: [{
      name: "Apply for 3 jobs per week",
      included: true
    }, {
      name: "Basic profile listing",
      included: true
    }, {
      name: "Limited training resources",
      included: true
    }, {
      name: "Email support",
      included: true
    }, {
      name: "Featured profile placement",
      included: true
    }, {
      name: "Unlimited job applications",
      included: true
    }, {
      name: "Advanced training resources",
      included: true
    }, {
      name: "Priority job matching",
      included: true
    }],
    popular: false,
    buttonColor: "bg-primary hover:bg-primary/90",
    buttonText: "Upgrade to Expert"
  }];
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
      return "Current Plan";
    }
    const action = getPlanAction(plan.id);
    if (action === "upgrade") {
      return `Upgrade to ${plan.name.split(' ').pop()}`;
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
        price: plans.find(p => p.id === planId)?.price,
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
  const ComingSoonBanner = () => <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
      <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
      <div>
        <h3 className="font-medium text-blue-800">PayPal Subscriptions Coming Soon</h3>
        <p className="text-blue-700 text-sm mt-1">
          Our PayPal subscription service is currently in development and will be available soon. 
          In the meantime, you can explore our subscription plans.
        </p>
      </div>
    </div>;
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
  return <PayPalScriptProvider options={{
    "client-id": paypalClientId,
    currency: "USD",
    intent: "subscription",
    vault: true
  }}>
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
                <h1 className="text-3xl font-bold">Subscribe to Access Premium Features</h1>
                {featureType && <p className="text-lg text-primary mt-2">
                    <span className="font-medium">Feature: {featureType}</span>
                  </p>}
              </div>
              <Button variant="outline" size="sm" onClick={handleGoBack} className="flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            </div>
            
            <ComingSoonBanner />
            
            <div className="bg-muted/30 border p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Crown className="h-5 w-5 text-yellow-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">Upgrade to Unlock {featureType}</h3>
                  <p className="text-muted-foreground">
                    Choose the plan that best fits your needs to access this premium feature and more.
                  </p>
                  {userSubscription && <p className="mt-2 text-sm">
                      <span className="font-medium">Your Current Plan:</span> {plans.find(p => p.id === userSubscription)?.name || "Basic"}
                    </p>}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {plans.map(plan => {
              const isCurrentUserPlan = isCurrentPlan(plan.id);
              const planAction = getPlanAction(plan.id);
              return <Card key={plan.id} className={`border-2 ${isCurrentUserPlan ? 'border-primary/30 bg-primary/5' : planAction === "same" ? 'border-gray-300' : selectedPlan === plan.id ? 'border-primary' : 'border-border'} ${plan.popular ? 'relative shadow-lg' : ''}`}>
                    {plan.popular && <Badge className="absolute -top-3 right-4 bg-primary">Most Popular</Badge>}
                    {isCurrentUserPlan}
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <div className="flex items-end gap-1">
                        <span className="text-3xl font-bold">{plan.price}</span>
                        {plan.period && <span className="text-gray-500">/{plan.period}</span>}
                      </div>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {plan.features.map((feature, index) => <div key={index} className="flex items-start gap-2">
                            {feature.included ? <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" /> : <XCircle className="h-5 w-5 text-gray-300 flex-shrink-0" />}
                            <span className={feature.included ? "text-gray-700" : "text-gray-400"}>
                              {feature.name}
                            </span>
                          </div>)}
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                      {!isCurrentUserPlan && plan.id !== "basic" && <PayPalSubscribeButton planId={plan.id} planName={plan.name} price={plan.price.toString()} className="w-full" variant={plan.popular ? "default" : "outline"} isComingSoon={true} onSuccess={subscriptionId => {
                    toast({
                      title: "Subscription Activated",
                      description: `Successfully subscribed to ${plan.name}!`,
                      variant: "default"
                    });
                    trackEngagement('subscription_completed', {
                      plan_id: plan.id,
                      plan_name: plan.name,
                      feature_accessed: featureType,
                      price: plan.price,
                      previous_plan: userSubscription,
                      action: planAction,
                      payment_method: 'paypal'
                    });
                    setUserSubscription(plan.id);
                  }} onError={error => {
                    toast({
                      title: "Subscription Failed",
                      description: "There was an error processing your subscription.",
                      variant: "destructive"
                    });
                    trackEngagement('subscription_failed', {
                      plan_id: plan.id,
                      plan_name: plan.name,
                      error: error.message,
                      payment_method: 'paypal'
                    });
                  }} />}
                      
                      
                    </CardFooter>
                  </Card>;
            })}
            </div>
            
            
          </motion.div>
        </div>
      </div>
    </PayPalScriptProvider>;
};
export default SubscriptionPage;