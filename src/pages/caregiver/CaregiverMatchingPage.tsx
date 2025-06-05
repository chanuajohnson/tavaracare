
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Star, Lock, BookOpen, UserCheck, Calendar, MapPinned, Check, CheckSquare, DollarSign, MapPin } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useTracking } from "@/hooks/useTracking";
import { MatchingTracker } from "@/components/tracking/MatchingTracker";
import { SubscriptionFeatureLink } from "@/components/subscription/SubscriptionFeatureLink";

interface Caregiver {
  id: string;
  full_name: string;
  first_name: string;
  avatar_url: string | null;
  hourly_rate: string | null;
  location: string | null;
  years_of_experience: string | null;
  care_types: string[] | null;
  specialized_care: string[] | null;
  availability: string[] | null;
  match_score: number;
  is_premium: boolean;
  has_training: boolean;
  certifications: string[] | null;
  distance: number;
}

const SINGLE_TEASER_CAREGIVER: Caregiver = {
  id: "teaser-1",
  full_name: "Maria Johnson",
  first_name: "Maria",
  avatar_url: null,
  hourly_rate: "$18-25",
  location: "Port of Spain",
  years_of_experience: "5+",
  care_types: ["Elderly Care", "Companionship"],
  specialized_care: ["Alzheimer's", "Mobility Assistance"],
  availability: ["Weekdays", "Evenings"],
  match_score: 95,
  is_premium: false,
  has_training: true,
  certifications: ["CPR Certified", "First Aid"],
  distance: 3.2
};

