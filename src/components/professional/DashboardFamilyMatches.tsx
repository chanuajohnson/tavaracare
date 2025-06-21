import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, ArrowRight, Clock, Filter, MapPinned, DollarSign, Calendar, Sparkles, CheckCircle, AlertCircle, XCircle, MessageCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useTracking } from "@/hooks/useTracking";
import { toast } from "sonner";
import { useFamilyMatches } from "@/hooks/useFamilyMatches";
import { ChatRequestsSection } from "./ChatRequestsSection";
import { ProfessionalFamilyChatModal } from "./ProfessionalFamilyChatModal";
import { VideoAvailabilityToggle } from "./VideoAvailabilityToggle";
import { ProfessionalFamilyMatchModal } from "./ProfessionalFamilyMatchModal";

export const DashboardFamilyMatches = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showFamilyMatchModal, setShowFamilyMatchModal] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<any>(null);
  const { trackEngagement } = useTracking();
  
  // Use the family matches hook with shift compatibility
  const { families, isLoading, dataLoaded } = useFamilyMatches(false);
  const [filteredFamilies, setFilteredFamilies] = useState(families);
  
  const [careTypes, setCareTypes] = useState<string[]>([]);
  const [specialNeeds, setSpecialNeeds] = useState<string[]>([]);
  const [scheduleType, setScheduleType] = useState<string>("all");
  const [maxDistance, setMaxDistance] = useState<number>(30);
  const [budgetRange, setBudgetRange] = useState<[number, number]>([15, 50]);
  const [minCompatibility, setMinCompatibility] = useState<number>(0);

  const careTypeOptions = ["Elderly Care", "Child Care", "Special Needs", "Medical Support", "Overnight Care", "Companionship", "Housekeeping"];
  
  const specialNeedsOptions = [
    "Alzheimer's", 
    "Mobility Assistance", 
    "Medication Management", 
    "Autism Care", 
    "Dementia Care", 
    "Meal Preparation",
    "Early Childhood Development",
    "Stroke Recovery",
    "Diabetes Management",
    "Parkinson's Care",
    "Physical Therapy Assistance",
    "Post-Surgery Care",
    "Hospice Support",
    "Respiratory Care"
  ];
  
  const scheduleOptions = [{
    value: "all",
    label: "Any Schedule"
  }, {
    value: "full-time",
    label: "Full-time"
  }, {
    value: "part-time",
    label: "Part-time"
  }, {
    value: "weekdays",
    label: "Weekdays"
  }, {
    value: "weekends",
    label: "Weekends"
  }, {
    value: "evenings",
    label: "Evenings"
  }, {
    value: "mornings",
    label: "Mornings"
  }, {
    value: "overnight",
    label: "Overnight"
  }];

  // Update filtered families when families data changes
  useEffect(() => {
    setFilteredFamilies(families);
  }, [families]);

  useEffect(() => {
    if (families.length === 0) return;
    const applyFilters = () => {
      let result = [...families];
      if (careTypes.length > 0) {
        result = result.filter(family => family.care_types?.some(type => careTypes.includes(type)));
      }
      if (specialNeeds.length > 0) {
        result = result.filter(family => family.special_needs?.some(need => specialNeeds.includes(need)));
      }
      if (scheduleType !== "all") {
        result = result.filter(family => family.care_schedule?.toLowerCase().includes(scheduleType.toLowerCase()));
      }
      result = result.filter(family => family.distance <= maxDistance);
      
      // Apply compatibility filter
      result = result.filter(family => (family.shift_compatibility_score || 0) >= minCompatibility);

      // Apply budget filter
      result = result.filter(family => {
        if (!family.budget_preferences) return true;
        
        const match = family.budget_preferences.match(/\$(\d+)(?:-(\d+))?/);
        if (!match) return true;
        
        const minBudget = parseInt(match[1]);
        const maxBudget = match[2] ? parseInt(match[2]) : minBudget;
        
        return (minBudget <= budgetRange[1] && maxBudget >= budgetRange[0]);
      });

      result.sort((a, b) => b.match_score - a.match_score);
      setFilteredFamilies(result);
    };
    applyFilters();
  }, [families, careTypes, specialNeeds, scheduleType, maxDistance, budgetRange, minCompatibility]);

  const handleCareTypeChange = (type: string) => {
    setCareTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const handleSpecialNeedsChange = (need: string) => {
    setSpecialNeeds(prev => prev.includes(need) ? prev.filter(n => n !== need) : [...prev, need]);
  };

  const handleChatWithFamily = (family: any) => {
    trackEngagement('chat_with_family_click', {
      family_id: family.id,
      source: 'dashboard_widget'
    });
    setSelectedFamily(family);
    setShowChatModal(true);
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getCompatibilityIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-3 w-3" />;
    if (score >= 60) return <AlertCircle className="h-3 w-3" />;
    return <XCircle className="h-3 w-3" />;
  };

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Add Chat Requests Section */}
      <ChatRequestsSection />
      
      <Card className="mb-8 border-l-4 border-l-primary">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl">Family Matches</CardTitle>
            <p className="text-sm text-gray-500">
              {filteredFamilies.length} families match your expertise and availability
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-1" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
            <VideoAvailabilityToggle />
          </div>
        </CardHeader>
        
        {showFilters && <CardContent className="border-b pb-4">
            <div className="space-y-4">
              <h3 className="font-medium text-sm">Care Types</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {careTypeOptions.map(type => <div key={type} className="flex items-center space-x-2">
                    <Checkbox id={`care-type-${type}`} checked={careTypes.includes(type)} onCheckedChange={() => handleCareTypeChange(type)} />
                    <Label htmlFor={`care-type-${type}`} className="text-sm">{type}</Label>
                  </div>)}
              </div>
              
              <h3 className="font-medium text-sm">Special Needs</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {specialNeedsOptions.map(need => <div key={need} className="flex items-center space-x-2">
                    <Checkbox id={`special-need-${need}`} checked={specialNeeds.includes(need)} onCheckedChange={() => handleSpecialNeedsChange(need)} />
                    <Label htmlFor={`special-need-${need}`} className="text-sm">{need}</Label>
                  </div>)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schedule" className="text-sm">Care Schedule</Label>
                  <Select value={scheduleType} onValueChange={setScheduleType}>
                    <SelectTrigger id="schedule">
                      <SelectValue placeholder="Select schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      {scheduleOptions.map(option => <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm flex justify-between">
                    <span>Maximum Distance: {maxDistance} km</span>
                  </Label>
                  <Slider value={[maxDistance]} min={1} max={50} step={1} onValueChange={value => setMaxDistance(value[0])} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm flex justify-between">
                    <span>Budget Range: ${budgetRange[0]}-${budgetRange[1]}/hr</span>
                  </Label>
                  <Slider 
                    value={budgetRange} 
                    min={15} 
                    max={50} 
                    step={5} 
                    onValueChange={(value) => setBudgetRange(value as [number, number])} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm flex justify-between">
                    <span>Min Schedule Compatibility: {minCompatibility}%</span>
                  </Label>
                  <Slider 
                    value={[minCompatibility]} 
                    min={0} 
                    max={100} 
                    step={10} 
                    onValueChange={value => setMinCompatibility(value[0])} 
                  />
                </div>
              </div>
            </div>
          </CardContent>}
        
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredFamilies.length > 0 ? (
            <div className="space-y-4">
              {filteredFamilies.map(family => (
                <div key={family.id} className={`p-4 rounded-lg border ${family.is_premium ? 'border-amber-300' : 'border-gray-200'} relative`}>
                  {family.is_premium && <div className="absolute top-0 right-0">
                      <Badge className="bg-amber-500 text-white uppercase font-bold rounded-tl-none rounded-tr-sm rounded-br-none rounded-bl-sm px-2">
                        Premium
                      </Badge>
                    </div>}
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex flex-col items-center sm:items-start sm:w-1/4">
                      <Avatar className="h-16 w-16 border-2 border-primary/20">
                        <AvatarImage src={family.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary-100 text-primary-800 text-xl">
                          FU
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="mt-2 text-center sm:text-left">
                        <h3 className="font-semibold">Family User</h3>
                        <div className="text-xs text-blue-600 mt-1">
                          * Name protected until connected
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-1">
                          ID: {family.id?.substring(0, 8) || 'N/A'}
                        </div>
                        <div className="flex items-center justify-center sm:justify-start gap-1 text-sm text-gray-500">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{family.location}</span>
                        </div>
                        <div className="mt-1 bg-primary-50 rounded px-2 py-1 text-center">
                          <span className="text-sm font-medium text-primary-700">{family.match_score}% Match</span>
                        </div>
                        
                        {/* Schedule Compatibility Indicator */}
                        {family.shift_compatibility_score !== undefined && (
                          <div className={`mt-1 rounded px-2 py-1 text-center border ${getCompatibilityColor(family.shift_compatibility_score)}`}>
                            <span className="text-xs font-medium flex items-center justify-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {family.shift_compatibility_score}% Schedule
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="sm:w-2/4 space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-gray-500" />
                          <span>{family.care_schedule}</span>
                        </div>
                        <span className="text-gray-300">|</span>
                        <div className="flex items-center gap-1">
                          <MapPinned className="h-3.5 w-3.5 text-gray-500" />
                          <span>{family.distance.toFixed(1)} km away</span>
                        </div>
                        <span className="text-gray-300">|</span>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5 text-gray-500" />
                          <span>{family.budget_preferences || 'Budget not specified'}</span>
                        </div>
                      </div>
                      
                      {/* Schedule Overlap Details */}
                      {family.schedule_overlap_details && (
                        <div className="text-sm">
                          <span className="font-medium block mb-1">Schedule Overlap:</span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs">{getCompatibilityIcon(family.shift_compatibility_score || 0)}</span>
                            <span className="text-gray-600">{family.schedule_overlap_details}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="text-sm">
                        <span className="font-medium block mb-1">Care Needs:</span>
                        <div className="flex flex-wrap gap-1">
                          {family.care_types?.map((type, i) => <Badge key={i} variant="outline" className="bg-gray-50">
                              {type}
                            </Badge>)}
                        </div>
                      </div>
                      
                      {family.special_needs && family.special_needs.length > 0 && <div className="text-sm">
                          <span className="font-medium block mb-1">Special Needs:</span>
                          <div className="flex flex-wrap gap-1">
                            {family.special_needs?.map((need, i) => <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {need}
                              </Badge>)}
                          </div>
                        </div>}
                      
                      {/* Match Explanation */}
                      {family.match_explanation && (
                        <div className="text-sm p-2 bg-blue-50 rounded border border-blue-200">
                          <span className="text-blue-700 flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            {family.match_explanation}
                          </span>
                        </div>
                      )}
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
                      
                      <Button 
                        variant="default" 
                        className="w-full flex items-center gap-2" 
                        onClick={() => handleChatWithFamily(family)}
                      >
                        <MessageCircle className="h-4 w-4" />
                        Chat with Family
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                className="w-full mt-2" 
                onClick={() => {
                  trackEngagement('view_family_match_modal_click', {
                    source: 'dashboard_widget'
                  });
                  setShowFamilyMatchModal(true);
                }}
              >
                View All Family Matches
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">No family matches found</p>
              <Button onClick={() => setShowFilters(true)} variant="outline">
                Adjust Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Professional Family Chat Modal */}
      {selectedFamily && (
        <ProfessionalFamilyChatModal
          open={showChatModal}
          onOpenChange={setShowChatModal}
          family={selectedFamily}
        />
      )}

      {/* Professional Family Match Modal */}
      <ProfessionalFamilyMatchModal
        open={showFamilyMatchModal}
        onOpenChange={setShowFamilyMatchModal}
        onChatWithFamily={(family) => {
          setSelectedFamily(family);
          setShowChatModal(true);
        }}
      />
    </>
  );
};
