
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Home, Lock, CheckCircle, ArrowRight, Heart, Users, Shield, Star, Sparkles, Video } from 'lucide-react';
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

  // Check if this is video call related
  const isVideoCallFeature = featureType?.toLowerCase().includes('video') || 
                            featureType?.toLowerCase().includes('call');

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

    if (isVideoCallFeature) {
      return [
        "Instant video calls with matched caregivers",
        "Skip the text chat phase entirely",
        "30-minute secure video sessions",
        "TAV-moderated professional meetings",
        "Schedule multiple caregiver interviews back-to-back",
        "Record session notes and caregiver responses"
      ];
    }
    
    switch(featureType?.toLowerCase()) {
      case 'caregiver matching':
      case 'unlock matches':
      case 'view caregiver profile':
      case 'browse all matches':
        return [
          "Access unlimited caregiver profiles and matches",
          "View complete caregiver backgrounds, experience, and certifications",
          "Free unlimited messaging with all caregivers",
          "Save favorites and create comparison lists",
          "Advanced filtering by skills, availability, and location",
          "Priority access to new caregiver registrations"
        ];
      case 'posting care needs':
        return [
          "Post unlimited care need requests",
          "Receive priority applications from caregivers",
          "Add detailed care requirements and photos",
          "Set custom notification preferences"
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
    const breadcrumbItems = [
      { label: 'Home', href: '/' },
      { label: 'Choose Your Care Plan', href: location.pathname, current: true }
    ];

    return (
      <div className="container px-4 py-8">
        <div className="mb-8">
          <Breadcrumb items={breadcrumbItems} />
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
                ✨ <strong>Launch Waiver:</strong> Get full caregiver access during our launch period
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
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="text-2xl font-bold line-through text-gray-400">$7.99</div>
                  <div className="text-4xl font-bold text-primary">FREE</div>
                </div>
                <div className="text-sm text-green-600 font-medium mb-1">Launch Waiver</div>
                <div className="text-sm text-muted-foreground">During launch period • Limited time</div>
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
                  Get My Caregiver Matches - Sign Up with Tavara to get started <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  Tavara.care launch sign up drive
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

  // Regular flow content for logged-in users
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    ...(dashboardPath && dashboardPath !== "/" ? [{ label: dashboardLabel !== "Home" ? dashboardLabel : "Dashboard", href: dashboardPath }] : []),
    { label: 'Premium Features', href: location.pathname, current: true }
  ];

  return (
    <div className="container px-4 py-8">
      <div className="mb-8">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            {isVideoCallFeature ? (
              <Video className="h-8 w-8 text-primary" />
            ) : (
              <Sparkles className="h-8 w-8 text-primary" />
            )}
            <h1 className="text-4xl font-bold">
              {isVideoCallFeature
                ? 'Unlock Instant Video Calls' 
                : featureType === 'caregiver matching' || featureType === 'unlock matches' || featureType === 'view caregiver profile' || featureType === 'browse all matches'
                ? 'Unlock Caregiver Matching' 
                : `Unlock ${featureType || 'Premium Features'}`}
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-6">
            {isVideoCallFeature ? 
              'Skip the chat phase and meet your caregivers face-to-face instantly.' :
              planType === 'family' ? 
                'Get full access to Trinidad & Tobago\'s most trusted caregiver network.' :
                'Boost your professional profile and access more opportunities.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Feature Details Card */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  {isVideoCallFeature ? (
                    <Video className="h-5 w-5 text-primary" />
                  ) : (
                    <Lock className="h-5 w-5 text-primary" />
                  )}
                  <CardTitle className="text-xl">
                    {isVideoCallFeature
                      ? 'Instant Video Calls with Caregivers'
                      : featureType === 'caregiver matching' || featureType === 'unlock matches' || featureType === 'view caregiver profile' || featureType === 'browse all matches'
                      ? 'Caregiver Matching & Profiles' 
                      : `Premium ${featureType || 'Feature'}`}
                  </CardTitle>
                </div>
                <CardDescription>
                  {isVideoCallFeature 
                    ? 'Upgrade to skip chat and meet caregivers instantly via secure video calls'
                    : 'Upgrade to access this feature and unlock the full Tavara experience'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg border border-primary/20">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Star className="h-5 w-5 text-primary" />
                      {isVideoCallFeature 
                        ? 'What you\'ll get with video call access:'
                        : 'What you\'ll get with premium access:'}
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
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold mb-2 text-blue-800">
                      {isVideoCallFeature 
                        ? 'Why families choose video calls:'
                        : 'Why families choose Tavara Premium:'}
                    </h3>
                    <p className="text-sm text-blue-700">
                      {isVideoCallFeature ?
                        'Save time and get a better sense of your caregiver match through face-to-face conversation. Video calls help you assess communication style, professionalism, and comfort level before making your decision.' :
                        planType === 'family' ? 
                          'Finding the right caregiver is crucial for your loved one\'s wellbeing. Our premium matching system helps you connect with qualified, background-checked caregivers faster and more effectively than anywhere else in Trinidad & Tobago.' :
                          'Stand out from other professionals and get more job opportunities with our premium professional features.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Trust Indicators */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Why Trinidad & Tobago trusts Tavara
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Background-Checked Caregivers</p>
                      <p className="text-xs text-muted-foreground">Every caregiver goes through our comprehensive vetting process</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Local Community Focus</p>
                      <p className="text-xs text-muted-foreground">Built specifically for Trinidad & Tobago families</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">24/7 Support</p>
                      <p className="text-xs text-muted-foreground">Our care coordinators are always here to help</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Secure & Private</p>
                      <p className="text-xs text-muted-foreground">Your family's information is protected and encrypted</p>
                    </div>
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
                {isVideoCallFeature ? (
                  <>
                    <Video className="h-4 w-4" />
                    Unlock Video Calls <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Unlock Premium Access <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate(dashboardPath)}
              >
                Return to {dashboardLabel}
              </Button>
            </div>
          </div>
          
          {/* Pricing Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-xl">Choose Your Plan</CardTitle>
                <CardDescription>
                  {isVideoCallFeature 
                    ? 'Get instant video access today'
                    : 'Get started with premium access today'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {planType === 'family' ? (
                  <>
                    <div className="p-4 border-2 border-primary rounded-lg bg-gradient-to-r from-primary/5 to-primary/10">
                      <div className="text-center mb-3">
                        <h3 className="font-semibold text-primary text-lg">
                          {isVideoCallFeature ? 'Video Call Access' : 'Caregiver Access'}
                        </h3>
                        <div className="text-3xl font-bold text-primary">$14.99</div>
                        <div className="text-sm text-muted-foreground">Monthly subscription</div>
                      </div>
                      <ul className="space-y-2 text-sm mb-4">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Unlimited caregiver chat (free)
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {isVideoCallFeature ? 'Instant video calls' : 'Full profile access'}
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {isVideoCallFeature ? '30-minute sessions' : 'Advanced search & filters'}
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {isVideoCallFeature ? 'TAV-moderated meetings' : 'Priority matching'}
                        </li>
                      </ul>
                      <Button 
                        className="w-full" 
                        onClick={handleSubscribeClick}
                      >
                        {isVideoCallFeature ? 'Get Video Access' : 'Get Access Now'}
                      </Button>
                    </div>
                    
                    <div className="text-center p-3 text-sm text-muted-foreground">
                      <p>💬 <strong>Free:</strong> Unlimited chat with all caregivers</p>
                      <p>📹 <strong>Premium:</strong> {isVideoCallFeature ? 'Skip chat, meet instantly' : 'Enhanced matching & profiles'}</p>
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
    </div>
  );
}
