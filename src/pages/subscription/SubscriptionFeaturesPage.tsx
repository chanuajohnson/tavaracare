import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Home, Lock, CheckCircle, ArrowRight, Heart, Users, Shield, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

export default function SubscriptionFeaturesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole } = useAuth();
  const { returnPath, referringPagePath, referringPageLabel, featureType, email, phone, source } = location.state || {};

  // Detect if user is coming from demo/lead capture flow
  const isFromDemoFlow = source === 'lead_capture_modal' || 
                        source === 'journey_progress_panel' || 
                        source === 'existing_lead' ||
                        !user; // Anonymous users are likely from demo

  // Default dashboard path based on user role if not provided
  const defaultDashboardPath = userRole === 'family' 
    ? '/dashboard/family' 
    : userRole === 'professional' 
      ? '/dashboard/professional'
      : '/';
  
  const defaultDashboardLabel = userRole === 'family' 
    ? 'Family Dashboard' 
    : userRole === 'professional' 
      ? 'Professional Dashboard'
      : 'Home';

  // Use provided paths or fallback to defaults - giving priority to explicit referringPagePath
  const dashboardPath = referringPagePath || returnPath || defaultDashboardPath;
  const dashboardLabel = referringPageLabel || defaultDashboardLabel;

  // Get feature-specific benefits based on demo flow or feature type
  const getFeatureBenefits = () => {
    if (isFromDemoFlow) {
      return [
        "Get matched with qualified caregivers in your area",
        "View detailed caregiver profiles and experience",
        "Direct messaging with potential caregivers", 
        "Save and compare your favorite caregivers"
      ];
    }
    
    switch(featureType?.toLowerCase()) {
      case 'posting care needs':
        return [
          "Post unlimited care need requests",
          "Receive priority applications from caregivers",
          "Add detailed care requirements and photos",
          "Set custom notification preferences"
        ];
      case 'caregiver matching':
        return [
          "View unlimited caregiver profiles",
          "Advanced filtering by skills, experience, and availability",
          "Directly message potential caregivers",
          "Save favorites and comparison tools"
        ];
      case 'view full message board':
        return [
          "Access all message board posts and discussions",
          "Post questions and reply to other community members",
          "Join private group discussions for specific care needs",
          "Receive notifications for topics you follow"
        ];
      default:
        return [
          "Access all premium features across the platform",
          "Unlimited interactions with caregivers",
          "Priority support from our care team",
          "Advanced tools for managing care needs"
        ];
    }
  };

  // Determine if we should show family or professional plans
  const getPlanType = () => {
    if (userRole === 'family' || referringPagePath?.includes('family')) {
      return 'family';
    } else if (userRole === 'professional' || referringPagePath?.includes('professional')) {
      return 'professional';
    }
    // If we can't determine from user role or path, try to infer from context
    if (dashboardPath?.includes('family')) {
      return 'family';
    } else if (dashboardPath?.includes('professional')) {
      return 'professional';
    }
    return 'family'; // Default to family plans as fallback
  };

  const planType = getPlanType();
  const featureBenefits = getFeatureBenefits();

  const handleSubscribeClick = () => {
    // For demo flow users, pass the special pricing context
    if (isFromDemoFlow) {
      navigate('/subscription', { 
        state: { 
          returnPath: returnPath || dashboardPath,
          referringPagePath: referringPagePath || dashboardPath,
          referringPageLabel: referringPageLabel || dashboardLabel,
          featureType: 'teaser_unlock',
          fromDemoFlow: true,
          email,
          phone,
          source,
          planId: 'caregiver_match_access'
        } 
      });
    } else {
      // Regular flow
      const fromProfessionalFeatures = planType === 'professional';
      
      navigate('/subscription', { 
        state: { 
          returnPath: returnPath || dashboardPath, 
          referringPagePath: referringPagePath || dashboardPath, 
          referringPageLabel: referringPageLabel || dashboardLabel, 
          featureType,
          fromProfessionalFeatures
        } 
      });
    }
  };

  // Demo flow specific content
  if (isFromDemoFlow) {
    return (
      <div className="container px-4 py-8">
        <div className="mb-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbPage>Choose Your Care Plan</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Get Matched with Caregivers</h1>
            </div>
            <p className="text-xl text-muted-foreground mb-6">
              You've seen how our care journey works. Now get matched with qualified caregivers in your area.
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">
                ✨ <strong>Special Launch Pricing:</strong> Get full caregiver access for just $7.99 one-time payment
              </p>
            </div>
          </div>

          {/* Main Offer Card */}
          <Card className="border-2 border-primary bg-gradient-to-r from-primary/5 to-primary/10 mb-8">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl text-primary">Caregiver Match Access</CardTitle>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">$7.99</div>
                <div className="text-sm text-muted-foreground">One-time payment • Lifetime access</div>
              </div>
              <CardDescription className="text-lg">
                Get matched with qualified, verified caregivers in Trinidad & Tobago
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    What You Get
                  </h3>
                  <ul className="space-y-2">
                    {featureBenefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Why Choose Tavara
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">All caregivers are background checked</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Local caregivers in Trinidad & Tobago</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">24/7 support from our care team</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">No recurring fees or subscriptions</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="text-center pt-4">
                <Button 
                  onClick={handleSubscribeClick}
                  size="lg"
                  className="text-lg px-8 py-6 bg-primary hover:bg-primary/90"
                >
                  Get My Caregiver Matches - $7.99 <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  Secure payment • Cancel anytime • 30-day money-back guarantee
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Benefits */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-6">Join Families Who Trust Tavara</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-primary mb-2">500+</div>
                <div className="text-sm text-muted-foreground">Verified Caregivers</div>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-primary mb-2">1,200+</div>
                <div className="text-sm text-muted-foreground">Successful Matches</div>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-primary mb-2">4.9★</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="mb-4"
            >
              ← Back to Demo
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Regular flow content (existing code)
  return (
    <div className="container px-4 py-8">
      <div className="mb-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            
            {/* Always show the dashboard breadcrumb item, but ensure it's not "Home" again */}
            {dashboardPath && dashboardPath !== "/" && (
              <BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbLink asChild>
                  <Link to={dashboardPath}>{dashboardLabel !== "Home" ? dashboardLabel : "Dashboard"}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}
            
            <BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbPage>Premium Features</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {featureType ? `Unlock ${featureType}` : 'Premium Subscription Features'}
            </h1>
            <p className="text-muted-foreground text-lg">
              {planType === 'family' ? 
                'Enhance your caregiving experience with premium features designed for families.' :
                'Boost your professional profile and access more opportunities with premium features.'}
            </p>
          </div>
          
          {/* Feature details */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                <CardTitle>Premium {featureType || 'Feature'}</CardTitle>
              </div>
              <CardDescription>
                Upgrade your subscription to access this and other premium features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">What you'll get with a premium plan:</h3>
                  <ul className="space-y-2">
                    {featureBenefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                  <h3 className="font-medium mb-2">Why upgrade?</h3>
                  <p>
                    {planType === 'family' ? 
                      'Finding the right care is crucial. Our premium features help you connect with qualified caregivers faster and more effectively.' :
                      'Stand out from other professionals and get more job opportunities with our premium professional features.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleSubscribeClick}
              size="lg"
              className="flex items-center gap-2"
            >
              View Subscription Plans <ArrowRight className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate(dashboardPath)}
            >
              Return to {dashboardLabel}
            </Button>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-xl">Available Plans</CardTitle>
              <CardDescription>
                Choose the plan that best fits your needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {planType === 'family' ? (
                <>
                  <div className="p-3 border rounded-md">
                    <h3 className="font-medium">Family Basic</h3>
                    <p className="text-sm text-muted-foreground">Free</p>
                    <div className="mt-2 text-sm text-muted-foreground">Limited access to essential features</div>
                  </div>
                  
                  <div className="p-3 border-2 border-primary rounded-md bg-primary/5">
                    <h3 className="font-medium text-primary">Family Care</h3>
                    <p className="text-sm text-muted-foreground">$14.99/month</p>
                    <div className="mt-2 text-sm text-muted-foreground">Access to most premium features</div>
                    <Button 
                      className="w-full mt-3" 
                      size="sm"
                      onClick={handleSubscribeClick}
                    >
                      Upgrade to Care
                    </Button>
                  </div>
                  
                  <div className="p-3 border rounded-md">
                    <h3 className="font-medium">Family Premium</h3>
                    <p className="text-sm text-muted-foreground">$29.99/month</p>
                    <div className="mt-2 text-sm text-muted-foreground">Unlimited access to all features</div>
                    <Button 
                      className="w-full mt-3" 
                      variant="outline"
                      size="sm"
                      onClick={handleSubscribeClick}
                    >
                      View Premium
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 border rounded-md">
                    <h3 className="font-medium">Professional Basic</h3>
                    <p className="text-sm text-muted-foreground">Free</p>
                    <div className="mt-2 text-sm text-muted-foreground">Limited access to essential features</div>
                  </div>
                  
                  <div className="p-3 border-2 border-primary rounded-md bg-primary/5">
                    <h3 className="font-medium text-primary">Professional Pro</h3>
                    <p className="text-sm text-muted-foreground">$19.99/month</p>
                    <div className="mt-2 text-sm text-muted-foreground">Enhanced access and visibility</div>
                    <Button 
                      className="w-full mt-3" 
                      size="sm"
                      onClick={handleSubscribeClick}
                    >
                      Upgrade to Pro
                    </Button>
                  </div>
                  
                  <div className="p-3 border rounded-md">
                    <h3 className="font-medium">Professional Expert</h3>
                    <p className="text-sm text-muted-foreground">$34.99/month</p>
                    <div className="mt-2 text-sm text-muted-foreground">Complete access to all features</div>
                    <Button 
                      className="w-full mt-3" 
                      variant="outline"
                      size="sm"
                      onClick={handleSubscribeClick}
                    >
                      View Expert
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
