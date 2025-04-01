import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Clock, Filter, MapPin, DollarSign, Star, Lock, BookOpen, UserCheck, Calendar, MapPinned, Check, CheckSquare } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useTracking } from "@/hooks/useTracking";
import { MatchingTracker } from "@/components/tracking/MatchingTracker";

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
  },
  {
    id: "4",
    full_name: "Robert Garcia",
    first_name: "Robert",
    avatar_url: null,
    hourly_rate: "$25-35",
    location: "Chaguanas",
    years_of_experience: "10+",
    care_types: ["Elderly Care", "Overnight Care"],
    specialized_care: ["Dementia Care", "Stroke Recovery"],
    availability: ["Overnight", "Weekends"],
    match_score: 78,
    is_premium: true,
    has_training: false,
    certifications: ["Home Health Aide"],
    distance: 12.3
  }
];

export default function CaregiverMatchingPage() {
  const { user, isProfileComplete } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [filteredCaregivers, setFilteredCaregivers] = useState<Caregiver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { trackEngagement } = useTracking();
  
  const [careTypes, setCareTypes] = useState<string[]>([]);
  const [specializedCare, setSpecializedCare] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string>("all");
  const [maxDistance, setMaxDistance] = useState<number>(30);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [onlyTrained, setOnlyTrained] = useState<boolean>(false);
  const [requiredCertifications, setRequiredCertifications] = useState<string[]>([]);
  const [minimumExperience, setMinimumExperience] = useState<string>("any");

  const referringPath = location.state?.referringPagePath || 
    (user?.role === 'professional' ? '/dashboard/professional' : '/dashboard/family');
  
  const referringLabel = location.state?.referringPageLabel || 
    (referringPath.includes('professional') ? 'Professional Dashboard' : 'Family Dashboard');
  
  console.log("CaregiverMatching breadcrumb info:", {
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
    const loadCaregivers = async () => {
      try {
        setIsLoading(true);
        
        const { data: professionalUsers, error: professionalError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'professional');
        
        if (professionalError) {
          console.error("Error fetching professional users:", professionalError);
          toast.error("Failed to load professional caregivers");
          setCaregivers(MOCK_CAREGIVERS);
          setFilteredCaregivers(MOCK_CAREGIVERS);
          toast.info("Showing sample caregivers");
          return;
        }
        
        const realCaregivers: Caregiver[] = professionalUsers ? professionalUsers.map(prof => {
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
        }) : [];
        
        console.log("Loaded real professional caregivers:", realCaregivers.length);
        
        let displayCaregivers;
        if (realCaregivers.length === 0) {
          displayCaregivers = MOCK_CAREGIVERS;
          toast.info("Showing sample caregivers");
        } else {
          displayCaregivers = [...realCaregivers, ...MOCK_CAREGIVERS.slice(0, 2)];
        }
        
        setCaregivers(displayCaregivers);
        setFilteredCaregivers(displayCaregivers);
      } catch (error) {
        console.error("Error loading caregivers:", error);
        toast.error("Failed to load caregiver matches");
        setCaregivers(MOCK_CAREGIVERS);
        setFilteredCaregivers(MOCK_CAREGIVERS);
      } finally {
        setIsLoading(false);
      }
    };
    
    let isMounted = true;
    if (user && isProfileComplete && isMounted) {
      loadCaregivers();
    } else if (user && !isProfileComplete && isMounted) {
      navigate("/registration/family", { 
        state: { 
          returnPath: "/caregiver-matching", 
          referringPagePath: referringPath,
          referringPageLabel: referringLabel,
          action: "findCaregiver" 
        }
      });
    } else if (!user && isMounted) {
      navigate("/auth", { 
        state: { 
          returnPath: "/caregiver-matching",
          referringPagePath: referringPath,
          referringPageLabel: referringLabel,
          action: "findCaregiver" 
        }
      });
    }
    
    return () => {
      isMounted = false;
    };
  }, [user, isProfileComplete, navigate, referringPath, referringLabel]);
  
  useEffect(() => {
    if (caregivers.length === 0) return;

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
  }, [caregivers, careTypes, specializedCare, availability, maxDistance, priceRange, onlyTrained, requiredCertifications, minimumExperience]);
  
  const handleCareTypeChange = (type: string) => {
    try {
      trackEngagement('filter_change', { 
        filter_type: 'care_type', 
        filter_value: type,
        previous_state: careTypes.includes(type) ? 'selected' : 'unselected',
        new_state: careTypes.includes(type) ? 'unselected' : 'selected'
      });
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
      });
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
      });
    } catch (error) {
      console.error("Error tracking certification change:", error);
    }
    
    setRequiredCertifications(prev => 
      prev.includes(cert) 
        ? prev.filter(c => c !== cert) 
        : [...prev, cert]
    );
  };
  
  const handleUnlockProfile = async (caregiverId: string, isPremium: boolean) => {
    try {
      await trackEngagement('unlock_profile_click', { 
        caregiver_id: caregiverId, 
        is_premium: isPremium 
      });
    } catch (error) {
      console.error("Error tracking unlock profile click:", error);
    }
    
    navigate("/subscription-features", { 
      state: { 
        returnPath: "/caregiver-matching",
        referringPagePath: referringPath,
        referringPageLabel: referringLabel,
        featureType: "Premium Caregiver Profiles",
        caregiverId: caregiverId
      } 
    });
  };

  const breadcrumbItems = [
    {
      label: referringLabel,
      path: referringPath,
    },
    {
      label: "Caregiver Matching",
      path: "/caregiver-matching",
    },
  ];

  return (
    <div className="container px-4 py-8">
      <MatchingTracker 
        matchingType="caregiver" 
        additionalData={{
          referrer: referringPath,
          filter_count: careTypes.length + specializedCare.length + requiredCertifications.length + 
            (availability !== 'all' ? 1 : 0) + (minimumExperience !== 'any' ? 1 : 0) + 1
        }}
      />
      
      <DashboardHeader breadcrumbItems={breadcrumbItems} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-900 mb-2">Caregiver Matches</h1>
        <p className="text-gray-600">
          We've found {filteredCaregivers.length} caregivers that match your profile requirements
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium text-sm">Care Type Needed</h3>
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
                  setPriceRange([value[0], value[1]] as [number, number]);
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
      </Card>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredCaregivers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No caregivers match your current filters</p>
          <Button 
            variant="outline" 
            className="mt-4"
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
      ) : (
        <div className="space-y-6">
          <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-amber-600" />
                <p className="font-medium text-amber-800">
                  Unlock Premium Matching: Upgrade for priority placement & access to exclusive caregiver profiles.
                </p>
              </div>
              <Button 
                variant="default" 
                className="bg-amber-600 hover:bg-amber-700"
                onClick={() => {
                  try {
                    trackEngagement('premium_matching_cta_click');
                  } catch (error) {
                    console.error("Error tracking premium matching click:", error);
                  }
                  
                  navigate("/subscription-features", { 
                    state: { 
                      returnPath: "/caregiver-matching",
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
          
          {filteredCaregivers.map((caregiver) => (
            <Card 
              key={caregiver.id} 
              className={`relative overflow-hidden ${caregiver.is_premium ? 'border-amber-300 shadow-amber-100' : ''}`}
            >
              {caregiver.is_premium && (
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
                        <AvatarImage src={caregiver.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary-100 text-primary-800 text-xl">
                          {caregiver.full_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="mt-3 text-center">
                        <h3 className="text-lg font-semibold">{caregiver.first_name}</h3>
                        <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mt-1">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{caregiver.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-primary-50 w-full rounded-lg p-2 text-center">
                      <span className="text-sm text-gray-600">Match Score</span>
                      <div className="text-2xl font-bold text-primary-700">{caregiver.match_score}%</div>
                    </div>
                  </div>
                  
                  <div className="col-span-2 space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary-600" />
                        <div>
                          <div className="text-sm text-gray-500">Hourly Rate</div>
                          <div className="font-medium">{caregiver.hourly_rate}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary-600" />
                        <div>
                          <div className="text-sm text-gray-500">Experience</div>
                          <div className="font-medium">{caregiver.years_of_experience} Years</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPinned className="h-4 w-4 text-primary-600" />
                        <div>
                          <div className="text-sm text-gray-500">Distance</div>
                          <div className="font-medium">{caregiver.distance.toFixed(1)} km</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Care Specialties</div>
                      <div className="flex flex-wrap gap-1">
                        {caregiver.care_types?.map((type, i) => (
                          <Badge key={i} variant="outline" className="bg-gray-50">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {caregiver.specialized_care && caregiver.specialized_care.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Special Care Expertise</div>
                        <div className="flex flex-wrap gap-1">
                          {caregiver.specialized_care?.map((specialty, i) => (
                            <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {caregiver.certifications && caregiver.certifications.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Certifications</div>
                        <div className="flex flex-wrap gap-1">
                          {caregiver.certifications.map((cert, i) => (
                            <Badge key={i} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Availability</div>
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
                  
                  <div className="flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-1 mb-2">
                        <UserCheck className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-700">Background Checked</span>
                      </div>

                      {caregiver.has_training && (
                        <div className="flex items-center gap-1 mb-2">
                          <Check className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-blue-700">Platform Trained</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-500" />
                        <Star className="h-4 w-4 text-amber-500" />
                        <Star className="h-4 w-4 text-amber-500" />
                        <Star className="h-4 w-4 text-amber-500" />
                        <Star className="h-4 w-4 text-amber-500" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        className="w-full"
                        onClick={() => handleUnlockProfile(caregiver.id, caregiver.is_premium)}
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
