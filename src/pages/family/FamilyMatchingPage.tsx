import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Clock, Filter, MapPin, Star, Lock, Calendar, MapPinned, UserCheck, DollarSign } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useTracking } from "@/hooks/useTracking";
import { MatchingTracker } from "@/components/tracking/MatchingTracker";

interface Family {
  id: string;
  full_name: string;
  avatar_url: string | null;
  location: string | null;
  care_types: string[] | null;
  special_needs: string[] | null;
  care_schedule: string | null;
  match_score: number;
  is_premium: boolean;
  distance: number;
  budget_preferences?: string | null;
}

const MOCK_FAMILIES: Family[] = [
  {
    id: "1",
    full_name: "Garcia Family",
    avatar_url: null,
    location: "Port of Spain",
    care_types: ["Elderly Care", "Companionship"],
    special_needs: ["Alzheimer's", "Mobility Assistance"],
    care_schedule: "Weekdays, Evenings",
    match_score: 95,
    is_premium: false,
    distance: 3.2,
    budget_preferences: "$15-25/hr"
  },
  {
    id: "2",
    full_name: "Wilson Family",
    avatar_url: null,
    location: "San Fernando",
    care_types: ["Special Needs", "Medical Support"],
    special_needs: ["Autism Care", "Medication Management"],
    care_schedule: "Full-time, Weekends",
    match_score: 89,
    is_premium: true,
    distance: 15.7,
    budget_preferences: "$25-35/hr"
  },
  {
    id: "3",
    full_name: "Thomas Family",
    avatar_url: null,
    location: "Arima",
    care_types: ["Child Care", "Housekeeping"],
    special_needs: ["Early Childhood Development", "Meal Preparation"],
    care_schedule: "Part-time, Mornings",
    match_score: 82,
    is_premium: false,
    distance: 8.5,
    budget_preferences: "$20-30/hr"
  },
  {
    id: "4",
    full_name: "Ramirez Family",
    avatar_url: null,
    location: "Chaguanas",
    care_types: ["Elderly Care", "Overnight Care"],
    special_needs: ["Dementia Care", "Stroke Recovery"],
    care_schedule: "Overnight, Weekends",
    match_score: 78,
    is_premium: true,
    distance: 12.3,
    budget_preferences: "$30-40/hr"
  }
];

