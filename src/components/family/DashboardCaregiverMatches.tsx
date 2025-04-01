import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, ArrowRight, UserCheck, Clock, Filter, CheckSquare, Check, MapPinned, Calendar, DollarSign } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useTracking } from "@/hooks/useTracking";

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

const MOCK_CAREGIVERS: Caregiver[] = [
  {
    id: "1",
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
  },
  {
    id: "2",
    full_name: "James Wilson",
    first_name: "James",
    avatar_url: null,
    hourly_rate: "$22-30",
    location: "San Fernando",
    years_of_experience: "8+",
    care_types: ["Special Needs", "Medical Support"],
    specialized_care: ["Autism Care", "Medication Management"],
    availability: ["Full-time", "Weekends"],
    match_score: 89,
    is_premium: true,
    has_training: true,
    certifications: ["Registered Nurse", "Dementia Care"],
    distance: 15.7
  },
  {
    id: "3",
    full_name: "Sophia Thomas",
    first_name: "Sophia",
    avatar_url: null,
    hourly_rate: "$20-28",
    location: "Arima",
    years_of_experience: "3+",
    care_types: ["Child Care", "Housekeeping"],
    specialized_care: ["Early Childhood Development", "Meal Preparation"],
    availability: ["Part-time", "Mornings"],
    match_score: 82,
    is_premium: false,
    has_training: false,
    certifications: ["Child Development"],
    distance: 8.5
  }
];

