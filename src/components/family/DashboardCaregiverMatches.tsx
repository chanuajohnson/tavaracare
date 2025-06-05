
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, ArrowRight, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTracking } from "@/hooks/useTracking";
import { toast } from "sonner";
import { SubscriptionFeatureLink } from "@/components/subscription/SubscriptionFeatureLink";

interface Caregiver {
  id: string;
  full_name: string;
  avatar_url: string | null;
  location: string | null;
  care_types: string[] | null;
  years_of_experience: string | null;
  match_score: number;
  is_premium: boolean;
}

const MOCK_CAREGIVERS: Caregiver[] = [{
  id: "1",
  full_name: "Maria Santos",
  avatar_url: null,
  location: "Port of Spain",
  care_types: ["Elderly Care", "Companionship"],
  years_of_experience: "5+ years",
  match_score: 95,
  is_premium: false
}, {
  id: "2", 
  full_name: "James Mitchell",
  avatar_url: null,
  location: "San Fernando",
  care_types: ["Special Needs", "Medical Support"],
  years_of_experience: "8+ years",
  match_score: 89,
  is_premium: true
}, {
  id: "3",
  full_name: "Sarah Johnson",
  avatar_url: null,
  location: "Arima",
  care_types: ["Child Care", "Housekeeping"],
  years_of_experience: "3+ years", 
  match_score: 82,
  is_premium: false
}];

export const DashboardCaregiverMatches = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const { trackEngagement } = useTracking();

  const loadCaregivers = async () => {
    if (!user || dataLoaded) return;
    
    try {
      setIsLoading(true);

      // First use mock caregivers immediately to prevent UI waiting
      setCaregivers(MOCK_CAREGIVERS);

      const { data: professionalUsers, error: professionalError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'professional');
      
      if (professionalError) {
        console.error("Error fetching professional users:", professionalError);
        toast.error("Failed to load caregiver matches");
        setDataLoaded(true);
        return;
      }

      if (!professionalUsers || professionalUsers.length === 0) {
        console.log("No professional users found, using mock data");
        await trackEngagement('dashboard_caregiver_matches_view', { 
          data_source: 'mock_data',
          caregiver_count: MOCK_CAREGIVERS.length,
          view_context: 'dashboard_widget',
          component: 'DashboardCaregiverMatches'
        });
        setDataLoaded(true);
        return;
      }

      const realCaregivers: Caregiver[] = professionalUsers.map(professional => {
        const matchScore = Math.floor(Math.random() * (99 - 65) + 65);
        return {
          id: professional.id,
          full_name: professional.full_name || 'Professional Caregiver',
          avatar_url: professional.avatar_url,
          location: professional.location || 'Port of Spain',
          care_types: professional.care_types || ['General Care'],
          years_of_experience: professional.years_of_experience || '2+ years',
          match_score: matchScore,
          is_premium: false
        };
      });
      
      console.log("Loaded real professional users:", realCaregivers.length);

      // If we have few real caregivers, supplement with some mock ones
      const limitedMockCaregivers = MOCK_CAREGIVERS.slice(0, Math.max(0, 3 - realCaregivers.length));
      const allCaregivers = [...realCaregivers, ...limitedMockCaregivers].slice(0, 3);

      await trackEngagement('dashboard_caregiver_matches_view', {
        data_source: realCaregivers.length > 0 ? 'mixed_data' : 'mock_data',
        real_caregiver_count: realCaregivers.length,
        mock_caregiver_count: limitedMockCaregivers.length,
        view_context: 'dashboard_widget',
        component: 'DashboardCaregiverMatches'
      });
      
      setCaregivers(allCaregivers);
      setDataLoaded(true);
    } catch (error) {
      console.error("Error loading caregivers:", error);
      toast.error("Error loading caregiver matches");
      setDataLoaded(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (user && !dataLoaded) {
      const timer = setTimeout(() => {
        loadCaregivers();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [user, dataLoaded]);

  if (!user) {
    return null;
  }

  return (
    <Card className="mb-8 border-l-4 border-l-primary">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl">Your Caregiver Matches</CardTitle>
          <p className="text-sm text-gray-500">
            {caregivers.length} caregivers match your care needs
          </p>
        </div>
        <SubscriptionFeatureLink
          featureType="Caregiver Matching"
          returnPath="/family-matching"
          referringPagePath="/dashboard/family"
          referringPageLabel="Family Dashboard"
          variant="default"
        >
          <span>View All</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </SubscriptionFeatureLink>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : caregivers.length > 0 ? (
          <div className="space-y-4">
            {caregivers.map(caregiver => (
              <div key={caregiver.id} className={`p-4 rounded-lg border ${caregiver.is_premium ? 'border-amber-300' : 'border-gray-200'} relative`}>
                {caregiver.is_premium && (
                  <div className="absolute top-0 right-0">
                    <Badge className="bg-amber-500 text-white uppercase font-bold rounded-tl-none rounded-tr-sm rounded-br-none rounded-bl-sm px-2">
                      Premium
                    </Badge>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex flex-col items-center sm:items-start sm:w-1/4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                      <AvatarImage src={caregiver.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary-100 text-primary-800 text-xl">
                        {caregiver.full_name.split(' ')[0][0] || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="mt-2 text-center sm:text-left">
                      <h3 className="font-semibold">{caregiver.full_name}</h3>
                      <div className="flex items-center justify-center sm:justify-start gap-1 text-sm text-gray-500">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{caregiver.location}</span>
                      </div>
                      <div className="mt-1 bg-primary-50 rounded px-2 py-1 text-center">
                        <span className="text-sm font-medium text-primary-700">{caregiver.match_score}% Match</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="sm:w-2/4 space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Experience:</span> {caregiver.years_of_experience}
                    </div>
                    
                    <div className="text-sm">
                      <span className="font-medium block mb-1">Specialties:</span>
                      <div className="flex flex-wrap gap-1">
                        {caregiver.care_types?.map((type, i) => (
                          <Badge key={i} variant="outline" className="bg-gray-50">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="sm:w-1/4 flex flex-col justify-center space-y-3">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star}
                          className="h-4 w-4 text-amber-400"
                        />
                      ))}
                    </div>
                    
                    <SubscriptionFeatureLink
                      featureType="Premium Caregiver Profiles"
                      returnPath="/family-matching"
                      referringPagePath="/dashboard/family"
                      referringPageLabel="Family Dashboard"
                      variant="default"
                      className="w-full"
                    >
                      Unlock Profile
                    </SubscriptionFeatureLink>
                  </div>
                </div>
              </div>
            ))}
            
            <SubscriptionFeatureLink
              featureType="Caregiver Matching"
              returnPath="/family-matching"
              referringPagePath="/dashboard/family"
              referringPageLabel="Family Dashboard"
              variant="outline"
              className="w-full mt-2"
            >
              View All Caregiver Matches
              <ArrowRight className="ml-2 h-4 w-4" />
            </SubscriptionFeatureLink>
          </div>
        ) : (
          <div className="text-center py-6">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600">No Matches Found</h3>
            <p className="text-gray-500 mt-2 mb-4">
              Complete your care assessment to get personalized caregiver matches.
            </p>
            <Button variant="outline" onClick={() => navigate("/family/care-needs-assessment")}>
              Complete Assessment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