export default function CaregiverMatchingPage() {
  const { user, isProfileComplete } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const { trackEngagement } = useTracking();
  
  const referringPath = location.state?.referringPagePath || '/dashboard/family';
  const referringLabel = location.state?.referringPageLabel || 'Family Dashboard';
  
  console.log("CaregiverMatching breadcrumb info:", {
    referringPath,
    referringLabel,
    locationState: location.state,
    userRole: user?.role
  });

  useEffect(() => {
    const loadSingleMatch = async () => {
      try {
        setIsLoading(true);
        
        // Track page view
        await trackEngagement('caregiver_matching_page_view', {
          source: 'limited_family_access',
          referrer: referringPath
        });
        
        // Simulate loading time for better UX
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error("Error loading single match:", error);
        setIsLoading(false);
      }
    };
    
    let isMounted = true;
    if (user && isProfileComplete && isMounted) {
      loadSingleMatch();
    } else if (user && !isProfileComplete && isMounted) {
      navigate("/registration/family", { 
        state: { 
          returnPath: "/caregiver/matching", 
          referringPagePath: referringPath,
          referringPageLabel: referringLabel,
          action: "findCaregiver" 
        }
      });
    } else if (!user && isMounted) {
      navigate("/auth", { 
        state: { 
          returnPath: "/caregiver/matching",
          referringPagePath: referringPath,
          referringPageLabel: referringLabel,
          action: "findCaregiver" 
        }
      });
    }
    
    return () => {
      isMounted = false;
    };
  }, [user, isProfileComplete, navigate, referringPath, referringLabel, trackEngagement]);
  
  const handleUnlockMoreMatches = async () => {
    try {
      await trackEngagement('unlock_more_matches_click', { 
        source: 'single_caregiver_teaser' 
      });
    } catch (error) {
      console.error("Error tracking unlock more matches click:", error);
    }
  };

  const handleScheduleWork = async () => {
    try {
      await trackEngagement('schedule_work_click', { 
        caregiver_id: SINGLE_TEASER_CAREGIVER.id,
        match_score: SINGLE_TEASER_CAREGIVER.match_score
      });
      
      // Open WhatsApp with pre-filled message
      const phoneNumber = "8687865357";
      const message = `Hi! I'd like to schedule work with ${SINGLE_TEASER_CAREGIVER.first_name} for caregiving services. My match score with her is ${SINGLE_TEASER_CAREGIVER.match_score}%.`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
      
    } catch (error) {
      console.error("Error tracking schedule work click:", error);
    }
  };

  const breadcrumbItems = [
    {
      label: referringLabel,
      path: referringPath,
    },
    {
      label: "Caregiver Matching",
      path: "/caregiver/matching",
    },
  ];

  if (isLoading) {
    return (
      <div className="container px-4 py-8">
        <MatchingTracker 
          matchingType="caregiver" 
          additionalData={{
            referrer: referringPath,
            access_type: 'limited_family_preview'
          }}
        />
        
        <DashboardHeader breadcrumbItems={breadcrumbItems} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-900 mb-2">Your Perfect Caregiver Match</h1>
          <p className="text-gray-600">
            Finding your ideal caregiver match...
          </p>
        </div>
        
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <MatchingTracker 
        matchingType="caregiver" 
        additionalData={{
          referrer: referringPath,
          access_type: 'limited_family_preview',
          shown_matches: 1
        }}
      />
      
      <DashboardHeader breadcrumbItems={breadcrumbItems} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-900 mb-2">Your Perfect Caregiver Match</h1>
        <p className="text-gray-600">
          We found your ideal caregiver match based on your care needs and preferences
        </p>
      </div>
      
      {/* Upgrade Banner */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 mb-6">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">
                See More Caregiver Matches
              </p>
              <p className="text-sm text-blue-600">
                Upgrade to view all qualified caregivers in your area and compare options
              </p>
            </div>
          </div>
          <SubscriptionFeatureLink
            featureType="Premium Caregiver Matching"
            returnPath="/caregiver/matching"
            referringPagePath={referringPath}
            referringPageLabel={referringLabel}
            variant="default"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <span onClick={handleUnlockMoreMatches}>View All Matches</span>
          </SubscriptionFeatureLink>
        </CardContent>
      </Card>
      
      {/* Single Caregiver Match */}
      <Card className="relative overflow-hidden border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="absolute top-0 right-0">
          <Badge className="bg-green-500 text-white uppercase font-bold rounded-tl-none rounded-tr-sm rounded-br-none rounded-bl-sm px-3 py-1">
            Perfect Match
          </Badge>
        </div>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex flex-col items-center">
                <Avatar className="h-20 w-20 border-2 border-primary/20">
                  <AvatarImage src={SINGLE_TEASER_CAREGIVER.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary-100 text-primary-800 text-xl">
                    {SINGLE_TEASER_CAREGIVER.full_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="mt-3 text-center">
                  <h3 className="text-lg font-semibold">{SINGLE_TEASER_CAREGIVER.first_name}</h3>
                  <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{SINGLE_TEASER_CAREGIVER.location}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-100 w-full rounded-lg p-3 text-center border border-green-200">
                <span className="text-sm text-green-700 font-medium">Match Score</span>
                <div className="text-3xl font-bold text-green-800">{SINGLE_TEASER_CAREGIVER.match_score}%</div>
                <span className="text-xs text-green-600">Excellent Match!</span>
              </div>
            </div>
            
            <div className="col-span-2 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary-600" />
                  <div>
                    <div className="text-sm text-gray-500">Hourly Rate</div>
                    <div className="font-medium">{SINGLE_TEASER_CAREGIVER.hourly_rate}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary-600" />
                  <div>
                    <div className="text-sm text-gray-500">Experience</div>
                    <div className="font-medium">{SINGLE_TEASER_CAREGIVER.years_of_experience} Years</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPinned className="h-4 w-4 text-primary-600" />
                  <div>
                    <div className="text-sm text-gray-500">Distance</div>
                    <div className="font-medium">{SINGLE_TEASER_CAREGIVER.distance.toFixed(1)} km</div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Care Specialties</div>
                <div className="flex flex-wrap gap-1">
                  {SINGLE_TEASER_CAREGIVER.care_types?.map((type, i) => (
                    <Badge key={i} variant="outline" className="bg-gray-50">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Special Care Expertise</div>
                <div className="flex flex-wrap gap-1">
                  {SINGLE_TEASER_CAREGIVER.specialized_care?.map((specialty, i) => (
                    <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Certifications</div>
                <div className="flex flex-wrap gap-1">
                  {SINGLE_TEASER_CAREGIVER.certifications?.map((cert, i) => (
                    <Badge key={i} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Availability</div>
                <div className="flex flex-wrap gap-1">
                  {SINGLE_TEASER_CAREGIVER.availability?.map((avail, i) => (
                    <div key={i} className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      <Calendar className="h-3 w-3" />
                      <span>{avail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <UserCheck className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700">Background Checked</span>
                </div>

                <div className="flex items-center gap-1 mb-2">
                  <Check className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-700">Platform Trained</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-500" />
                  <Star className="h-4 w-4 text-amber-500" />
                  <Star className="h-4 w-4 text-amber-500" />
                  <Star className="h-4 w-4 text-amber-500" />
                  <Star className="h-4 w-4 text-amber-500" />
                  <span className="text-sm text-gray-600 ml-1">5.0 (12 reviews)</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleScheduleWork}
                >
                  Schedule Work with {SINGLE_TEASER_CAREGIVER.first_name}
                </Button>
                <SubscriptionFeatureLink
                  featureType="Premium Caregiver Matching"
                  returnPath="/caregiver/matching"
                  referringPagePath={referringPath}
                  referringPageLabel={referringLabel}
                  variant="outline"
                  className="w-full"
                >
                  <span onClick={handleUnlockMoreMatches}>View More Caregivers</span>
                </SubscriptionFeatureLink>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Why Choose This Match */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Why This Is Your Perfect Match</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-green-600" />
                <span className="text-sm">Specializes in your required care types</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-green-600" />
                <span className="text-sm">Available during your preferred times</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-green-600" />
                <span className="text-sm">Within your budget range</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-green-600" />
                <span className="text-sm">Located close to you</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-green-600" />
                <span className="text-sm">Excellent reviews and ratings</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-green-600" />
                <span className="text-sm">Platform-verified and trained</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