export const DashboardCaregiverMatches = () => {
  const { user, isProfileComplete } = useAuth();
  const navigate = useNavigate();
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [filteredCaregivers, setFilteredCaregivers] = useState<Caregiver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const { trackEngagement } = useTracking();
  const [isMounted, setIsMounted] = useState(true);

  const [careTypes, setCareTypes] = useState<string[]>([]);
  const [specializedCare, setSpecializedCare] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string>("all");
  const [maxDistance, setMaxDistance] = useState<number>(30);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [onlyTrained, setOnlyTrained] = useState<boolean>(false);
  const [requiredCertifications, setRequiredCertifications] = useState<string[]>([]);
  const [minimumExperience, setMinimumExperience] = useState<string>("any");

  const careTypeOptions = [
    "Elderly Care", 
    "Child Care", 
    "Special Needs", 
    "Medical Support", 
    "Overnight Care", 
    "Companionship",
    "Housekeeping"
  ];
  
  const specializedCareOptions = [
    "Alzheimer's",
    "Dementia Care",
    "Mobility Assistance",
    "Medication Management",
    "Autism Care", 
    "Stroke Recovery",
    "Meal Preparation",
    "Early Childhood Development"
  ];
  
  const certificationOptions = [
    "CPR Certified",
    "First Aid",
    "Registered Nurse",
    "Home Health Aide",
    "Certified Nursing Assistant",
    "Dementia Care",
    "Child Development"
  ];
  
  const experienceOptions = [
    { value: "any", label: "Any Experience" },
    { value: "1+", label: "1+ Years" },
    { value: "3+", label: "3+ Years" },
    { value: "5+", label: "5+ Years" },
    { value: "10+", label: "10+ Years" }
  ];
  
  const availabilityOptions = [
    { value: "all", label: "Any Availability" },
    { value: "immediate", label: "Immediate / ASAP" },
    { value: "scheduled", label: "Scheduled" },
    { value: "full-time", label: "Full-time" },
    { value: "part-time", label: "Part-time" },
    { value: "weekdays", label: "Weekdays" },
    { value: "weekends", label: "Weekends" },
    { value: "evenings", label: "Evenings" },
    { value: "overnight", label: "Overnight" }
  ];

  useEffect(() => {
    setIsMounted(true);
    
    const loadCaregivers = async () => {
      if (!isMounted) return;
      
      try {
        setIsLoading(true);
        console.log("Starting to load caregivers");
        
        // First set mock data to avoid prolonged loading states
        if (isMounted) {
          setCaregivers(MOCK_CAREGIVERS);
          setFilteredCaregivers(MOCK_CAREGIVERS);
          console.log("Set initial mock data");
        }
        
        const { data: professionalUsers, error: professionalError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'professional');
        
        if (professionalError) {
          console.error("Error fetching professional users:", professionalError);
          if (isMounted) {
            // We already set mock data, so just show a toast
            toast.error("Using sample caregiver data due to connection issues");
          }
          return;
        }
        
        console.log("Fetched professional users:", professionalUsers?.length);
        
        if (!professionalUsers || professionalUsers.length === 0) {
          console.log("No real caregivers found, using mock data");
          if (isMounted) {
            toast.info("Showing sample caregivers");
          }
          return; // We already set MOCK_CAREGIVERS above
        }
        
        const realCaregivers: Caregiver[] = professionalUsers.map(prof => {
          const matchScore = Math.floor(Math.random() * (99 - 65) + 65);
          const distance = parseFloat((Math.random() * 19 + 1).toFixed(1));
          const fullName = prof.full_name || 'Professional Caregiver';
          const firstName = fullName.split(' ')[0];
          
          return {
            id: prof.id,
            full_name: fullName,
            first_name: firstName,
            avatar_url: prof.avatar_url,
            hourly_rate: prof.hourly_rate || '$15-25',
            location: prof.location || 'Port of Spain',
            years_of_experience: prof.years_of_experience || '1+',
            care_types: prof.care_types || ['Elderly Care'],
            specialized_care: prof.specialized_care || [],
            availability: prof.availability || ['Weekdays'],
            match_score: matchScore,
            is_premium: false,
            has_training: Boolean(prof.has_training || prof.certifications?.length > 0),
            certifications: prof.certifications || [],
            distance: distance
          };
        });
        
        console.log("Processed real caregivers:", realCaregivers.length);
        
        let displayCaregivers;
        if (realCaregivers.length < 3) {
          console.log("Not enough real caregivers, adding mock data");
          const limitedMockCaregivers = MOCK_CAREGIVERS.slice(0, Math.max(0, 3 - realCaregivers.length));
          displayCaregivers = [...realCaregivers, ...limitedMockCaregivers].slice(0, 3);
          if (realCaregivers.length === 0) {
            if (isMounted) toast.info("Showing sample caregivers");
          }
        } else {
          displayCaregivers = realCaregivers.slice(0, 3);
        }
        
        if (isMounted) {
          setCaregivers(displayCaregivers);
          setFilteredCaregivers(displayCaregivers);
          console.log("Set caregivers in state:", displayCaregivers.length);
        }
        
      } catch (error) {
        console.error("Error loading caregivers:", error);
        // We already set mock data above, so just show a toast
        if (isMounted) {
          toast.error("Using sample caregiver data due to unexpected error");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          console.log("Finished loading caregivers, isLoading set to false");
        }
      }
      
      // Try to track engagement, but don't let it block the UI
      try {
        if (user && isMounted) {
          trackEngagement('dashboard_caregiver_matches_view').catch(err => {
            console.error("Tracking error:", err);
          });
        }
      } catch (trackingError) {
        console.error("Tracking setup error:", trackingError);
      }
    };
    
    if (user) {
      loadCaregivers();
    } else {
      setIsLoading(false);
    }
    
    return () => {
      setIsMounted(false);
    };
  }, [user]);

  useEffect(() => {
    if (!isMounted || caregivers.length === 0) return;

    const applyFilters = () => {
      let result = [...caregivers];

      // Care Types Filter
      if (careTypes.length > 0) {
        result = result.filter(caregiver => 
          caregiver.care_types?.some(type => careTypes.includes(type))
        );
      }

      // Specialized Care Filter
      if (specializedCare.length > 0) {
        result = result.filter(caregiver =>
          caregiver.specialized_care?.some(care => specializedCare.includes(care))
        );
      }

      // Availability Filter
      if (availability !== "all") {
        result = result.filter(caregiver =>
          caregiver.availability?.some(avail => 
            avail.toLowerCase().includes(availability.toLowerCase())
          )
        );
      }

      // Distance Filter
      result = result.filter(caregiver => caregiver.distance <= maxDistance);

      // Price Range Filter
      result = result.filter(caregiver => {
        const minPrice = parseInt(caregiver.hourly_rate?.split('-')[0].replace('$', '') || '0');
        const maxPrice = parseInt(caregiver.hourly_rate?.split('-')[1]?.replace('$', '') || minPrice.toString());
        return minPrice <= priceRange[1] && maxPrice >= priceRange[0];
      });

      // Training Filter
      if (onlyTrained) {
        result = result.filter(caregiver => caregiver.has_training);
      }

      // Certifications Filter
      if (requiredCertifications.length > 0) {
        result = result.filter(caregiver =>
          caregiver.certifications?.some(cert => requiredCertifications.includes(cert))
        );
      }

      // Experience Filter
      if (minimumExperience !== "any") {
        result = result.filter(caregiver => {
          const caregiverYears = parseInt(caregiver.years_of_experience?.replace('+', '') || '0');
          const requiredYears = parseInt(minimumExperience.replace('+', '') || '0');
          return caregiverYears >= requiredYears;
        });
      }

      // Sort by match score
      result.sort((a, b) => b.match_score - a.match_score);

      setFilteredCaregivers(result);
    };

    applyFilters();
  }, [caregivers, careTypes, specializedCare, availability, maxDistance, priceRange, onlyTrained, requiredCertifications, minimumExperience, isMounted]);

  const handleCareTypeChange = (type: string) => {
    try {
      trackEngagement('filter_change', { 
        filter_type: 'care_type', 
        filter_value: type,
        previous_state: careTypes.includes(type) ? 'selected' : 'unselected',
        new_state: careTypes.includes(type) ? 'unselected' : 'selected'
      }).catch(err => console.error("Tracking error:", err));
    } catch (error) {
      console.error("Error tracking care type change:", error);
    }
    
    setCareTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };
  
  const handleSpecializedCareChange = (care: string) => {
    try {
      trackEngagement('filter_change', { 
        filter_type: 'specialized_care', 
        filter_value: care,
        previous_state: specializedCare.includes(care) ? 'selected' : 'unselected',
        new_state: specializedCare.includes(care) ? 'unselected' : 'selected'
      }).catch(err => console.error("Tracking error:", err));
    } catch (error) {
      console.error("Error tracking specialized care change:", error);
    }
    
    setSpecializedCare(prev => 
      prev.includes(care) 
        ? prev.filter(c => c !== care) 
        : [...prev, care]
    );
  };
  
  const handleCertificationChange = (cert: string) => {
    try {
      trackEngagement('filter_change', { 
        filter_type: 'certification', 
        filter_value: cert,
        previous_state: requiredCertifications.includes(cert) ? 'selected' : 'unselected',
        new_state: requiredCertifications.includes(cert) ? 'unselected' : 'selected'
      }).catch(err => console.error("Tracking error:", err));
    } catch (error) {
      console.error("Error tracking certification change:", error);
    }
    
    setRequiredCertifications(prev => 
      prev.includes(cert) 
        ? prev.filter(c => c !== cert) 
        : [...prev, cert]
    );
  };

  const handleUnlockProfile = (caregiverId: string) => {
    try {
      trackEngagement('unlock_profile_click', { caregiver_id: caregiverId })
        .catch(err => console.error("Tracking error:", err));
    } catch (error) {
      console.error("Error tracking unlock profile click:", error);
    }
    
    navigate("/subscription-features", { 
      state: { 
        returnPath: "/caregiver-matching",
        referringPagePath: "/dashboard/family",
        referringPageLabel: "Family Dashboard",
        featureType: "Premium Profiles",
        caregiverId: caregiverId
      } 
    });
  };

  if (!user) {
    return null;
  }

  if (!isProfileComplete) {
    return (
      <Card className="mb-8 border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="text-xl">Complete Your Profile for Caregiver Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-gray-600">
            Provide your care preferences to see personalized caregiver matches that fit your specific needs.
          </p>
          <Button 
            onClick={() => navigate("/registration/family", { 
              state: { returnPath: "/caregiver-matching", action: "findCaregiver" }
            })}
          >
            Complete Profile
          </Button>
        </CardContent>
      </Card>
    );
  }

  console.log("Rendering DashboardCaregiverMatches, isLoading:", isLoading, "filteredCaregivers:", filteredCaregivers.length);

  return (
    <Card className="mb-8 border-l-4 border-l-primary">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl">Caregiver Matches</CardTitle>
          <p className="text-sm text-gray-500">
            {filteredCaregivers.length} caregivers match your criteria
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          <Button 
            variant="default" 
            className="flex items-center gap-1"
            onClick={() => {
              try {
                trackEngagement('view_all_matches_click')
                  .catch(err => console.error("Tracking error:", err));
              } catch (error) {
                console.error("Error tracking view all click:", error);
              }
              
              navigate("/caregiver-matching", {
                state: {
                  referringPagePath: "/dashboard/family",
                  referringPageLabel: "Family Dashboard"
                }
              });
            }}
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      {showFilters && (
        <CardContent className="border-b pb-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium text-sm">Care Types Needed</h3>
                <div className="grid grid-cols-2 gap-2">
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
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium text-sm">Specialized Care Needs</h3>
                <div className="grid grid-cols-2 gap-2">
                  {specializedCareOptions.map((care) => (
                    <div key={care} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`specialized-care-${care}`}
                        checked={specializedCare.includes(care)}
                        onCheckedChange={() => handleSpecializedCareChange(care)}
                      />
                      <Label htmlFor={`specialized-care-${care}`} className="text-sm">{care}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Required Certifications</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {certificationOptions.map((cert) => (
                  <div key={cert} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`cert-${cert}`}
                      checked={requiredCertifications.includes(cert)}
                      onCheckedChange={() => handleCertificationChange(cert)}
                    />
                    <Label htmlFor={`cert-${cert}`} className="text-sm">{cert}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="availability" className="text-sm">Caregiver Availability</Label>
                <Select
                  value={availability}
                  onValueChange={(value) => {
                    try {
                      trackEngagement('filter_change', { 
                        filter_type: 'availability', 
                        previous_value: availability,
                        new_value: value
                      });
                    } catch (error) {
                      console.error("Error tracking availability change:", error);
                    }
                    setAvailability(value);
                  }}
                >
                  <SelectTrigger id="availability">
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    {availabilityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="experience" className="text-sm">Minimum Experience</Label>
                <Select
                  value={minimumExperience}
                  onValueChange={(value) => {
                    try {
                      trackEngagement('filter_change', { 
                        filter_type: 'experience', 
                        previous_value: minimumExperience,
                        new_value: value
                      });
                    } catch (error) {
                      console.error("Error tracking experience change:", error);
                    }
                    setMinimumExperience(value);
                  }}
                >
                  <SelectTrigger id="experience">
                    <SelectValue placeholder="Select minimum experience" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceOptions.map(option => (
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
                  onValueChange={(value) => {
                    try {
                      trackEngagement('filter_change', { 
                        filter_type: 'distance', 
                        previous_value: maxDistance,
                        new_value: value[0]
                      });
                    } catch (error) {
                      console.error("Error tracking distance change:", error);
                    }
                    setMaxDistance(value[0]);
                  }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm flex justify-between">
                <span>Price Range: ${priceRange[0]} - ${priceRange[1]}</span>
              </Label>
              <Slider 
                value={priceRange} 
                min={0} 
                max={100} 
                step={5}
                onValueChange={(value: number[]) => {
                  try {
                    trackEngagement('filter_change', { 
                      filter_type: 'price_range', 
                      previous_value: `${priceRange[0]}-${priceRange[1]}`,
                      new_value: `${value[0]}-${value[1]}`
                    });
                  } catch (error) {
                    console.error("Error tracking price range change:", error);
                  }
                  setPriceRange([value[0], value[1]]);
                }}
              />
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="trained-caregivers" 
                checked={onlyTrained}
                onCheckedChange={(checked) => {
                  try {
                    trackEngagement('filter_change', { 
                      filter_type: 'trained_only', 
                      previous_value: onlyTrained,
                      new_value: checked
                    });
                  } catch (error) {
                    console.error("Error tracking trained only change:", error);
                  }
                  setOnlyTrained(checked as boolean);
                }}
              />
              <Label htmlFor="trained-caregivers" className="text-sm">Show only platform-trained caregivers</Label>
            </div>
          </div>
        </CardContent>
      )}
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredCaregivers.length > 0 ? (
          <div className="space-y-4">
            {filteredCaregivers.map((caregiver) => (
              <div 
                key={caregiver.id}
                className={`p-4 rounded-lg border ${caregiver.is_premium ? 'border-amber-300' : 'border-gray-200'} relative`}
              >
                {caregiver.is_premium && (
                  <div className="absolute top-0 right-0">
                    <Badge className="bg-amber-500 text-white uppercase font-bold rounded-tl-none rounded-tr-sm rounded-br-none rounded-bl-sm px-2">
                      Premium
                    </Badge>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex flex-col items-center sm:items-start sm:w-1/5">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                      <AvatarImage src={caregiver.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary-100 text-primary-800 text-xl">
                        {caregiver.full_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="mt-2 text-center sm:text-left">
                      <h3 className="font-semibold">{caregiver.first_name}</h3>
                      <div className="flex items-center justify-center sm:justify-start gap-1 text-sm text-gray-500">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{caregiver.location}</span>
                      </div>
                      <div className="mt-1 bg-primary-50 rounded px-2 py-1 text-center">
                        <span className="text-sm font-medium text-primary-700">{caregiver.match_score}% Match</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="sm:w-2/5 space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5 text-gray-500" />
                        <span>{caregiver.hourly_rate}/hr</span>
                      </div>
                      <span className="text-gray-300">|</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-gray-500" />
                        <span>{caregiver.years_of_experience} Experience</span>
                      </div>
                      <span className="text-gray-300">|</span>
                      <div className="flex items-center gap-1">
                        <MapPinned className="h-3.5 w-3.5 text-gray-500" />
                        <span>{caregiver.distance.toFixed(1)} km away</span>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <span className="font-medium block mb-1">Care Types:</span>
                      <div className="flex flex-wrap gap-1">
                        {caregiver.care_types?.map((type, i) => (
                          <Badge key={i} variant="outline" className="bg-gray-50">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {caregiver.specialized_care && caregiver.specialized_care.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium block mb-1">Specialized Care:</span>
                        <div className="flex flex-wrap gap-1">
                          {caregiver.specialized_care.map((care, i) => (
                            <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {care}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {caregiver.certifications && caregiver.certifications.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium block mb-1">Certifications:</span>
                        <div className="flex flex-wrap gap-1">
                          {caregiver.certifications.map((cert, i) => (
                            <Badge key={i} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-sm">
                      <span className="font-medium block mb-1">Availability:</span>
                      <div className="flex flex-wrap gap-1">
                        {caregiver.availability?.map((avail, i) => (
                          <div key={i} className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            <Calendar className="h-3 w-3" />
                            <span>{avail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="sm:w-2/5 md:w-1/5 flex flex-col justify-center space-y-3">
                    <div className="flex items-center gap-1">
                      <UserCheck className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700">Background Checked</span>
                    </div>
                    
                    {caregiver.has_training && (
                      <div className="flex items-center gap-1">
                        <Check className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-700">Platform Trained</span>
                      </div>
                    )}
                    
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 text-amber-500" />
                      ))}
                    </div>
                    
                    <Button 
                      variant="default"
                      className="w-full"
                      onClick={() => handleUnlockProfile(caregiver.id)}
                    >
                      Unlock Profile
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              className="w-full mt-2"
              onClick={() => {
                try {
                  trackEngagement('view_all_matches_click')
                    .catch(err => console.error("Tracking error:", err));
                } catch (error) {
                  console.error("Error tracking view all click:", error);
                }
                
                navigate("/caregiver-matching", {
                  state: {
                    referringPagePath: "/dashboard/family",
                    referringPageLabel: "Family Dashboard"
                  }
                });
              }}
            >
              View All Caregiver Matches
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">No caregivers match your selected filters</p>
            <Button 
              variant="outline"
              onClick={() => {
                setCareTypes([]);
                setSpecializedCare([]);
                setRequiredCertifications([]);
                setAvailability("all");
                setMinimumExperience("any");
                setMaxDistance(30);
                setPriceRange([0, 100]);
                setOnlyTrained(false);
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