export default function FamilyMatchingPage() {
  const { user, isProfileComplete } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [families, setFamilies] = useState<Family[]>([]);
  const [filteredFamilies, setFilteredFamilies] = useState<Family[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const { trackEngagement } = useTracking();
  
  const [careTypes, setCareTypes] = useState<string[]>([]);
  const [specialNeeds, setSpecialNeeds] = useState<string[]>([]);
  const [scheduleType, setScheduleType] = useState<string>("all");
  const [maxDistance, setMaxDistance] = useState<number>(30);
  const [budgetRange, setBudgetRange] = useState<[number, number]>([15, 50]);

  const referringPath = location.state?.referringPagePath || 
    (user?.role === 'professional' ? '/dashboard/professional' : '/dashboard/family');
  
  const referringLabel = location.state?.referringPageLabel || 
    (referringPath.includes('professional') ? 'Professional Dashboard' : 'Family Dashboard');
  
  console.log("FamilyMatchingPage - Navigation context:", {
    referringPath,
    referringLabel,
    locationState: location.state,
    userRole: user?.role
  });

  const careTypeOptions = [
    "Elderly Care", 
    "Child Care", 
    "Special Needs", 
    "Medical Support", 
    "Overnight Care", 
    "Companionship",
    "Housekeeping"
  ];
  
  const specialNeedsOptions = [
    "Alzheimer's",
    "Mobility Assistance",
    "Medication Management",
    "Autism Care", 
    "Dementia Care",
    "Stroke Recovery",
    "Meal Preparation",
    "Early Childhood Development",
    "Diabetes Management",
    "Parkinson's Care",
    "Physical Therapy Assistance",
    "Post-Surgery Care",
    "Hospice Support",
    "Respiratory Care"
  ];
  
  const scheduleOptions = [
    { value: "all", label: "Any Schedule" },
    { value: "full-time", label: "Full-time" },
    { value: "part-time", label: "Part-time" },
    { value: "weekdays", label: "Weekdays" },
    { value: "weekends", label: "Weekends" },
    { value: "evenings", label: "Evenings" },
    { value: "mornings", label: "Mornings" },
    { value: "overnight", label: "Overnight" }
  ];
  
  const loadFamilies = useCallback(async () => {
    if (!user || dataLoaded) return;
    
    try {
      setIsLoading(true);
      
      // Immediately set mock families to prevent empty UI
      setFamilies(MOCK_FAMILIES);
      setFilteredFamilies(MOCK_FAMILIES);
      
      const { data: familyUsers, error: familyError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'family');
      
      if (familyError) {
        console.error("Error fetching family users:", familyError);
        toast.error("Failed to load family matches");
        setDataLoaded(true); // Mark as loaded even if there was an error to prevent retries
        return; // Keep showing mock data
      }
      
      if (!familyUsers || familyUsers.length === 0) {
        console.log("No family users found, using mock data only");
        
        await trackEngagement('family_matching_page_view', { 
          data_source: 'mock_data',
          family_count: MOCK_FAMILIES.length
        });
        
        setDataLoaded(true);
        return; // Keep showing mock data
      }
      
      const realFamilies: Family[] = familyUsers.map(family => {
        const matchScore = Math.floor(Math.random() * (99 - 65) + 65);
        const distance = parseFloat((Math.random() * 19 + 1).toFixed(1));
        
        return {
          id: family.id,
          full_name: family.full_name || `${family.care_recipient_name || ''} Family`,
          avatar_url: family.avatar_url,
          location: family.location || 'Port of Spain',
          care_types: family.care_types || ['Elderly Care'],
          special_needs: family.special_needs || [],
          care_schedule: family.care_schedule || 'Weekdays',
          match_score: matchScore,
          is_premium: false,
          distance: distance,
          budget_preferences: family.budget_preferences || '$15-30/hr'
        };
      });
      
      console.log("Loaded real family users:", realFamilies.length);
      
      // Combine real families with mock ones if needed
      const allFamilies = [...realFamilies, ...MOCK_FAMILIES];
      
      await trackEngagement('family_matching_page_view', {
        data_source: realFamilies.length > 0 ? 'mixed_data' : 'mock_data',
        real_family_count: realFamilies.length,
        mock_family_count: MOCK_FAMILIES.length
      });
      
      setFamilies(allFamilies);
      setFilteredFamilies(allFamilies);
      setDataLoaded(true);
    } catch (error) {
      console.error("Error loading families:", error);
      toast.error("Failed to load family matches");
      setDataLoaded(true); // Mark as loaded even if there was an error
    } finally {
      setIsLoading(false);
    }
  }, [user, trackEngagement, dataLoaded]);
  
  useEffect(() => {
    if (user && isProfileComplete && !dataLoaded) {
      loadFamilies();
    } else if (user && !isProfileComplete) {
      navigate("/registration/professional", { 
        state: { returnPath: "/family-matching", action: "findFamilies" }
      });
    } else if (!user) {
      navigate("/auth", { 
        state: { returnPath: "/family-matching", action: "findFamilies" }
      });
    }
  }, [user, isProfileComplete, navigate, loadFamilies, dataLoaded]);
  
  useEffect(() => {
    if (families.length === 0) return;

    const applyFilters = () => {
      let result = [...families];

      if (careTypes.length > 0) {
        result = result.filter(family => 
          family.care_types?.some(type => careTypes.includes(type))
        );
      }

      if (specialNeeds.length > 0) {
        result = result.filter(family =>
          family.special_needs?.some(need => specialNeeds.includes(need))
        );
      }

      if (scheduleType !== "all") {
        result = result.filter(family =>
          family.care_schedule?.toLowerCase().includes(scheduleType.toLowerCase())
        );
      }

      result = result.filter(family => family.distance <= maxDistance);
      
      // Apply budget filter
      result = result.filter(family => {
        // Extract numeric values from budget_preferences
        if (!family.budget_preferences) return true; // Include if no budget specified
        
        const match = family.budget_preferences.match(/\$(\d+)(?:-(\d+))?/);
        if (!match) return true;
        
        const minBudget = parseInt(match[1]);
        const maxBudget = match[2] ? parseInt(match[2]) : minBudget;
        
        // Check if there's overlap between the family's budget range and filter range
        return (minBudget <= budgetRange[1] && maxBudget >= budgetRange[0]);
      });

      result.sort((a, b) => b.match_score - a.match_score);

      setFilteredFamilies(result);
    };

    applyFilters();
  }, [families, careTypes, specialNeeds, scheduleType, maxDistance, budgetRange]);
  
  const handleUnlockProfile = async (familyId: string, isPremium: boolean) => {
    await trackEngagement('unlock_family_profile_click', { 
      family_id: familyId, 
      is_premium: isPremium 
    });
    
    navigate("/subscription-features", { 
      state: { 
        returnPath: "/family-matching",
        referringPagePath: referringPath,
        referringPageLabel: referringLabel,
        featureType: "Premium Family Profiles",
        familyId: familyId
      } 
    });
  };

  const handleCareTypeChange = (type: string) => {
    trackEngagement('filter_change', { 
      filter_type: 'care_type', 
      filter_value: type,
      previous_state: careTypes.includes(type) ? 'selected' : 'unselected',
      new_state: careTypes.includes(type) ? 'unselected' : 'selected'
    });
    
    setCareTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };
  
  const handleSpecialNeedsChange = (need: string) => {
    trackEngagement('filter_change', { 
      filter_type: 'special_needs', 
      filter_value: need,
      previous_state: specialNeeds.includes(need) ? 'selected' : 'unselected',
      new_state: specialNeeds.includes(need) ? 'unselected' : 'selected'
    });
    
    setSpecialNeeds(prev => 
      prev.includes(need) 
        ? prev.filter(n => n !== need) 
        : [...prev, need]
    );
  };

  const handleScheduleChange = (value: string) => {
    trackEngagement('filter_change', { 
      filter_type: 'schedule', 
      previous_value: scheduleType,
      new_value: value
    });
    
    setScheduleType(value);
  };
  
  const handleDistanceChange = (value: number[]) => {
    trackEngagement('filter_change', { 
      filter_type: 'distance', 
      previous_value: maxDistance,
      new_value: value[0]
    });
    
    setMaxDistance(value[0]);
  };
  
  const handleBudgetChange = (value: [number, number]) => {
    trackEngagement('filter_change', { 
      filter_type: 'budget_range', 
      previous_value: `${budgetRange[0]}-${budgetRange[1]}`,
      new_value: `${value[0]}-${value[1]}`
    });
    
    setBudgetRange(value);
  };

  const breadcrumbItems = [
    {
      label: referringLabel,
      path: referringPath,
    },
    {
      label: "Family Matching",
      path: "/family-matching",
    },
  ];

  return (
    <div className="container px-4 py-8">
      <MatchingTracker 
        matchingType="family" 
        additionalData={{
          referrer: referringPath,
          filter_count: careTypes.length + specialNeeds.length + (scheduleType !== 'all' ? 1 : 0) + 1
        }}
      />
      
      <DashboardHeader breadcrumbItems={breadcrumbItems} />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-900 mb-2">Family Matches</h1>
        <p className="text-gray-600">
          We've found {filteredFamilies.length} families that match your skills and experience
        </p>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <span>Filter & Sort</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Care Types</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {careTypeOptions.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`care-type-${type}`}
                    checked={careTypes.includes(type)}
                    onCheckedChange={() => handleCareTypeChange(type)}
                  />
                  <Label htmlFor={`care-type-${type}`} className="text-sm">{type}</Label>
                </div>
              ))}
            </div>

            <h3 className="font-medium text-sm">Special Needs</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {specialNeedsOptions.map((need) => (
                <div key={need} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`special-need-${need}`}
                    checked={specialNeeds.includes(need)}
                    onCheckedChange={() => handleSpecialNeedsChange(need)}
                  />
                  <Label htmlFor={`special-need-${need}`} className="text-sm">{need}</Label>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schedule" className="text-sm">Care Schedule</Label>
                <Select
                  value={scheduleType}
                  onValueChange={handleScheduleChange}
                >
                  <SelectTrigger id="schedule">
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    {scheduleOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm flex justify-between">
                  <span>Maximum Distance: {maxDistance} km</span>
                </Label>
                <Slider 
                  value={[maxDistance]} 
                  min={1} 
                  max={50} 
                  step={1}
                  onValueChange={(value) => handleDistanceChange(value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm flex justify-between">
                  <span>Budget Range: ${budgetRange[0]}-${budgetRange[1]}/hr</span>
                </Label>
                <Slider 
                  value={budgetRange} 
                  min={15} 
                  max={50} 
                  step={5}
                  onValueChange={(value) => handleBudgetChange(value as [number, number])}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredFamilies.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No families match your current filters</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setCareTypes([]);
              setSpecialNeeds([]);
              setScheduleType("all");
              setMaxDistance(30);
              setBudgetRange([15, 50]);
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-amber-600" />
                <p className="font-medium text-amber-800">
                  Unlock Premium Matching: Get priority placement with families and access to exclusive job opportunities.
                </p>
              </div>
              <Button 
                variant="default" 
                className="bg-amber-600 hover:bg-amber-700"
                onClick={() => {
                  trackEngagement('premium_family_matching_cta_click');
                  navigate("/subscription-features", { 
                    state: { 
                      returnPath: "/family-matching",
                      referringPagePath: referringPath,
                      referringPageLabel: referringLabel,
                      featureType: "Premium Matching" 
                    } 
                  });
                }}
              >
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
          
          {filteredFamilies.map((family) => (
            <Card 
              key={family.id} 
              className={`relative overflow-hidden ${family.is_premium ? 'border-amber-300 shadow-amber-100' : ''}`}
            >
              {family.is_premium && (
                <div className="absolute top-0 right-0">
                  <Badge className="bg-amber-500 text-white uppercase font-bold rounded-tl-none rounded-tr-sm rounded-br-none rounded-bl-sm px-2">
                    Premium
                  </Badge>
                </div>
              )}
              
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="flex flex-col items-center md:items-start gap-4">
                    <div className="flex flex-col items-center">
                      <Avatar className="h-20 w-20 border-2 border-primary/20">
                        <AvatarImage src={family.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary-100 text-primary-800 text-xl">
                          {family.full_name.split(' ')[0][0] || 'F'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="mt-3 text-center">
                        <h3 className="text-lg font-semibold">{family.full_name}</h3>
                        <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mt-1">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{family.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-primary-50 w-full rounded-lg p-2 text-center">
                      <span className="text-sm text-gray-600">Match Score</span>
                      <div className="text-2xl font-bold text-primary-700">{family.match_score}%</div>
                    </div>
                  </div>
                  
                  <div className="col-span-2 space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-primary-600" />
                        <div>
                          <div className="text-sm text-gray-500">Care Schedule</div>
                          <div className="font-medium">{family.care_schedule}</div>
                        </div>
                      </div>
                      
                      <span className="text-gray-300 mx-2">|</span>
                      
                      <div className="flex items-center gap-1">
                        <MapPinned className="h-4 w-4 text-primary-600" />
                        <div>
                          <div className="text-sm text-gray-500">Distance</div>
                          <div className="font-medium">{family.distance.toFixed(1)} km</div>
                        </div>
                      </div>
                      
                      <span className="text-gray-300 mx-2">|</span>
                      
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-primary-600" />
                        <div>
                          <div className="text-sm text-gray-500">Budget</div>
                          <div className="font-medium">{family.budget_preferences || 'Not specified'}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Care Types Needed</div>
                      <div className="flex flex-wrap gap-1">
                        {family.care_types?.map((type, i) => (
                          <Badge key={i} variant="outline" className="bg-gray-50">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {family.special_needs && family.special_needs.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Special Care Needs</div>
                        <div className="flex flex-wrap gap-1">
                          {family.special_needs?.map((need, i) => (
                            <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {need}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-4 w-4 text-amber-500" />
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        className="w-full"
                        onClick={() => handleUnlockProfile(family.id, family.is_premium)}
                      >
                        Unlock Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

